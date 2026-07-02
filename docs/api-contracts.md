# API Contracts — VAYU

Defines the data contracts between modules so everyone can build independently without blocking each other. Update this file first whenever a shape changes, then notify the team.

## 1. Sensor Payload (Parth → Chanchal)

Arduino pushes this JSON to the Cloud Function ingestion endpoint:

```json
{
  "device_id": "arduino-001",
  "timestamp": "2026-06-30T10:15:00Z",
  "lat": 28.6139,
  "lng": 77.2090,
  "pm25": 142.5,
  "smoke_level": 0.78
}
```

## 2. Citizen Photo Upload (Ankit → Chanchal)

```json
{
  "user_id": "anon-or-uid",
  "timestamp": "2026-06-30T10:15:00Z",
  "lat": 28.6139,
  "lng": 77.2090,
  "image_url": "gs://bucket/uploads/photo123.jpg"
}
```

## 3. Smoke Detection Model Output (Sumit → Chanchal)

```json
{
  "image_url": "gs://bucket/uploads/photo123.jpg",
  "smoke_detected": true,
  "confidence": 0.91,
  "severity": "high"
}
```

## 4. Forecast Model Output (Sumit → Chanchal)

```json
{
  "location_id": "geohash-or-grid-id",
  "predicted_aqi_24h": 312,
  "spike_probability": 0.84,
  "generated_at": "2026-06-30T10:15:00Z"
}
```

## 5. Fused Hotspot Object (Chanchal → Ankit)

This is what the backend API returns to the frontend for map rendering:

```json
{
  "hotspot_id": "hs_001",
  "lat": 28.6139,
  "lng": 77.2090,
  "current_aqi": 256,
  "predicted_aqi_24h": 312,
  "severity": "high",
  "sources": ["sensor", "citizen_photo", "satellite"],
  "last_updated": "2026-06-30T10:15:00Z"
}
```

## 6. Municipal Alert Trigger (Chanchal → SMS service, surfaced in Ankit's dashboard)

```json
{
  "alert_id": "al_001",
  "hotspot_id": "hs_001",
  "message": "High pollution detected near <location>. Dispatch cleanup crew.",
  "recipients": ["+91XXXXXXXXXX"],
  "status": "sent"
}
```

---

**Rule of thumb:** if you need to change a field name or type here, ping the consuming teammate before merging — don't let contract drift get discovered at integration time.
