import Image from "next/image";

interface SensorReading {
  aqi: number;
  temperature?: number;
  timestamp: string | { value: string };
}

interface AqiOverviewCardProps {
  readings?: SensorReading[];
}

function safeDate(ts: string | { value: string } | undefined): Date | null {
  if (!ts) return null;
  const raw = typeof ts === "object" && "value" in ts ? ts.value : ts;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

export default function AqiOverviewCard({ readings = [] }: AqiOverviewCardProps) {
  // Build up to 7 bars from real readings (oldest → newest), skip invalid timestamps
  const validReadings = readings
    .filter((r) => safeDate(r.timestamp) !== null)
    .slice(0, 7)
    .reverse();

  // Find the highest AQI value among the visible readings to highlight logically
  const maxVisibleAqi =
    validReadings.length > 0
      ? Math.max(...validReadings.map((r) => r.aqi))
      : 62; // fallback peak

  // --- Dynamic Scale & Benchmark Auto-Ranging ---
  // Depending on the peak visible AQI, we adjust the chart bounds to make the layout clear
  let chartMax = 500;
  let benchmarkLow = 150;
  let benchmarkLowLabel = "150";
  let benchmarkHigh = 300;
  let benchmarkHighLabel = "300";

  if (maxVisibleAqi <= 100) {
    chartMax = 100;
    benchmarkLow = 50;
    benchmarkLowLabel = "50"; // Good
    benchmarkHigh = 80;
    benchmarkHighLabel = "80"; // Moderate
  } else if (maxVisibleAqi <= 250) {
    chartMax = 250;
    benchmarkLow = 100;
    benchmarkLowLabel = "100"; // Moderate
    benchmarkHigh = 200;
    benchmarkHighLabel = "200"; // Poor
  } else {
    chartMax = 500;
    benchmarkLow = 150;
    benchmarkLowLabel = "150"; // Unhealthy
    benchmarkHigh = 300;
    benchmarkHighLabel = "300"; // Hazardous
  }

  const bars =
    validReadings.length > 0
      ? validReadings.map((r) => {
          const aqiVal = Math.round(r.aqi);
          return {
            label: safeDate(r.timestamp)!.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            aqi: aqiVal,
            value: Math.min(Math.round((aqiVal / chartMax) * 100), 100),
            // Highlighting is logically decided by the highest AQI reading in the set
            highlighted: aqiVal === maxVisibleAqi && maxVisibleAqi > 0,
          };
        })
      : [
          // Realistic fallback data (max 62)
          { label: "10:56 pm", aqi: 52, value: Math.round((52 / chartMax) * 100), highlighted: false },
          { label: "12:06 am", aqi: 55, value: Math.round((55 / chartMax) * 100), highlighted: false },
          { label: "01:12 am", aqi: 58, value: Math.round((58 / chartMax) * 100), highlighted: false },
          { label: "02:14 am", aqi: 62, value: Math.round((62 / chartMax) * 100), highlighted: true },
          { label: "03:20 am", aqi: 60, value: Math.round((60 / chartMax) * 100), highlighted: false },
          { label: "04:21 am", aqi: 54, value: Math.round((54 / chartMax) * 100), highlighted: false },
          { label: "05:07 am", aqi: 48, value: Math.round((48 / chartMax) * 100), highlighted: false },
        ];

  // Recalculate max AQI from visible set or default peak
  const maxAqi =
    validReadings.length > 0 ? maxVisibleAqi : 62;

  // Calculate percentages for positioning lines and Y-axis labels dynamically
  const pctLow = `${(benchmarkLow / chartMax) * 100}%`;
  const pctHigh = `${(benchmarkHigh / chartMax) * 100}%`;

  return (
    <div className="w-140 h-100 bg-[#FAFAFA] rounded-3xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col justify-between select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-black/6 shrink-0">
        <h3 className="text-[22px] font-bold text-[#1A1A1A] tracking-tight">
          AQI Overview
        </h3>
      </div>

      {/* Body */}
      <div className="px-6 py-4 flex-1 flex flex-col justify-between">
        <div className="shrink-0">
          <p className="text-[15px] text-[#2B3037] font-semibold tracking-tight">Highest AQI</p>
          <p className="text-[48px] font-bold text-[#1A1A1A] leading-none mt-1">
            {maxAqi > 0 ? Math.round(maxAqi) : "—"}
          </p>
        </div>

        {/* Chart Area with separated dynamic Y-Axis */}
        <div className="mt-6 flex-1 flex gap-1 items-end">
          
          {/* Y-Axis Tick Labels aligned dynamically to matching percentages */}
          <div className="w-14 h-38 flex flex-col justify-between items-end pr-2 text-[10px] text-gray-400 font-extrabold pointer-events-none pb-6 relative shrink-0">
            <span style={{ bottom: pctHigh, position: "absolute", right: "4px" }}>{benchmarkHighLabel} —</span>
            <span style={{ bottom: pctLow, position: "absolute", right: "4px" }}>{benchmarkLowLabel} —</span>
          </div>

          {/* Chart Wrapper */}
          <div className="flex-1 flex items-end justify-between gap-3.5 h-38 relative">
            
            {/* Dynamic Benchmark line (Low threshold) */}
            <div
              className="absolute left-0 right-0 border-t border-dashed border-red-500/25 z-10 pointer-events-none"
              style={{ bottom: pctLow }}
            />

            {/* Dynamic Benchmark line (High threshold) */}
            <div
              className="absolute left-0 right-0 border-t border-dashed border-purple-500/25 z-10 pointer-events-none"
              style={{ bottom: pctHigh }}
            />

            {bars.map((bar, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2.5 flex-1 h-full justify-end relative z-20 group"
              >
                {/* Floating exact AQI Tooltip on Hover */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-7 bg-[#1A1A1A] text-white text-[11px] font-bold px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-30 shadow-md">
                  AQI {bar.aqi}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-[-3.5px] w-1.5 h-1.5 bg-[#1A1A1A] rotate-45" />
                </div>

                {/* Animated Column Bar */}
                <div
                  className={`w-full rounded-xl transition-all duration-300 cursor-pointer ${
                    bar.highlighted
                      ? "bg-red-600 shadow-[0_4px_12px_rgba(220,38,38,0.25)] hover:bg-red-700"
                      : "bg-[#D9D9D9] hover:bg-gray-400"
                  }`}
                  style={{ height: `${bar.value}%` }}
                />

                <span className="text-[10px] text-[#555] font-semibold truncate w-full text-center leading-tight">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
