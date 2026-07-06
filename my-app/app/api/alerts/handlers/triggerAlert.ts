// app/api/alerts/handlers/triggerAlert.ts
// POST /api/alerts — triggers municipal alert: builds message, translates to Hindi, sends SMS via Twilio

import { NextRequest, NextResponse } from "next/server";
import { runQuery, bq, DATASET } from "@/lib/bigquery";
import { apiError, apiSuccess } from "@/lib/apiError";

interface AlertBody {
  hotspot_id: string;
  channel?: "sms" | "whatsapp";
  recipient: string;
  language?: "en" | "hi" | "both";
}

interface HotspotRow {
  id: string;
  lat: number;
  lon: number;
  severity: number;
  confidence: number;
  avg_temperature: number;
  avg_aqi: number;
  predicted_aqi_24h: number;
  action: string;
  detected_at: { value: string } | string;
}

function getAqiLabel(aqi: number): string {
  if (aqi <= 50)  return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  return "Severe ⚠️";
}

function buildAlertMessage(hotspot: HotspotRow): string {
  const detectedAt = typeof hotspot.detected_at === "object"
    ? hotspot.detected_at.value
    : hotspot.detected_at;

  return (
    `🚨 VAYU POLLUTION ALERT\n` +
    `Location: ${hotspot.lat.toFixed(4)}°N, ${hotspot.lon.toFixed(4)}°E\n` +
    `Current AQI: ${hotspot.avg_aqi} (${getAqiLabel(hotspot.avg_aqi)})\n` +
    `Temperature: ${hotspot.avg_temperature?.toFixed(1) || "N/A"}°C\n` +
    `Predicted AQI (24h): ${hotspot.predicted_aqi_24h}\n` +
    `Severity: ${hotspot.severity}/10 | Confidence: ${Math.round(hotspot.confidence * 100)}%\n` +
    `⚡ RECOMMENDED ACTION: ${hotspot.action}\n` +
    `Detected at: ${new Date(detectedAt).toLocaleString("en-IN")}`
  );
}

export async function triggerAlert(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as Partial<AlertBody>;
  const { hotspot_id, channel = "sms", recipient, language = "both" } = body;

  if (!hotspot_id) return apiError("hotspot_id is required", 400);
  if (!recipient)  return apiError("recipient phone number is required", 400);

  // ── Step 1: Fetch hotspot from BigQuery ────────────────────────────────────
  const sql = `
    SELECT * FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${DATASET}.hotspots\`
    WHERE id = @hotspot_id LIMIT 1
  `;
  const [hotspot] = await runQuery<HotspotRow>(sql, { hotspot_id });
  if (!hotspot) return apiError(`Hotspot ${hotspot_id} not found`, 404);

  // ── Step 2: Build English message ─────────────────────────────────────────
  const englishMessage = buildAlertMessage(hotspot);

  // ── Step 3: Translate to Hindi via Google Translation API ─────────────────
  let hindiMessage = englishMessage; // fallback
  try {
    const { TranslationServiceClient } = await import("@google-cloud/translate");
    const translationClient = new TranslationServiceClient();
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    const [translation] = await translationClient.translateText({
      parent:             `projects/${projectId}/locations/global`,
      contents:           [englishMessage],
      mimeType:           "text/plain",
      sourceLanguageCode: "en",
      targetLanguageCode: "hi",
    });
    hindiMessage = translation.translations?.[0]?.translatedText || englishMessage;
  } catch (err) {
    console.warn("[ALERT] Translation failed, using English only:", err);
  }

  const messageToSend =
    language === "hi"  ? hindiMessage :
    language === "en"  ? englishMessage :
    `${hindiMessage}\n\n${englishMessage}`;

  // ── Step 4: Send via Twilio (skipped if creds not set) ────────────────────
  let twilioStatus: string = "skipped";
  let twilioSid: string | null = null;

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilio      = (await import("twilio")).default;
      const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const smsResult   = await twilioClient.messages.create({
        body: messageToSend,
        from: channel === "whatsapp"
          ? `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`
          : process.env.TWILIO_PHONE_NUMBER!,
        to: channel === "whatsapp" ? `whatsapp:${recipient}` : recipient,
      });
      twilioSid    = smsResult.sid;
      twilioStatus = "sent";
      console.log(`[ALERT] SMS sent to ${recipient} — SID: ${twilioSid}`);
    } catch (err) {
      console.error("[ALERT] Twilio send failed:", err);
      twilioStatus = "failed";
    }
  } else {
    console.warn("[ALERT] Twilio creds not set. Mock alert:", messageToSend);
    twilioStatus = "mock_sent";
  }

  // ── Step 5: Log alert to BigQuery ─────────────────────────────────────────
  const alertId  = crypto.randomUUID();
  const alertRow = {
    id:           alertId,
    triggered_at: new Date().toISOString(),
    hotspot_id,
    message:      messageToSend,
    channel,
    recipient,
    status:       twilioStatus,
    twilio_sid:   twilioSid || "",
  };
  await bq.dataset(DATASET).table("alerts").insert([alertRow]);

  return apiSuccess({
    alert_id:   alertId,
    sms_status: twilioStatus,
    recipient,
    channel,
    message_en: englishMessage,
    message_hi: hindiMessage,
  }, 201);
}
