// api/routes/sensorRoutes.js
import express from 'express'
import { ingestSensor, getRecentReadings } from '../controllers/sensorController.js'

const router = express.Router()

// POST /sensors/ingest
// Used by: Parth's Arduino (TinkerCAD sim POSTs here)
// Body: { device_id, lat, lon, temperature, aqi, timestamp? }
router.post('/ingest', ingestSensor)

// GET /sensors/recent
// Used by: dashboard, debugging
// Returns last 50 sensor readings from BigQuery
router.get('/recent', getRecentReadings)

export default router
