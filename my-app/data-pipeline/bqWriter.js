// data-pipeline/bqWriter.js
// Writes sensor readings to BigQuery
// Called by sensorController and photoController

import { bigquery, DATASET } from '../api/config/bigquery.js'

// ─── Write a single sensor reading row ───────────────────────────────────────
export const writeSensorReading = async (reading) => {
  const row = {
    id:          reading.id,
    device_id:   reading.device_id,
    lat:         reading.lat,
    lon:         reading.lon,
    temperature: reading.temperature ?? null,
    aqi:         reading.aqi,
    source:      reading.source || 'arduino',
    timestamp:   reading.timestamp || new Date().toISOString(),
  }

  await bigquery
    .dataset(DATASET)
    .table('sensor_readings')
    .insert([row])

  console.log(`[BQ] Wrote sensor_reading: id=${row.id}, aqi=${row.aqi}, source=${row.source}`)
  return row
}

// ─── Write a detected hotspot row ─────────────────────────────────────────────
export const writeHotspot = async (hotspot) => {
  await bigquery
    .dataset(DATASET)
    .table('hotspots')
    .insert([hotspot])

  console.log(`[BQ] Wrote hotspot: id=${hotspot.id}, severity=${hotspot.severity}, aqi=${hotspot.avg_aqi}`)
  return hotspot
}
