// app/api/photos/handlers/uploadPhoto.ts
// POST /api/photos — citizen photo upload → Firebase Storage → Gemini Vision → BigQuery

import { NextRequest, NextResponse } from "next/server";
import { adminStorage } from "@/lib/firebaseAdmin";
import { bq, DATASET } from "@/lib/bigquery";
import { geminiVision } from "@/lib/gemini";
import { apiError, apiSuccess } from "@/lib/apiError";

interface GeminiVisionResult {
  smoke_detected: boolean;
  dust_detected: boolean;
  severity: number;
  pollution_type: "smoke" | "dust" | "haze" | "industrial" | "burning" | "mixed" | "none";
  estimated_aqi_impact: "low" | "moderate" | "high" | "very_high" | "hazardous";
  description: string;
  confidence: number;
}

function mapSeverityToAqi(severity: number): number {
  if (severity <= 1) return 25;
  if (severity <= 3) return 75;
  if (severity <= 5) return 150;
  if (severity <= 7) return 250;
  if (severity <= 9) return 350;
  return 450;
}

export async function uploadPhoto(req: NextRequest): Promise<NextResponse> {
  const formData = await req.formData();

  const imageFile  = formData.get("image") as File | null;
  const lat        = formData.get("lat") as string | null;
  const lon        = formData.get("lon") as string | null;
  const description = formData.get("description") as string | null;

  // ── Validate ──────────────────────────────────────────────────────────────
  if (!imageFile) return apiError("No image file provided", 400);
  if (!lat || !lon) return apiError("lat and lon are required", 400);

  const photoId = crypto.randomUUID();

  // ── Step 1: Upload to Firebase Storage ────────────────────────────────────
  const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
  const ext         = imageFile.type.split("/")[1];
  const fileName    = `citizen-uploads/${new Date().toISOString().split("T")[0]}/${photoId}.${ext}`;

  const bucket  = adminStorage.bucket();
  const fileRef = bucket.file(fileName);

  await fileRef.save(imageBuffer, {
    metadata: { contentType: imageFile.type },
  });
  await fileRef.makePublic();

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  console.log(`[PHOTO] Uploaded to Firebase Storage: ${fileName}`);

  // ── Step 2: Gemini Vision — analyse the image ──────────────────────────────
  const imageBase64 = imageBuffer.toString("base64");

  const visionPrompt = `
You are an AI air quality analyst for the VAYU pollution monitoring system in India.
A citizen has uploaded this photo from their neighbourhood.
${description ? `Citizen's description: "${description}"` : ""}

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
`;

  const visionResult = await geminiVision.generateContent([
    { inlineData: { data: imageBase64, mimeType: imageFile.type } },
    visionPrompt,
  ]);

  const visionText = visionResult.response.text();
  let analysis: GeminiVisionResult;

  try {
    const jsonMatch = visionText.match(/\{[\s\S]*\}/);
    analysis = JSON.parse(jsonMatch ? jsonMatch[0] : visionText);
  } catch {
    console.error("[PHOTO] Gemini Vision parse error:", visionText);
    return apiError("Failed to parse Gemini Vision response", 500);
  }

  console.log(`[PHOTO] Gemini Vision: smoke=${analysis.smoke_detected}, severity=${analysis.severity}/10`);

  // ── Step 3: Save to BigQuery sensor_readings (feeds into fusion engine) ───
  const photoReading = {
    id:          photoId,
    device_id:   "citizen-photo",
    lat:         parseFloat(lat),
    lon:         parseFloat(lon),
    temperature: null,
    aqi:         mapSeverityToAqi(analysis.severity),
    source:      "citizen_photo",
    timestamp:   new Date().toISOString(),
  };

  await bq.dataset(DATASET).table("sensor_readings").insert([photoReading]);

  return apiSuccess({
    photo_id:             photoId,
    image_url:            publicUrl,
    smoke_detected:       analysis.smoke_detected,
    dust_detected:        analysis.dust_detected,
    severity:             analysis.severity,
    pollution_type:       analysis.pollution_type,
    estimated_aqi_impact: analysis.estimated_aqi_impact,
    description:          analysis.description,
    confidence:           analysis.confidence,
    message:              "Photo analysed successfully. Thank you for reporting!",
  }, 201);
}
