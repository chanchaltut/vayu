// api/routes/forecastRoutes.js
import express from 'express'
import { getForecast } from '../controllers/forecastController.js'

const router = express.Router()

// GET /forecast/:lat/:lon
// Used by: Ankit's map — shows 24h AQI prediction tooltip on each hotspot pin
// Example: GET /forecast/28.6139/77.2090
router.get('/:lat/:lon', getForecast)

export default router
