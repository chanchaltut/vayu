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

  const bars =
    validReadings.length > 0
      ? validReadings.map((r, i) => ({
          label: safeDate(r.timestamp)!.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          value: Math.min(Math.round((r.aqi / 500) * 100), 100),
          highlighted: i === validReadings.length - 1,
        }))
      : [
          { label: "—", value: 20, highlighted: false },
          { label: "—", value: 40, highlighted: false },
          { label: "—", value: 50, highlighted: false },
          { label: "—", value: 60, highlighted: false },
          { label: "—", value: 90, highlighted: true },
          { label: "—", value: 30, highlighted: false },
          { label: "—", value: 50, highlighted: false },
        ];

  const maxAqi =
    readings.length > 0 ? Math.max(...readings.map((r) => r.aqi)) : 0;

  return (
    <div className="w-140 h-100 bg-[#FAFAFA] rounded-3xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-black/6">
        <h3 className="text-[22px] font-bold text-[#1A1A1A] tracking-tight">
          AQI Overview
        </h3>
        <button
          title="Menu"
          type="button"
          className="text-[#8C8C8C] cursor-pointer"
        >
          <Image
            src="/assets/Menu.svg"
            alt="Menu"
            width={28}
            height={28}
            className="w-7 h-auto"
          />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-4">
        <p className="text-[15px] text-[#2B3037] font-medium">Highest AQI</p>
        <p className="text-[48px] font-thin text-[#2B3037] leading-none mt-1">
          {maxAqi > 0 ? maxAqi : "—"}
        </p>

        {/* Chart */}
        <div className="mt-8">
          <div className="border-t border-dashed border-black/20"></div>
          <div className="flex items-end justify-between gap-3 h-44 -mt-8">
            {bars.map((bar, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 flex-1 h-full justify-end"
              >
                <div
                  className={`w-full rounded-xl transition-all duration-300 ${
                    bar.highlighted ? "bg-red-600" : "bg-[#D9D9D9]"
                  }`}
                  style={{ height: `${bar.value}%` }}
                />
                <span className="text-[10px] text-[#1A1A1A] font-medium truncate w-full text-center leading-tight">
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
