"use client";
import { useEffect, useState } from "react";
import GridBackground from "@/components/backgrounds/GridBackground";
import SectionHeader from "@/components/texts/SectionHeader";
import CountCard from "@/components/cards/CountCard";
import AqiOverviewCard, { type SensorReading } from "../cards/AqiOverviewCard";
import WeeklyTemperatureCard from "../cards/WeeklyTemperatureCard";
import HotspotsMapCard from "../cards/HotspotsMapCard";
import TextDescriptionCard from "../cards/TextDescriptionCard";
import Toast from "../Toast";
import { useI18n } from "@/lib/i18n";
import { useVayuData } from "@/lib/vayuData";
import { HOTSPOTS_UPDATED, useHotspots } from "@/lib/useHotspots";
import { weatherIcon, weatherText, weekday } from "@/lib/weatherUi";

const DAY_MS = 24 * 60 * 60 * 1000;

/** VAYU readings from the last 24h near the visitor (otherwise the chart uses satellite data). */
async function fetchNearbyReadings(lat: number, lon: number): Promise<SensorReading[]> {
  try {
    const json = await (await fetch("/api/sensors", { cache: "no-store" })).json();
    const rows: (SensorReading & { lat: number; lon: number })[] = json?.data?.readings ?? [];
    const now = Date.now();
    return rows.filter((r) => {
      const ts = new Date(typeof r.timestamp === "object" ? r.timestamp.value : r.timestamp).getTime();
      return now - ts < DAY_MS && Math.abs(r.lat - lat) < 0.3 && Math.abs(r.lon - lon) < 0.3;
    });
  } catch {
    return [];
  }
}

export default function AiPrediction() {
  const { t, fmt, lang } = useI18n();
  const { coords, temperature, aqi, daily, pastAqi, nextAqi } = useVayuData();
  const { hotspots } = useHotspots();
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [aiPrediction, setAiPrediction] = useState<number | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const loadReadings = () => fetchNearbyReadings(coords.lat, coords.lon).then(setReadings);

  useEffect(() => {
    let alive = true;
    fetchNearbyReadings(coords.lat, coords.lon).then((r) => alive && setReadings(r));
    // Gemini's 24h prediction — only shown when it is based on real nearby readings.
    fetch(`/api/forecast/${coords.lat.toFixed(4)}/${coords.lon.toFixed(4)}`)
      .then((r) => r.json())
      .then((j) => alive && setAiPrediction(j?.data?.source === "gemini" ? Math.round(j.data.predicted_aqi_24h) : null))
      .catch(() => alive && setAiPrediction(null));
    return () => {
      alive = false;
    };
  }, [coords.lat, coords.lon]);

  const handleDetect = async () => {
    setIsDetecting(true);
    try {
      const res = await fetch("/api/detect-hotspots", { method: "POST" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.error || "failed");
      window.dispatchEvent(new Event(HOTSPOTS_UPDATED));
      await loadReadings();
      const n: number = json.data?.hotspots_saved ?? 0;
      setToast({
        message: n === 0 ? t.detect.doneNone : n === 1 ? t.detect.doneOne : fmt(t.detect.doneMany, { n }),
        type: "success",
      });
    } catch (err) {
      console.error("[detect]", err);
      setToast({ message: t.detect.failed, type: "error" });
    } finally {
      setIsDetecting(false);
    }
  };

  const week = daily.slice(0, 6);

  return (
    <section id="detect" className="relative flex w-full flex-col items-center overflow-hidden pb-12 pt-16 md:pb-12 md:pt-24 lg:pt-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <GridBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-360 flex-col items-center px-4 sm:px-6 md:px-8">
        <SectionHeader eyebrow={t.nav.detect} heading={t.detect.heading} subheading={t.detect.sub} />

        <div className="mt-8 grid w-full grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-[45fr_50fr] lg:gap-x-[5%]">
          {/* Stats */}
          <div className="order-1 grid grid-cols-3 gap-2.5 md:col-span-2 md:flex md:items-center md:justify-between lg:col-span-1 lg:col-start-1 lg:row-start-1">
            <CountCard label={t.detect.temperature} value={temperature != null ? `${temperature}°C` : "—"} />
            <CountCard label={t.detect.aqi} value={aqi ?? "—"} />
            <CountCard label={t.detect.hotspots} value={hotspots.length} />
          </div>

          {/* Map */}
          <div className="order-2 h-[380px] md:order-3 md:h-auto md:min-h-[440px] lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <HotspotsMapCard hotspots={hotspots} centerLat={coords.lat} centerLon={coords.lon} />
          </div>

          {/* Gemini analysis */}
          <div className="order-3 md:order-5 md:col-span-2 lg:col-span-1 lg:col-start-2 lg:row-start-3">
            <TextDescriptionCard reasoning={hotspots[0]?.reasoning} onDetect={handleDetect} isDetecting={isDetecting} />
          </div>

          {/* AQI chart */}
          <div className="order-4 md:order-2 lg:col-start-1 lg:row-start-2">
            <AqiOverviewCard sensorReadings={readings} pastAqi={pastAqi} nextAqi={nextAqi} aiPrediction={aiPrediction} />
          </div>

          {/* This week */}
          <div className="order-5 -mx-4 sm:-mx-6 md:order-4 md:col-span-2 md:mx-0 lg:col-span-1 lg:col-start-1 lg:row-start-3">
            <p className="mb-2.5 px-5 text-[12px] font-bold uppercase tracking-[0.14em] text-[#8C8C8C] sm:px-7 md:hidden">{t.detect.week}</p>
            <div className="no-scrollbar flex h-[188px] snap-x snap-mandatory scroll-px-4 items-stretch gap-3 overflow-x-auto px-4 sm:px-6 md:h-[180px] md:justify-center md:overflow-visible md:px-0 lg:h-full lg:min-h-[180px] lg:justify-between lg:gap-2 xl:justify-center xl:gap-4">
              {(week.length ? week : Array.from({ length: 6 }, () => null)).map((d, i) =>
                d ? (
                  <WeeklyTemperatureCard
                    key={d.date}
                    day={i === 0 ? t.hero.today : weekday(d.date, lang.locale)}
                    icon={weatherIcon(d.code)}
                    iconAlt={weatherText(d.code, t)}
                    temperature={d.max}
                    isActive={i === 0}
                  />
                ) : (
                  <div key={i} className="w-[76px] shrink-0 animate-pulse rounded-2xl bg-black/5" />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
