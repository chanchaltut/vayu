// api/controllers/sensorController.js
// Handles Arduino sensor data ingestion
// Writes to: Firebase RTDB (live stream) + BigQuery (analytics/fusion)

import { v4 as uuidv4 } from 'uuid'
import { db } from '../config/firebase.js'
import { writeSensorReading } from '../../data-pipeline/bqWriter.js'
import { runQuery, DATASET } from '../config/bigquery.js'
import { createError } from '../middleware/errorHandler.js'

// ─── POST /sensors/ingest ────────────────────────────────────────────────────
// Parth's Arduino TinkerCAD simulation POSTs to this endpoint
// Expected body:
// {
//   "device_id": "arduino-vayu-01",
//   "lat": 28.6139,
//   "lon": 77.2090,
//   "temperature": 34.5,   ← °C
//   "aqi": 187,            ← AQI value (Sumit's model trains on this + temperature)
//   "timestamp": "2026-07-05T08:30:00Z"  ← optional, defaults to now
// }

export const ingestSensor = async (req, res, next) => {
  try {
    const { device_id, lat, lon, temperature, aqi, timestamp } = req.body

    // ── Validate required fields ────────────────────────────────────────────
    if (!device_id) throw createError(400, 'Missing required field: device_id')
    if (lat === undefined || lat === null) throw createError(400, 'Missing required field: lat')
    if (lon === undefined || lon === null) throw createError(400, 'Missing required field: lon')
    if (temperature === undefined || temperature === null) throw createError(400, 'Missing required field: temperature')
    if (aqi === undefined || aqi === null) throw createError(400, 'Missing required field: aqi')

    // ── Build reading object ────────────────────────────────────────────────
    const reading = {
      id: uuidv4(),
      device_id: String(device_id),
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      temperature: parseFloat(temperature),
      aqi: parseInt(aqi),
      source: 'arduino',
      timestamp: timestamp || new Date().toISOString(),
    }

    // ── Write to Firebase RTDB ──────────────────────────────────────────────
    // Ankit's frontend listens to this node for real-time map updates
    await db.ref(`sensor_readings/${reading.id}`).set(reading)

    // Also keep a "latest_by_device" node so frontend can show current status per device
    await db.ref(`latest_by_device/${reading.device_id}`).set(reading)

    // ── Write to BigQuery ───────────────────────────────────────────────────
    // Used by Gemini fusion engine every 15 minutes to detect hotspots
    await writeSensorReading(reading)

    console.log(`[SENSOR] Ingested: device=${reading.device_id}, aqi=${reading.aqi}, temp=${reading.temperature}°C`)

    res.status(200).json({
      status: 'ok',
      reading_id: reading.id,
      message: 'Sensor reading recorded successfully',
      data: reading,
    })
  } catch (err) {
    next(err)
  }
}

// ─── GET /sensors/recent ─────────────────────────────────────────────────────
// Returns last 50 sensor readings — useful for debugging & dashboard stats

export const getRecentReadings = async (req, res, next) => {
  try {
    const query = `
      SELECT id, device_id, lat, lon, temperature, aqi, source, timestamp
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${DATASET}.sensor_readings\`
      ORDER BY timestamp DESC
      LIMIT 50
    `
    const rows = await runQuery(query)
    res.json({ count: rows.length, readings: rows })
  } catch (err) {
    next(err)
  }
}
