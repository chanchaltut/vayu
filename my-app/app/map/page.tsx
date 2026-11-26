"use client";
import Link from "next/link";
import HotspotsMapCard, { COLOUR_MAP } from "@/components/cards/HotspotsMapCard";
import { useI18n } from "@/lib/i18n";
import { useHotspots } from "@/lib/useHotspots";

const KOLKATA = { lat: 22.5726, lon: 88.3639 };

export default function MapPage() {
  const { t } = useI18n();
  const { hotspots, loaded } = useHotspots();
  const center = hotspots[0] ? { lat: hotspots[0].lat, lon: hotspots[0].lon } : KOLKATA;

  const legend = [
    ["yellow", t.aqiShort.moderate],
    ["orange", t.aqiShort.poor],
    ["red", t.aqiShort.severe],
  ] as const;

  return (
    <main className="flex min-h-[100svh] w-full flex-col bg-[#0b0d10]">
      <header className="flex flex-col gap-3 border-b border-white/10 bg-[#111418] px-4 py-3.5 pt-[max(env(safe-area-inset-top),14px)] sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/#detect"
            aria-label="Back"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/15"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
              <path d="M15 18 9 12l6-6" />
            </svg>
          </Link>
          <div>
            <h1 className="text-[20px] font-bold text-white sm:text-2xl">VAYU · {t.detect.mapTitle}</h1>
            <p className="mt-0.5 text-[13px] text-gray-400">
              {!loaded ? "…" : hotspots.length === 0 ? t.detect.noHotspots : `${hotspots.length} ${t.detect.hotspots}`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {legend.map(([c, label]) => (
            <div key={c} className="flex items-center gap-1.5">
              <span style={{ background: COLOUR_MAP[c] }} className="h-3 w-3 rounded-full" />
              <span className="text-[12px] text-gray-300">{label}</span>
            </div>
          ))}
        </div>
      </header>
      <div className="flex flex-1 p-2 sm:p-4 [&>div]:min-h-[calc(100svh-120px)]">
        <HotspotsMapCard hotspots={hotspots} centerLat={center.lat} centerLon={center.lon} />
      </div>
    </main>
  );
}
