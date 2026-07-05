// api/controllers/photoController.js
// Handles citizen photo uploads
// Flow: receive image → upload to Firebase Storage → Gemini Vision analysis → save to BigQuery

import { v4 as uuidv4 } from 'uuid'
import { storage, db } from '../config/firebase.js'
import { geminiVision } from '../config/gemini.js'
import { writeSensorReading } from '../../data-pipeline/bqWriter.js'
import { createError } from '../middleware/errorHandler.js'

// ─── POST /photos/upload ─────────────────────────────────────────────────────
// Ankit's frontend sends: multipart/form-data with fields:
//   image       → the photo file (JPEG/PNG/WebP)
//   lat         → location latitude
//   lon         → location longitude
//   description → optional text description from citizen ("I can see thick black smoke")

export const uploadPhoto = async (req, res, next) => {
  try {
    const { lat, lon, description } = req.body
    const imageFile = req.file

    // ── Validate ──────────────────────────────────────────────────────────
    if (!imageFile) throw createError(400, 'No image file provided')
    if (!lat || !lon) throw createError(400, 'lat and lon are required')

    const photoId = uuidv4()

    // ── Step 1: Upload to Firebase Storage ────────────────────────────────
    const bucket = storage.bucket()
    const fileName = `citizen-uploads/${new Date().toISOString().split('T')[0]}/${photoId}.${imageFile.mimetype.split('/')[1]}`
    const fileRef = bucket.file(fileName)

    await fileRef.save(imageFile.buffer, {
      metadata: { contentType: imageFile.mimetype },
    })

    // Make it publicly readable (for Ankit's map to display the photo)
    await fileRef.makePublic()
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`

    console.log(`[PHOTO] Uploaded to Firebase Storage: ${fileName}`)

    // ── Step 2: Gemini Vision — analyse the image ──────────────────────────
    // Convert image buffer to base64 for Gemini multimodal input
    const imageBase64 = imageFile.buffer.toString('base64')

    const visionPrompt = `
You are an AI air quality analyst for the VAYU pollution monitoring system in India.
A citizen has uploaded this photo from their neighbourhood.
${description ? `Citizen's description: "${description}"` : ''}

Analyse the image for visible air pollution indicators (smoke, dust, haze, burning, industrial emissions).

Respond ONLY with valid JSON in this exact format — no extra text:
{
  "smoke_detected": true or false,
  "dust_detected": true or false,
  "severity": <integer 0-10, where 0=clean air, 10=extremely hazardous>,
  "pollution_type": "<one of: smoke | dust | haze | industrial | burning | mixed | none>",
  "estimated_aqi_impact": "<one of: low | moderate | high | very_high | hazardous>",
  "description": "<1-2 sentence factual description of what you see>",
  "confidence": <float 0.0-1.0>
}
`

    const visionResult = await geminiVision.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: imageFile.mimetype,
        },
      },
      visionPrompt,
    ])

    const visionText = visionResult.response.text()

    // Parse Gemini's JSON response
    let analysis
    try {
      // responseMimeType: 'application/json' should give clean JSON, but strip just in case
      const jsonMatch = visionText.match(/\{[\s\S]*\}/)
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : visionText)
    } catch {
      console.error('[PHOTO] Gemini Vision response parse error:', visionText)
      throw createError(500, 'Failed to parse Gemini Vision response')
    }

    console.log(`[PHOTO] Gemini Vision: smoke=${analysis.smoke_detected}, severity=${analysis.severity}/10`)

    // ── Step 3: Save result to BigQuery as a 'citizen_photo' reading ──────
    // This feeds into the Gemini fusion engine alongside Arduino readings
    const photoReading = {
      id: photoId,
      device_id: 'citizen-photo',
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      temperature: null,           // not available from photo
      aqi: mapSeverityToAqi(analysis.severity),  // estimate AQI from visual severity
      source: 'citizen_photo',
      timestamp: new Date().toISOString(),
    }

    await writeSensorReading(photoReading)

    // Also push to Firebase RTDB for real-time map update
    await db.ref(`photo_reports/${photoId}`).set({
      ...photoReading,
      image_url: publicUrl,
      analysis,
    })

    // ── Respond ───────────────────────────────────────────────────────────
    res.status(200).json({
      status: 'ok',
      photo_id: photoId,
      image_url: publicUrl,
      smoke_detected: analysis.smoke_detected,
      dust_detected: analysis.dust_detected,
      severity: analysis.severity,
      pollution_type: analysis.pollution_type,
      estimated_aqi_impact: analysis.estimated_aqi_impact,
      description: analysis.description,
      confidence: analysis.confidence,
      message: 'Photo analysed successfully. Thank you for reporting!',
    })
  } catch (err) {
    next(err)
  }
}

// ─── Helper: map visual severity (0-10) to approximate AQI ──────────────────
// Used so citizen photos integrate smoothly with sensor_readings table
const mapSeverityToAqi = (severity) => {
  if (severity <= 1) return 25     // Good
  if (severity <= 3) return 75     // Satisfactory
  if (severity <= 5) return 150    // Moderate
  if (severity <= 7) return 250    // Poor
  if (severity <= 9) return 350    // Very Poor
  return 450                        // Severe
}
