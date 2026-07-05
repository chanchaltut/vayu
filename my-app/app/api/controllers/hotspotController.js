// api/controllers/hotspotController.js
// Fetches detected hotspots from BigQuery for Ankit's Google Maps UI
// Also provides a manual trigger for the Gemini fusion detector (good for demos)

import { runQuery, DATASET } from '../config/bigquery.js'
import { detectAndSaveHotspots } from '../../bigquery-gemini-fusion/hotspotDetector.js'
import { createError } from '../middleware/errorHandler.js'

// ─── GET /hotspots ────────────────────────────────────────────────────────────
// Returns all hotspots from the last N hours — formatted for Google Maps markers
// Ankit maps each item as a coloured pin: red (severity 8-10), orange (5-7), yellow (1-4)

export const getHotspots = async (req, res, next) => {
  try {
    const hours = parseInt(req.query.hours) || 2
    const minSeverity = parseInt(req.query.severity) || 1

    const query = `
      SELECT
        id,
        detected_at,
        lat,
        lon,
        severity,
        confidence,
        avg_temperature,
        avg_aqi,
        predicted_aqi_24h,
        action,
        gemini_reasoning,
        reading_count
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${DATASET}.hotspots\`
      WHERE detected_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @hours HOUR)
        AND severity >= @minSeverity
      ORDER BY severity DESC, detected_at DESC
      LIMIT 100
    `

    const rows = await runQuery(query, { hours, minSeverity })

    // Format for GeoJSON-style output — Ankit can use this directly with Google Maps API
    const hotspots = rows.map((row) => ({
      id: row.id,
      lat: row.lat,
      lon: row.lon,
      severity: row.severity,
      confidence: row.confidence,
      avg_temperature: row.avg_temperature,
      avg_aqi: row.avg_aqi,
      predicted_aqi_24h: row.predicted_aqi_24h,
      action: row.action,
      reasoning: row.gemini_reasoning,
      reading_count: row.reading_count,
      detected_at: row.detected_at?.value || row.detected_at,
      // Colour hint for Ankit's map markers
      colour: row.severity >= 8 ? 'red' : row.severity >= 5 ? 'orange' : 'yellow',
      // AQI category label
      aqi_category: getAqiCategory(row.avg_aqi),
    }))

    res.json({
      count: hotspots.length,
      hours_window: hours,
      hotspots,
    })
  } catch (err) {
    next(err)
  }
}

// ─── GET /hotspots/:id ────────────────────────────────────────────────────────
export const getHotspotById = async (req, res, next) => {
  try {
    const { id } = req.params

    const query = `
      SELECT *
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${DATASET}.hotspots\`
      WHERE id = @id
      LIMIT 1
    `
    const rows = await runQuery(query, { id })

    if (!rows.length) throw createError(404, `Hotspot with id=${id} not found`)

    res.json(rows[0])
  } catch (err) {
    next(err)
  }
}

// ─── POST /hotspots/detect ───────────────────────────────────────────────────
// Manually runs the Gemini fusion hotspot detection
// Great for live demo: press button → Gemini runs → new hotspot appears on map

export const triggerManualDetection = async (req, res, next) => {
  try {
    console.log('[HOTSPOT] Manual detection triggered')
    const result = await detectAndSaveHotspots()

    res.json({
      status: 'ok',
      message: 'Hotspot detection completed',
      hotspots_detected: result.hotspotsDetected,
      hotspots_saved: result.hotspotsSaved,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    next(err)
  }
}

// ─── Helper: AQI → category label (Indian AQI scale) ────────────────────────
const getAqiCategory = (aqi) => {
  if (!aqi) return 'Unknown'
  if (aqi <= 50)  return 'Good'
  if (aqi <= 100) return 'Satisfactory'
  if (aqi <= 200) return 'Moderate'
  if (aqi <= 300) return 'Poor'
  if (aqi <= 400) return 'Very Poor'
  return 'Severe'
}
