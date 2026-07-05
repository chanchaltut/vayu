// api/controllers/forecastController.js
// Returns 24h AQI forecast for a given location
// Priority: Sumit's trained Vertex AI model → fallback: Gemini estimation

import { runQuery, DATASET } from '../config/bigquery.js'
import { geminiPro } from '../config/gemini.js'
import { createError } from '../middleware/errorHandler.js'

// ─── GET /forecast/:lat/:lon ──────────────────────────────────────────────────
export const getForecast = async (req, res, next) => {
  try {
    const lat = parseFloat(req.params.lat)
    const lon = parseFloat(req.params.lon)

    if (isNaN(lat) || isNaN(lon)) throw createError(400, 'Invalid lat/lon values')

    // ── Step 1: Fetch last 6 hours of readings near this location ──────────
    // Using a 0.05 degree radius (~5.5km) geo-filter
    const query = `
      SELECT temperature, aqi, timestamp
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${DATASET}.sensor_readings\`
      WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 6 HOUR)
        AND ABS(lat - @lat) < 0.05
        AND ABS(lon - @lon) < 0.05
      ORDER BY timestamp DESC
      LIMIT 20
    `
    const readings = await runQuery(query, { lat, lon })

    // ── Step 2: Try Sumit's trained model first ────────────────────────────
    // When Sumit's model is deployed, uncomment this block:
    /*
    if (process.env.SUMIT_MODEL_URL && readings.length > 0) {
      try {
        const avgTemp = readings.reduce((s, r) => s + r.temperature, 0) / readings.length
        const avgAqi  = readings.reduce((s, r) => s + r.aqi, 0) / readings.length

        const modelResponse = await fetch(process.env.SUMIT_MODEL_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ temperature: avgTemp, aqi: avgAqi }),
        })
        const modelResult = await modelResponse.json()

        return res.json({
          lat, lon,
          predicted_aqi_24h: modelResult.predicted_aqi,
          trend: modelResult.trend || getTrend(readings),
          confidence: modelResult.confidence || 0.85,
          source: 'sumit_model',
          current_avg_aqi: Math.round(avgAqi),
          current_avg_temperature: Math.round(avgTemp * 10) / 10,
          readings_used: readings.length,
        })
      } catch (modelErr) {
        console.warn('[FORECAST] Sumit model call failed, falling back to Gemini:', modelErr.message)
      }
    }
    */

    // ── Step 3: Gemini fallback (or primary if model not ready) ───────────
    let predicted_aqi_24h, trend, confidence, source

    if (readings.length === 0) {
      // No local data — return a neutral estimate
      return res.json({
        lat, lon,
        predicted_aqi_24h: 100,
        trend: 'stable',
        confidence: 0.3,
        source: 'default_estimate',
        current_avg_aqi: null,
        current_avg_temperature: null,
        readings_used: 0,
        message: 'No recent sensor readings near this location',
      })
    }

    const avgTemp = readings.reduce((s, r) => s + (r.temperature || 0), 0) / readings.length
    const avgAqi  = readings.reduce((s, r) => s + r.aqi, 0) / readings.length
    trend = getTrend(readings)

    const prompt = `
You are an air quality forecasting AI for the VAYU pollution monitoring system in India.

Location data for the past 6 hours near lat=${lat}, lon=${lon}:
- Number of sensor readings: ${readings.length}
- Average Temperature: ${avgTemp.toFixed(1)}°C
- Average AQI: ${Math.round(avgAqi)}
- AQI trend: ${trend}
- Recent readings (newest first): ${JSON.stringify(readings.slice(0, 5))}

Based on these readings and typical Indian urban pollution patterns (traffic peaks, wind, temperature inversions), predict the AQI 24 hours from now.

Respond ONLY with valid JSON:
{
  "predicted_aqi_24h": <integer>,
  "trend": "<rising | falling | stable>",
  "confidence": <float 0.0-1.0>,
  "reasoning": "<1 sentence>"
}
`

    const result = await geminiPro.generateContent(prompt)
    const parsed = JSON.parse(result.response.text())

    predicted_aqi_24h = parsed.predicted_aqi_24h
    trend = parsed.trend
    confidence = parsed.confidence
    source = 'gemini'

    res.json({
      lat,
      lon,
      predicted_aqi_24h,
      trend,
      confidence,
      source,
      current_avg_aqi: Math.round(avgAqi),
      current_avg_temperature: Math.round(avgTemp * 10) / 10,
      readings_used: readings.length,
      reasoning: parsed.reasoning,
    })
  } catch (err) {
    next(err)
  }
}

// ─── Helper: detect if AQI is rising, falling, or stable ────────────────────
const getTrend = (readings) => {
  if (readings.length < 2) return 'stable'
  const newest = readings[0].aqi
  const oldest = readings[readings.length - 1].aqi
  const diff = newest - oldest
  if (diff > 20)  return 'rising'
  if (diff < -20) return 'falling'
  return 'stable'
}
