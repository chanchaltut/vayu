# VAYU Backend — Chanchal's Domain

Built with **Node.js + Express** (your MERN stack — same thing).

---

## Folder Structure

```
backend/
├── api/
│   ├── server.js                    ← Entry point (your index.js)
│   ├── config/
│   │   ├── firebase.js              ← Firebase Admin SDK init
│   │   ├── bigquery.js              ← BigQuery client
│   │   └── gemini.js                ← Gemini API client
│   ├── routes/
│   │   ├── sensorRoutes.js          ← POST /sensors/ingest
│   │   ├── photoRoutes.js           ← POST /photos/upload
│   │   ├── hotspotRoutes.js         ← GET  /hotspots
│   │   ├── forecastRoutes.js        ← GET  /forecast/:lat/:lon
│   │   └── alertRoutes.js           ← POST /alerts/trigger
│   ├── controllers/
│   │   ├── sensorController.js
│   │   ├── photoController.js
│   │   ├── hotspotController.js
│   │   ├── forecastController.js
│   │   └── alertController.js
│   └── middleware/
│       └── errorHandler.js
├── data-pipeline/
│   └── bqWriter.js                  ← Writes rows to BigQuery
├── bigquery-gemini-fusion/
│   ├── schema.sql                   ← Run this in BigQuery console
│   ├── fusionEngine.js              ← Core Gemini AI call
│   └── hotspotDetector.js           ← Orchestrator (clusters → Gemini → save)
├── cloud-functions/
│   └── scheduledFusion/
│       └── index.js                 ← Cloud Function (runs every 15 min)
├── .env.example                     ← Copy to .env and fill in values
├── .gitignore
├── package.json
└── Dockerfile
```

---

## Setup — Step by Step

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Set up environment variables
```bash
# Copy the template
cp .env.example .env

# Fill in your real values in .env:
# - GEMINI_API_KEY (from console.cloud.google.com → API Keys)
# - GOOGLE_CLOUD_PROJECT (your GCP project ID)
# - FIREBASE_DATABASE_URL (from Firebase console → RTDB)
# - FIREBASE_STORAGE_BUCKET (from Firebase console → Storage)
# - FIREBASE_SERVICE_ACCOUNT_PATH (path to downloaded JSON key)
```

### 3. Download Firebase service account key
1. Go to Firebase console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file as `backend/firebase-service-account.json`
4. This file is gitignored — **never commit it**

### 4. Create BigQuery tables
1. Go to console.cloud.google.com → BigQuery
2. Create a dataset named `vayu`
3. Run the SQL in `bigquery-gemini-fusion/schema.sql`

### 5. Run locally
```bash
npm run dev
# Server starts at http://localhost:8000
# Visit http://localhost:8000 to see the health check
```

---

## API Endpoints

| Method | Endpoint | Used By | Description |
|---|---|---|---|
| GET | `/` | Anyone | Health check |
| POST | `/sensors/ingest` | Parth's Arduino | Ingest sensor reading |
| GET | `/sensors/recent` | Debugging | Last 50 readings |
| POST | `/photos/upload` | Ankit's UI | Citizen photo + Gemini Vision |
| GET | `/hotspots` | Ankit's map | Active hotspots for Google Maps |
| GET | `/hotspots/:id` | Ankit's map popup | Single hotspot detail |
| POST | `/hotspots/detect` | Demo trigger | Manually run Gemini fusion |
| GET | `/forecast/:lat/:lon` | Ankit's map | 24h AQI prediction |
| POST | `/alerts/trigger` | Dashboard | Send Hindi SMS alert |
| GET | `/alerts` | Dashboard | Alert history |

---

## Test Endpoints Manually (using curl or Postman)

```bash
# Health check
curl http://localhost:8000/

# Simulate Arduino sensor POST (what Parth's TinkerCAD will send)
curl -X POST http://localhost:8000/sensors/ingest \
  -H "Content-Type: application/json" \
  -d '{"device_id":"arduino-01","lat":28.6139,"lon":77.2090,"temperature":36.2,"aqi":287}'

# Get hotspots (for Ankit's map)
curl http://localhost:8000/hotspots

# Trigger manual hotspot detection (for demo)
curl -X POST http://localhost:8000/hotspots/detect

# Get 24h forecast
curl http://localhost:8000/forecast/28.6139/77.2090

# Send alert
curl -X POST http://localhost:8000/alerts/trigger \
  -H "Content-Type: application/json" \
  -d '{"hotspot_id":"your-id","channel":"sms","recipient":"+919876543210","language":"both"}'
```

---

## Deploy to Cloud Run

```bash
# Make sure you're logged in to gcloud
gcloud auth login
gcloud config set project your-gcp-project-id

# Deploy (from backend/ folder)
gcloud run deploy vayu-backend \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=xxx,GOOGLE_CLOUD_PROJECT=xxx,BIGQUERY_DATASET=vayu,FIREBASE_DATABASE_URL=xxx,FIREBASE_STORAGE_BUCKET=xxx"

# After deploy, share the URL with Ankit so he can update his API_BASE_URL
```

---

## Sensor Payload (Agreed with Parth)

```json
{
  "device_id": "arduino-vayu-01",
  "lat": 28.6139,
  "lon": 77.2090,
  "temperature": 34.5,
  "aqi": 187,
  "timestamp": "2026-07-05T08:30:00Z"
}
```

> If Parth changes field names, update `sensorController.js` accordingly.

---

## Integration Notes

- **Sumit's model** → when ready, set `SUMIT_MODEL_URL` in `.env`. The `forecastController.js` has the code block ready (just uncomment it).
- **Ankit's frontend** → give him the mock `/hotspots` JSON shape — he can build against it immediately.
- **Parth's TinkerCAD** → the `/sensors/ingest` endpoint accepts the payload above. Works over HTTP from TinkerCAD's ESP8266 simulation.
