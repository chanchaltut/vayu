-- bigquery-gemini-fusion/schema.sql
-- Run these commands in BigQuery console (console.cloud.google.com → BigQuery)
-- or via: bq mk --table vayu.sensor_readings schema.json
--
-- STEP 1: Create the dataset first
-- bq mk --dataset --location=US your-project-id:vayu

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 1: sensor_readings
-- Stores all incoming data: Arduino sensor readings + citizen photo-derived readings
-- Both Temperature and AQI are stored — Sumit's model trains on both
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `vayu.sensor_readings` (
  id            STRING    NOT NULL,
  device_id     STRING    NOT NULL,
  lat           FLOAT64   NOT NULL,
  lon           FLOAT64   NOT NULL,
  temperature   FLOAT64,            -- °C — from Arduino (null for citizen_photo source)
  aqi           INT64     NOT NULL,  -- AQI value — from Arduino OR estimated from photo severity
  source        STRING    NOT NULL,  -- 'arduino' | 'citizen_photo'
  timestamp     TIMESTAMP NOT NULL
)
PARTITION BY DATE(timestamp)         -- partitioned by day for cheaper queries
OPTIONS (
  description = 'Raw sensor readings from Arduino nodes and citizen photo reports'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 2: hotspots
-- AI-detected pollution hotspots — output of the Gemini fusion engine
-- This is what Ankit's Google Maps renders as coloured pins
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `vayu.hotspots` (
  id                STRING    NOT NULL,
  detected_at       TIMESTAMP NOT NULL,
  lat               FLOAT64   NOT NULL,   -- centre of the hotspot cluster
  lon               FLOAT64   NOT NULL,
  severity          INT64     NOT NULL,   -- 1-10 (Gemini's assessment)
  confidence        FLOAT64   NOT NULL,   -- 0.0-1.0 (Gemini's confidence)
  avg_temperature   FLOAT64,              -- average °C across cluster readings
  avg_aqi           INT64,               -- average AQI across cluster readings
  predicted_aqi_24h INT64,               -- Gemini's 24h AQI forecast
  action            STRING,              -- "Deploy water-mist cannon" | "Send cleanup crew" | etc.
  gemini_reasoning  STRING,              -- Gemini's 1-2 sentence explanation
  reading_count     INT64                -- how many sensor readings fed this detection
)
PARTITION BY DATE(detected_at)
OPTIONS (
  description = 'AI-detected pollution hotspots from Gemini fusion engine'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 3: alerts
-- Log of all municipal alerts sent (SMS/WhatsApp)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `vayu.alerts` (
  id            STRING    NOT NULL,
  triggered_at  TIMESTAMP NOT NULL,
  hotspot_id    STRING    NOT NULL,
  message       STRING,                 -- full message text (in Hindi or English)
  channel       STRING,                 -- 'sms' | 'whatsapp'
  recipient     STRING,                 -- phone number
  status        STRING,                 -- 'sent' | 'failed' | 'mock_sent'
  twilio_sid    STRING                  -- Twilio message SID (for tracking)
)
PARTITION BY DATE(triggered_at)
OPTIONS (
  description = 'Municipal alert log — SMS and WhatsApp notifications sent to officers'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Useful queries for debugging / dashboard
-- ─────────────────────────────────────────────────────────────────────────────

-- Check recent sensor readings
-- SELECT * FROM `vayu.sensor_readings` ORDER BY timestamp DESC LIMIT 20;

-- Check active hotspots (last 2 hours)
-- SELECT * FROM `vayu.hotspots`
-- WHERE detected_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 2 HOUR)
-- ORDER BY severity DESC;

-- Check alert history
-- SELECT * FROM `vayu.alerts` ORDER BY triggered_at DESC LIMIT 10;

-- Average AQI per hour (for charts)
-- SELECT
--   TIMESTAMP_TRUNC(timestamp, HOUR) AS hour,
--   ROUND(AVG(aqi), 1) AS avg_aqi,
--   ROUND(AVG(temperature), 1) AS avg_temp,
--   COUNT(*) AS readings
-- FROM `vayu.sensor_readings`
-- WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
-- GROUP BY hour
-- ORDER BY hour DESC;
