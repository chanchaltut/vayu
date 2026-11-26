"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import GridBackground from "@/components/backgrounds/GridBackground";
import SectionHeader from "@/components/texts/SectionHeader";
import DeformedContainer from "../containers/DeformedContainer";
import DispatchDialog from "../dialogs/DispatchDialog";
import Toast from "../Toast";
import { useI18n } from "@/lib/i18n";
import { HOTSPOTS_UPDATED, directionsUrl, useHotspots, type Hotspot } from "@/lib/useHotspots";
import { aqiCategoryText } from "@/lib/weatherUi";

const SEVERITY_STYLE: Record<string, { bg: string; text: string; icon: string }> = {
  red: { bg: "bg-[#050B14]", text: "text-white", icon: "/assets/Shape 89.svg" },
  orange: { bg: "bg-[#5690FF]", text: "text-[#171717]", icon: "/assets/Shape 106.svg" },
  yellow: { bg: "bg-[#FFB800]", text: "text-[#171717]", icon: "/assets/BlackStar.svg" },
  green: { bg: "bg-[#D9FBD0]", text: "text-[#171717]", icon: "/assets/BlackStar.svg" },
};
const PLACEHOLDER_STYLE = [SEVERITY_STYLE.red, SEVERITY_STYLE.orange, SEVERITY_STYLE.yellow];

// Phones: horizontal snap carousel with the next card peeking. Tablet: 2-up grid. Desktop: 3-up.
const CARD =
  "flex w-[84%] max-w-90 shrink-0 snap-center flex-col overflow-hidden rounded-3xl border border-[#171717] shadow-[0_8px_24px_rgba(0,0,0,0.04)] sm:w-[60%] md:w-auto md:max-w-none";

export default function Municipality() {
  const { t, fmt } = useI18n();
  const { hotspots } = useHotspots();
  const [alertCount, setAlertCount] = useState(0);
  const [dispatching, setDispatching] = useState<Hotspot | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const loadAlerts = useCallback(() => {
    fetch("/api/alerts", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => setAlertCount(json?.data?.count ?? 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadAlerts();
    window.addEventListener(HOTSPOTS_UPDATED, loadAlerts);
    return () => window.removeEventListener(HOTSPOTS_UPDATED, loadAlerts);
  }, [loadAlerts]);

  const top3 = hotspots.slice(0, 3);

  return (
    <section id="act" className="relative flex w-full flex-col items-center overflow-hidden pb-14 pt-16 md:pb-28 md:pt-24 lg:pt-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {dispatching && (
        <DispatchDialog
          hotspot={dispatching}
          onClose={() => setDispatching(null)}
          onSent={(msg) => {
            setDispatching(null);
            setToast({ message: msg, type: "success" });
            loadAlerts();
          }}
        />
      )}
      <GridBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 sm:px-6 md:px-8">
        <SectionHeader eyebrow={t.nav.act} heading={t.act.heading} subheading={t.act.sub} />

        <div className="mt-8 w-full md:mt-12">
          <DeformedContainer />
        </div>

        <div className="no-scrollbar -mx-4 mt-8 flex w-[calc(100%+2rem)] snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:w-[calc(100%+3rem)] sm:px-6 md:mx-0 md:mt-12 md:grid md:w-full md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 lg:grid-cols-3">
          {top3.length > 0
            ? top3.map((hs) => {
                const s = SEVERITY_STYLE[hs.colour] ?? SEVERITY_STYLE.orange;
                return (
                  <article key={hs.id} className={`${CARD} ${s.bg}`}>
                    <header className="flex h-19 shrink-0 items-center justify-between px-6">
                      <div className="flex flex-col">
                        <h3 className={`text-[20px] font-bold tracking-tight ${s.text}`}>AQI {hs.avg_aqi}</h3>
                        <p className={`text-[13px] font-medium opacity-70 ${s.text}`}>
                          {aqiCategoryText(hs.aqi_category, t)} · {t.report.severity} {hs.severity}/10
                        </p>
                      </div>
                      <div className="relative h-6 w-6">
                        <Image src={s.icon} alt="" fill className="object-contain" />
                      </div>
                    </header>
                    <div className="flex flex-1 flex-col rounded-t-3xl border-t border-[#171717] bg-white px-5 pb-5 pt-4">
                      <p className="text-[13px] font-semibold text-[#8C8C8C]">
                        {t.act.location} · {hs.lat.toFixed(4)}, {hs.lon.toFixed(4)}
                      </p>
                      <p className="mt-1.5 text-[15.5px] font-extrabold leading-snug text-[#111]">
                        {t.act.action}: {hs.action}
                      </p>
                      <p className="mt-1.5 line-clamp-3 text-[14px] font-medium leading-relaxed text-[#555]">{hs.reasoning}</p>
                      <div className="mt-auto flex gap-2 pt-4">
                        <a
                          href={directionsUrl(hs.lat, hs.lon)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-black/10 text-[14px] font-semibold text-[#1A1A1A] transition-colors hover:bg-black/5"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                            <path d="m3 11 19-9-9 19-2-8z" />
                          </svg>
                          {t.act.directions}
                        </a>
                        <button
                          type="button"
                          onClick={() => setDispatching(hs)}
                          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-600 text-[14px] font-semibold text-white transition-colors hover:bg-red-700"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                            <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
                          </svg>
                          {t.act.dispatch}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            : t.act.placeholders.map((p, i) => {
                const s = PLACEHOLDER_STYLE[i];
                return (
                  <article key={i} className={`${CARD} min-h-70 ${s.bg}`}>
                    <header className="flex h-19 shrink-0 items-center justify-between px-6">
                      <h3 className={`text-[20px] font-bold tracking-tight ${s.text}`}>{p.title}</h3>
                      <div className="relative h-6 w-6">
                        <Image src={s.icon} alt="" fill className="object-contain" />
                      </div>
                    </header>
                    <div className="flex flex-1 flex-col rounded-t-3xl border-t border-[#171717] bg-white p-5">
                      <p className="text-[15.5px] font-bold leading-relaxed text-[#111]">{p.desc1}</p>
                      <p className="mt-2 text-[14px] font-semibold leading-relaxed text-[#555]">{p.desc2}</p>
                    </div>
                  </article>
                );
              })}
        </div>

        <div className="mt-8 flex max-w-full items-center gap-3 overflow-visible rounded-full border border-black/5 bg-white px-5 py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.08)] md:px-6 md:py-4">
          <Image src="/assets/Group 765.svg" alt="" width={24} height={24} className="shrink-0 scale-[1.6] object-contain md:scale-[1.8]" />
          <span className="text-[14.5px] font-bold leading-snug tracking-tight text-[#171717] md:text-[18px]">
            {alertCount === 0 ? t.act.alertsNone : alertCount === 1 ? t.act.alertsOne : fmt(t.act.alertsMany, { n: alertCount })}
          </span>
        </div>
      </div>
    </section>
  );
}
