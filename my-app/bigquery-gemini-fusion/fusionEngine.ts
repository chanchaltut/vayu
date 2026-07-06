// bigquery-gemini-fusion/fusionEngine.ts
// THE CORE AI BRAIN OF VAYU
// Takes recent sensor readings → calls Gemini → returns hotspot decision
// This is the feature that scores the "AI doing real work" criterion

import { geminiPro } from "../lib/gemini";
import { SensorReadingRow } from "../data-pipeline/bqWriter";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FusionResult {
  is_hotspot: boolean;
  severity: number;
  confidence: number;
  predicted_aqi_24h: number;
  action:
    | "Deploy water-mist cannon"
    | "Send cleanup crew immediately"
    | "Send cleanup crew"
    | "Monitor closely — alert if rises"
    | "No action needed";
  reasoning: string;
  // Added by fusionEngine after Gemini responds:
  avg_aqi: number;
  avg_temperature: number | null;
  reading_count: number;
}

// ─── Run Gemini Fusion for one geo-cluster ────────────────────────────────────
// Input:  array of recent sensor readings from the same ~500m radius grid cell
//         optional: photoAnalysis string from Gemini Vision (if a photo was uploaded nearby)
// Output: FusionResult

export const runFusion = async (
  clusterReadings: SensorReadingRow[],
  photoAnalysis: string | null = null
): Promise<FusionResult> => {
  if (!clusterReadings || clusterReadings.length === 0) {
    throw new Error("No readings provided to fusion engine");
  }

  // ── Compute aggregates ──────────────────────────────────────────────────────
  const arduinoReadings = clusterReadings.filter(
    (r) => r.source === "arduino" && r.temperature !== null
  );
  const hasTemperature = arduinoReadings.length > 0;

  const avgAqi = Math.round(
    clusterReadings.reduce((s, r) => s + r.aqi, 0) / clusterReadings.length
  );

  const avgTempRaw = hasTemperature
    ? arduinoReadings.reduce((s, r) => s + (r.temperature ?? 0), 0) /
      arduinoReadings.length
    : null;
  const avgTemp = avgTempRaw !== null ? parseFloat(avgTempRaw.toFixed(1)) : null;

  const maxAqi = Math.max(...clusterReadings.map((r) => r.aqi));
  const minAqi = Math.min(...clusterReadings.map((r) => r.aqi));

  // Detect AQI spike in this cluster (rising fast = bad sign)
  const sortedByTime = [...clusterReadings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const earliest = sortedByTime[0]?.aqi ?? avgAqi;
  const latest   = sortedByTime[sortedByTime.length - 1]?.aqi ?? avgAqi;
  const aqiDelta = latest - earliest;

  // ── Build prompt ──────────────────────────────────────────────────────────
  const prompt = `
You are an expert AI air quality analyst for VAYU, a real-time pollution hotspot detection system deployed in Indian cities.

You are analysing data from a neighbourhood cluster (approx. 500m radius) over the last 30 minutes.

SENSOR DATA SUMMARY:
- Total readings: ${clusterReadings.length}
- Average AQI: ${avgAqi} (Indian AQI scale: 0-50 Good, 51-100 Satisfactory, 101-200 Moderate, 201-300 Poor, 301-400 Very Poor, 401+ Severe)
- Max AQI recorded: ${maxAqi}
- Min AQI recorded: ${minAqi}
- AQI change over period: ${aqiDelta > 0 ? "+" : ""}${aqiDelta} (${aqiDelta > 20 ? "RISING FAST ⚠️" : aqiDelta < -20 ? "improving" : "stable"})
${hasTemperature ? `- Average Temperature: ${avgTemp}°C` : "- Temperature: not available"}
- Data sources: ${[...new Set(clusterReadings.map((r) => r.source))].join(", ")}
${photoAnalysis ? `\nCITIZEN PHOTO ANALYSIS:\n${photoAnalysis}` : "\nNo citizen photo reports for this cluster."}

RECENT READINGS (newest first):
${JSON.stringify(
  clusterReadings.slice(0, 8).map((r) => ({
    aqi:    r.aqi,
    temp:   r.temperature,
    source: r.source,
    time:   r.timestamp,
  })),
  null,
  2
)}

Based on this data, make a pollution hotspot determination. Consider:
1. AQI levels and rate of change
2. Temperature (higher temp + high AQI = worse health risk)
3. Multiple data sources corroborating each other
4. Time of day patterns (morning/evening rush hours are typically worse)
5. Indian AQI guidelines and health thresholds

Respond ONLY with valid JSON — no extra text, no markdown:
{
  "is_hotspot": <true if AQI > 150 OR severity >= 6, false otherwise>,
  "severity": <integer 1-10, where 10 = AQI 400+, extremely hazardous>,
  "confidence": <float 0.0-1.0, how confident you are in this assessment>,
  "predicted_aqi_24h": <integer, your AQI forecast for 24 hours from now>,
  "action": "<exactly one of: 'Deploy water-mist cannon' | 'Send cleanup crew immediately' | 'Send cleanup crew' | 'Monitor closely — alert if rises' | 'No action needed'>",
  "reasoning": "<1-2 concise sentences explaining your decision>"
}
`;

  // ── Call Gemini ────────────────────────────────────────────────────────────
  const result       = await geminiPro.generateContent(prompt);
  const responseText = result.response.text();

  let parsed: Omit<FusionResult, "avg_aqi" | "avg_temperature" | "reading_count">;
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
  } catch {
    console.error("[FUSION] Gemini response parse error:", responseText);
    throw new Error("Gemini returned non-JSON response");
  }

  console.log(
    `[FUSION] Result: hotspot=${parsed.is_hotspot}, severity=${parsed.severity}, aqi=${avgAqi}, action="${parsed.action}"`
  );

  return {
    ...parsed,
    avg_aqi:         avgAqi,
    avg_temperature: avgTemp,
    reading_count:   clusterReadings.length,
  };
};
