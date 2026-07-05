// api/controllers/alertController.js
// Sends municipal alerts via SMS (Twilio) + translates to Hindi (Google Translation API)
// This is the 15% Inclusivity score — Hindi alerts for municipal officers

import { v4 as uuidv4 } from 'uuid'
import { TranslationServiceClient } from '@google-cloud/translate'
import { runQuery, bigquery, DATASET } from '../config/bigquery.js'
import { createError } from '../middleware/errorHandler.js'

const translationClient = new TranslationServiceClient({
  keyFilename: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
})

// ─── POST /alerts/trigger ─────────────────────────────────────────────────────
// Triggered when Gemini detects a confirmed hotspot (or manually by Ankit's dashboard)
// Body:
// {
//   "hotspot_id": "uuid-of-hotspot",
//   "channel": "sms",                     ← "sms" or "whatsapp"
//   "recipient": "+919876543210",          ← municipal officer number
//   "language": "hi"                       ← "hi" for Hindi, "en" for English (default: both)
// }

export const triggerAlert = async (req, res, next) => {
  try {
    const { hotspot_id, channel = 'sms', recipient, language = 'both' } = req.body

    if (!hotspot_id) throw createError(400, 'hotspot_id is required')
    if (!recipient)  throw createError(400, 'recipient phone number is required')

    // ── Step 1: Fetch hotspot details from BigQuery ────────────────────────
    const hotspotQuery = `
      SELECT * FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${DATASET}.hotspots\`
      WHERE id = @hotspot_id LIMIT 1
    `
    const [hotspot] = await runQuery(hotspotQuery, { hotspot_id })
    if (!hotspot) throw createError(404, `Hotspot ${hotspot_id} not found`)

    // ── Step 2: Build English alert message ───────────────────────────────
    const englishMessage = buildAlertMessage(hotspot, 'en')

    // ── Step 3: Translate to Hindi (Google Translation API) ──────────────
    // This is what wins the 15% Inclusivity score at the hackathon
    let hindiMessage = null
    try {
      const projectId = process.env.GOOGLE_CLOUD_PROJECT
      const [translation] = await translationClient.translateText({
        parent: `projects/${projectId}/locations/global`,
        contents: [englishMessage],
        mimeType: 'text/plain',
        sourceLanguageCode: 'en',
        targetLanguageCode: 'hi',
      })
      hindiMessage = translation.translations[0].translatedText
    } catch (translateErr) {
      console.warn('[ALERT] Translation failed, using English only:', translateErr.message)
      hindiMessage = englishMessage  // fallback
    }

    // ── Step 4: Determine message to send ────────────────────────────────
    const messageToSend = language === 'hi'   ? hindiMessage
                        : language === 'en'   ? englishMessage
                        : `${hindiMessage}\n\n${englishMessage}`  // 'both'

    // ── Step 5: Send SMS via Twilio ───────────────────────────────────────
    let twilioStatus = 'skipped'
    let twilioSid = null

    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        // Dynamic import to avoid crash if Twilio creds not set during dev
        const twilio = (await import('twilio')).default
        const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

        const smsResult = await twilioClient.messages.create({
          body: messageToSend,
          from: channel === 'whatsapp'
            ? `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`
            : process.env.TWILIO_PHONE_NUMBER,
          to: channel === 'whatsapp' ? `whatsapp:${recipient}` : recipient,
        })

        twilioSid = smsResult.sid
        twilioStatus = 'sent'
        console.log(`[ALERT] SMS sent to ${recipient} — SID: ${twilioSid}`)
      } catch (twilioErr) {
        console.error('[ALERT] Twilio send failed:', twilioErr.message)
        twilioStatus = 'failed'
      }
    } else {
      console.warn('[ALERT] Twilio creds not set. Alert message (would send):', messageToSend)
      twilioStatus = 'mock_sent'  // for demo without Twilio setup
    }

    // ── Step 6: Log alert to BigQuery ─────────────────────────────────────
    const alertId = uuidv4()
    const alertRow = {
      id: alertId,
      triggered_at: new Date().toISOString(),
      hotspot_id,
      message: messageToSend,
      channel,
      recipient,
      status: twilioStatus,
      twilio_sid: twilioSid || '',
    }

    await bigquery
      .dataset(DATASET)
      .table('alerts')
      .insert([alertRow])

    res.json({
      status: 'ok',
      alert_id: alertId,
      sms_status: twilioStatus,
      recipient,
      channel,
      message_en: englishMessage,
      message_hi: hindiMessage,
    })
  } catch (err) {
    next(err)
  }
}

// ─── GET /alerts ──────────────────────────────────────────────────────────────
export const getAlerts = async (req, res, next) => {
  try {
    const query = `
      SELECT id, triggered_at, hotspot_id, message, channel, status
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${DATASET}.alerts\`
      ORDER BY triggered_at DESC
      LIMIT 50
    `
    const rows = await runQuery(query)
    res.json({ count: rows.length, alerts: rows })
  } catch (err) {
    next(err)
  }
}

// ─── Helper: build the alert message ─────────────────────────────────────────
const buildAlertMessage = (hotspot, lang = 'en') => {
  const aqi = hotspot.avg_aqi
  const temp = hotspot.avg_temperature?.toFixed(1) || 'N/A'
  const pred = hotspot.predicted_aqi_24h
  const action = hotspot.action

  return (
    `🚨 VAYU POLLUTION ALERT\n` +
    `Location: ${hotspot.lat.toFixed(4)}°N, ${hotspot.lon.toFixed(4)}°E\n` +
    `Current AQI: ${aqi} (${getAqiLabel(aqi)})\n` +
    `Temperature: ${temp}°C\n` +
    `Predicted AQI (24h): ${pred}\n` +
    `Severity: ${hotspot.severity}/10 | Confidence: ${Math.round(hotspot.confidence * 100)}%\n` +
    `⚡ RECOMMENDED ACTION: ${action}\n` +
    `Detected at: ${new Date(hotspot.detected_at?.value || hotspot.detected_at).toLocaleString('en-IN')}`
  )
}

const getAqiLabel = (aqi) => {
  if (aqi <= 50)  return 'Good'
  if (aqi <= 100) return 'Satisfactory'
  if (aqi <= 200) return 'Moderate'
  if (aqi <= 300) return 'Poor'
  if (aqi <= 400) return 'Very Poor'
  return 'Severe ⚠️'
}
