// bigquery-gemini-fusion/hotspotDetector.ts
// Orchestrator: queries BigQuery → groups into geo-clusters → calls Gemini fusion → saves hotspots
// Runs every 15 minutes via Cloud Scheduler, or manually via: npm run detect-hotspots

import { v4 as uuidv4 } from "uuid";
import { runQuery, DATASET } from "../lib/bigquery";
import { writeHotspot } from "../data-pipeline/bqWriter";
import { runFusion } from "./fusionEngine";
import { SensorReadingRow } from "../data-pipeline/bqWriter";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GeoCluster {
  lat: number;
  lon: number;
  readings: SensorReadingRow[];
}

interface DetectionSummary {
  hotspotsDetected: number;
  hotspotsSaved: number;
}

// ─── Main exported function ────────────────────────────────────────────────────
export const detectAndSaveHotspots = async (): Promise<DetectionSummary> => {
  console.log("[DETECTOR] Starting hotspot detection run...");

  // ── Step 1: Fetch last 30 min of sensor readings from BigQuery ──────────
  const readings = await fetchRecentReadings(30);

  if (readings.length === 0) {
    console.log("[DETECTOR] No readings in last 30 minutes. Skipping.");
    return { hotspotsDetected: 0, hotspotsSaved: 0 };
  }

  console.log(`[DETECTOR] Fetched ${readings.length} readings`);

  // ── Step 2: Group readings into geo-clusters (0.005° ≈ 500m grid cells) ─
  const clusters = groupIntoClusters(readings, 0.005);
  console.log(`[DETECTOR] Formed ${clusters.length} geo-clusters`);

  // ── Step 3: Run Gemini fusion on each cluster ────────────────────────────
  let hotspotsDetected = 0;
  let hotspotsSaved    = 0;

  for (const cluster of clusters) {
    try {
      // Only run fusion if cluster has at least 2 readings (avoid false positives)
      if (cluster.readings.length < 2) continue;

      const fusionResult = await runFusion(cluster.readings);
      hotspotsDetected++;

      // ── Step 4: Save confirmed hotspots to BigQuery ──────────────────────
      if (fusionResult.is_hotspot) {
        const hotspot = {
          id:                uuidv4(),
          detected_at:       new Date().toISOString(),
          lat:               cluster.lat,
          lon:               cluster.lon,
          severity:          fusionResult.severity,
          confidence:        fusionResult.confidence,
          avg_temperature:   fusionResult.avg_temperature,
          avg_aqi:           fusionResult.avg_aqi,
          predicted_aqi_24h: fusionResult.predicted_aqi_24h,
          action:            fusionResult.action,
          gemini_reasoning:  fusionResult.reasoning,
          reading_count:     fusionResult.reading_count,
        };

        await writeHotspot(hotspot);
        hotspotsSaved++;

        console.log(
          `[DETECTOR] ✅ Hotspot saved: lat=${cluster.lat}, lon=${cluster.lon}, severity=${fusionResult.severity}/10`
        );
      } else {
        console.log(
          `[DETECTOR] ✓ Cluster at lat=${cluster.lat}, lon=${cluster.lon} — no hotspot (severity=${fusionResult.severity})`
        );
      }

      // Small delay between Gemini calls to avoid rate limits
      await sleep(500);
    } catch (clusterErr) {
      const msg = clusterErr instanceof Error ? clusterErr.message : String(clusterErr);
      console.error(
        `[DETECTOR] Error processing cluster at lat=${cluster.lat}:`,
        msg
      );
    }
  }

  console.log(
    `[DETECTOR] Done. ${hotspotsSaved} hotspots saved out of ${hotspotsDetected} clusters analysed.`
  );
  return { hotspotsDetected, hotspotsSaved };
};

// ─── Fetch recent sensor readings from BigQuery ────────────────────────────────
const fetchRecentReadings = async (minutes: number): Promise<SensorReadingRow[]> => {
  const query = `
    SELECT id, device_id, lat, lon, temperature, aqi, source, timestamp
    FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${DATASET}.sensor_readings\`
    WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @minutes MINUTE)
    ORDER BY timestamp DESC
  `;
  return await runQuery<SensorReadingRow>(query, { minutes });
};

// ─── Group readings into grid-cell clusters ────────────────────────────────────
// Grid size of 0.005° ≈ 500m — each cell becomes one potential hotspot
const groupIntoClusters = (
  readings: SensorReadingRow[],
  gridSize: number
): GeoCluster[] => {
  const clusterMap: Record<string, GeoCluster> = {};

  for (const reading of readings) {
    // Snap lat/lon to the nearest grid cell
    const gridLat = Math.round(reading.lat / gridSize) * gridSize;
    const gridLon = Math.round(reading.lon / gridSize) * gridSize;
    const key     = `${gridLat.toFixed(4)}_${gridLon.toFixed(4)}`;

    if (!clusterMap[key]) {
      clusterMap[key] = {
        lat:      gridLat,
        lon:      gridLon,
        readings: [],
      };
    }
    clusterMap[key].readings.push(reading);
  }

  return Object.values(clusterMap);
};

// ─── Utility: sleep ────────────────────────────────────────────────────────────
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ─── Run directly: npx ts-node bigquery-gemini-fusion/hotspotDetector.ts ──────
if (process.argv[1]?.includes("hotspotDetector")) {
  detectAndSaveHotspots()
    .then((result) => {
      console.log("Detection complete:", result);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Detection failed:", err);
      process.exit(1);
    });
}
