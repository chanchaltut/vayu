// api/server.js
// VAYU Backend — Main Entry Point
// This is your index.js equivalent from MERN projects

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Routes
import sensorRoutes from './routes/sensorRoutes.js'
import photoRoutes from './routes/photoRoutes.js'
import hotspotRoutes from './routes/hotspotRoutes.js'
import forecastRoutes from './routes/forecastRoutes.js'
import alertRoutes from './routes/alertRoutes.js'

// Middleware
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*', // In production: replace with Ankit's deployed frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'vayu-backend',
    version: '1.0.0',
    description: 'VAYU — CleanAir & Clear Streets Pollution Hotspot Detection API',
    endpoints: {
      ingestSensor:  'POST /sensors/ingest',
      uploadPhoto:   'POST /photos/upload',
      getHotspots:   'GET  /hotspots',
      getForecast:   'GET  /forecast/:lat/:lon',
      triggerAlert:  'POST /alerts/trigger',
    },
    timestamp: new Date().toISOString(),
  })
})

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/sensors',  sensorRoutes)
app.use('/photos',   photoRoutes)
app.use('/hotspots', hotspotRoutes)
app.use('/forecast', forecastRoutes)
app.use('/alerts',   alertRoutes)

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
})

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler)

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║        VAYU Backend is running 🌿        ║
  ║  http://localhost:${PORT}                   ║
  ║  Health: GET http://localhost:${PORT}/       ║
  ╚══════════════════════════════════════════╝
  `)
})

export default app
