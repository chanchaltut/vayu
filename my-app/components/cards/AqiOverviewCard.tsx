"use client";
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { HourlyAqi } from "@/lib/vayuData";
import { AQI_COLOR, aqiKey, hourLabel } from "@/lib/weatherUi";

export interface SensorReading {
  aqi: number;
  lat?: number;
  lon?: number;
  timestamp: string | { value: string };
}

interface AqiOverviewCardProps {
  /** Recent VAYU readings near the visitor (newest first). Preferred over satellite when present. */
  sensorReadings: SensorReading[];
  pastAqi: HourlyAqi[];
  nextAqi: HourlyAqi[];
  aiPrediction?: number | null;
}

interface Bar {
  label: string;
  aqi: number;
}

function tsValue(ts: SensorReading["timestamp"]): string {
  return typeof ts === "object" ? ts.value : ts;
}

export default function AqiOverviewCard({ sensorReadings, pastAqi, nextAqi, aiPrediction }: AqiOverviewCardProps) {
  const { t, lang } = useI18n();
  const [mode, setMode] = useState<"past" | "next">("past");
  const [selected, setSelected] = useState<number | null>(null);

  const { bars, source } = useMemo(() => {
    if (mode === "next") {
      // Every 3rd hour across the next 24h → 8 bars.
      const pts = nextAqi.filter((_, i) => i % 3 === 2).slice(0, 8);
      return { bars: pts.map((p) => ({ label: hourLabel(p.time, lang.locale), aqi: Math.round(p.aqi) })), source: t.detect.sourceSatellite };
    }
    if (sensorReadings.length >= 3) {
      const pts = sensorReadings.slice(0, 7).reverse();
      return {
        bars: pts.map((r) => {
          const d = new Date(tsValue(r.timestamp));
          return {
            label: new Intl.DateTimeFormat(lang.locale, { hour: "numeric", minute: "2-digit" }).format(d),
            aqi: Math.round(r.aqi),
          };
        }),
        source: t.detect.sourceSensors,
      };
    }
    return {
      bars: pastAqi.map((p) => ({ label: hourLabel(p.time, lang.locale), aqi: Math.round(p.aqi) })),
      source: t.detect.sourceSatellite,
    };
  }, [mode, sensorReadings, pastAqi, nextAqi, lang.locale, t]);

  const peak = bars.length ? Math.max(...bars.map((b) => b.aqi)) : null;
  const chartMax = peak == null || peak <= 100 ? 100 : peak <= 250 ? 250 : 500;
  const [low, high] = chartMax === 100 ? [50, 80] : chartMax === 250 ? [100, 200] : [150, 300];
  const shown: Bar | null = selected != null && bars[selected] ? bars[selected] : null;
  const big = shown ? shown.aqi : peak;

  const switchMode = (m: "past" | "next") => {
    setMode(m);
    setSelected(null);
  };

  return (
    <div className="flex h-full w-full select-none flex-col overflow-hidden rounded-3xl bg-[#FAFAFA] shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/6 px-4 py-3.5 sm:px-6 sm:py-4">
        <h3 className="text-[19px] font-bold tracking-tight text-[#1A1A1A] sm:text-[22px]">{t.detect.overview}</h3>
        <div className="flex rounded-full bg-black/5 p-1" role="tablist">
          {(["past", "next"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors sm:text-[13px] ${
                mode === m ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#595959]"
              }`}
            >
              {m === "past" ? t.detect.past : t.detect.next24}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-4 sm:px-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[14px] font-semibold tracking-tight text-[#2B3037]">{shown ? shown.label : t.detect.highest}</p>
            <p className="mt-1 text-[44px] font-bold leading-none tabular-nums sm:text-[48px]" style={{ color: big != null ? AQI_COLOR[aqiKey(big)] : "#1A1A1A" }}>
              {big ?? "—"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 text-right">
            {mode === "next" && aiPrediction != null && (
              <span className="rounded-full bg-[#C200FB]/10 px-2.5 py-1 text-[12px] font-bold text-[#8a00b3]">
                {t.detect.aiPrediction}: {aiPrediction}
              </span>
            )}
            <span className="text-[11.5px] font-semibold text-[#8C8C8C]">{source}</span>
          </div>
        </div>

        {/* Chart */}
        <div className="mt-5 flex flex-1 items-end gap-1">
          <div className="relative h-40 w-9 shrink-0 pb-6 text-[10px] font-extrabold text-gray-400 sm:w-12">
            <div className="relative h-full">
              <span className="absolute right-1 translate-y-1/2" style={{ bottom: `${(high / chartMax) * 100}%` }}>{high} —</span>
              <span className="absolute right-1 translate-y-1/2" style={{ bottom: `${(low / chartMax) * 100}%` }}>{low} —</span>
            </div>
          </div>
          <div className="relative flex h-40 flex-1 items-end justify-between gap-1.5 sm:gap-3">
            <div className="pointer-events-none absolute inset-x-0 bottom-6 top-0">
              <div className="absolute inset-x-0 border-t border-dashed border-red-500/25" style={{ bottom: `${(low / chartMax) * 100}%` }} />
              <div className="absolute inset-x-0 border-t border-dashed border-purple-500/25" style={{ bottom: `${(high / chartMax) * 100}%` }} />
            </div>
            {bars.length === 0
              ? Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className="flex h-full flex-1 flex-col justify-end gap-2">
                    <div className="w-full animate-pulse rounded-xl bg-black/5" style={{ height: `${30 + ((i * 17) % 40)}%` }} />
                    <span className="h-3.5" />
                  </div>
                ))
              : bars.map((b, i) => {
                  const isPeak = b.aqi === peak;
                  const isSel = selected === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelected(isSel ? null : i)}
                      aria-label={`${b.label}: AQI ${b.aqi}`}
                      className="group relative z-20 flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span
                        className={`pointer-events-none absolute -top-1 left-1/2 z-30 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-[#1A1A1A] px-2 py-0.5 text-[11px] font-bold text-white shadow-md sm:block ${
                          isSel ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        } transition-opacity`}
                      >
                        AQI {b.aqi}
                      </span>
                      <div className="flex w-full flex-1 items-end">
                        <div
                          className={`w-full rounded-lg transition-all duration-300 sm:rounded-xl ${
                            isSel ? "bg-[#1A1A1A]" : isPeak ? "bg-red-600 shadow-[0_4px_12px_rgba(220,38,38,0.25)]" : "bg-[#D9D9D9] group-hover:bg-gray-400"
                          }`}
                          style={{ height: `${Math.max(4, Math.min(100, (b.aqi / chartMax) * 100))}%` }}
                        />
                      </div>
                      <span className="h-3.5 w-full truncate text-center text-[9.5px] font-semibold leading-tight text-[#555] sm:text-[10px]">{b.label}</span>
                    </button>
                  );
                })}
          </div>
        </div>
      </div>
    </div>
  );
}
