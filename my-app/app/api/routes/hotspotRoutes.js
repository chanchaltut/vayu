// api/routes/hotspotRoutes.js
import express from 'express'
import { getHotspots, getHotspotById, triggerManualDetection } from '../controllers/hotspotController.js'

const router = express.Router()

// GET /hotspots
// Used by: Ankit's Google Maps frontend — fetches all active hotspots for map rendering
// Query params: ?hours=2 (default: last 2 hours) | ?severity=5 (filter by min severity)
router.get('/', getHotspots)

// GET /hotspots/:id
// Used by: Ankit's hotspot detail popup on the map
router.get('/:id', getHotspotById)

// POST /hotspots/detect
// Manually trigger hotspot detection (for demo — normally runs on schedule)
router.post('/detect', triggerManualDetection)

export default router
