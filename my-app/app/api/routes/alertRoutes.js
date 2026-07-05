// api/routes/alertRoutes.js
import express from 'express'
import { triggerAlert, getAlerts } from '../controllers/alertController.js'

const router = express.Router()

// POST /alerts/trigger
// Sends an SMS/WhatsApp alert to a municipal officer about a confirmed hotspot
// Body: { hotspot_id, channel, recipient }
router.post('/trigger', triggerAlert)

// GET /alerts
// Returns recent alerts — for the municipal dashboard panel
router.get('/', getAlerts)

export default router
