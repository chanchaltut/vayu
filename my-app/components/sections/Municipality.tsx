"use client";
import { useEffect, useState } from "react";
import GridBackground from "@/components/backgrounds/GridBackground";
import SectionHeader from "@/components/texts/SectionHeader";
import Image from "next/image";
import DeformedContainer from "../containers/DeformedContainer";

interface Hotspot {
  id: string;
  lat: number;
  lon: number;
  severity: number;
  avg_aqi: number;
  aqi_category: string;
  action: string;
  colour: string;
  reasoning: string;
}

const SEVERITY_STYLE: Record<string, { bg: string; text: string; icon: string }> = {
  red:    { bg: "bg-[#050B14]", text: "text-white",       icon: "/assets/Shape 89.svg"   },
  orange: { bg: "bg-[#5690FF]", text: "text-[#171717]",   icon: "/assets/Shape 106.svg"  },
  yellow: { bg: "bg-[#FFB800]", text: "text-[#171717]",   icon: "/assets/BlackStar.svg"  },
  green:  { bg: "bg-[#D9FBD0]", text: "text-[#171717]",   icon: "/assets/BlackStar.svg"  },
};

export default function Municipality() {
  const [hotspots, setHotspots]   = useState<Hotspot[]>([]);
  const [alertCount, setAlertCount] = useState<number>(0);

  const loadData = () => {
    fetch("/api/hotspots")
      .then((r) => r.json())
      .then((json) => setHotspots(json?.data?.hotspots ?? []))
      .catch(() => {});

    fetch("/api/alerts")
      .then((r) => r.json())
      .then((json) => setAlertCount(json?.data?.count ?? 0))
      .catch(() => {});
  };

  useEffect(() => {
    loadData();

    // Listen to custom update events emitted by prediction section triggers
    window.addEventListener("vayu_hotspots_updated", loadData);
    return () => window.removeEventListener("vayu_hotspots_updated", loadData);
  }, []);

  const top3 = hotspots.slice(0, 3);

  return (
    <section id="act" className="relative w-full flex flex-col items-center pt-20 pb-28 overflow-hidden select-none">
      <GridBackground />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 flex flex-col items-center">
        <SectionHeader
          heading="Act now."
          subheading="Confirmed hotspots, ranked by severity — ready for immediate dispatch."
        />

        <div className="mt-12 w-full">
          <DeformedContainer />
        </div>

        {/* Report Cards */}
        <div className="mt-12 w-full flex justify-between gap-6">
          {top3.length > 0 ? (
            top3.map((hs) => {
              const style = SEVERITY_STYLE[hs.colour] ?? SEVERITY_STYLE.orange;
              return (
                <div
                  key={hs.id}
                  className={`w-90 h-70 rounded-3xl border border-[#171717] flex flex-col relative overflow-hidden ${style.bg} shadow-[0_8px_24px_rgba(0,0,0,0.04)]`}
                >
                  <div className="flex items-center justify-between px-7 h-19 shrink-0">
                    <div className="flex flex-col">
                      <h3 className={`text-[20px] font-bold tracking-tight ${style.text}`}>
                        AQI {hs.avg_aqi}
                      </h3>
                      <p className={`text-[13px] font-medium ${style.text} opacity-70`}>
                        {hs.aqi_category}
                      </p>
                    </div>
                    <div className="relative w-6 h-6 flex items-center justify-center">
                      <Image src={style.icon} alt="icon" fill className="object-contain" />
                    </div>
                  </div>
                  <div className="flex-1 bg-white rounded-t-3xl border-t border-[#171717] w-full px-5 pt-4">
                    <p className="text-[15.5px] font-bold text-[#333] leading-relaxed">
                      📍 Coord: {hs.lat.toFixed(4)}, {hs.lon.toFixed(4)}
                    </p>
                    <p className="text-[15px] font-extrabold text-[#111] mt-1.5">
                      ⚡ Action: {hs.action}
                    </p>
                    <p className="text-[14px] text-[#555] font-semibold mt-1 leading-relaxed line-clamp-3">
                      {hs.reasoning}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            [
              {
                title: "Safe Zone Status",
                bg: "bg-[#050B14]",
                text: "text-white",
                icon: "/assets/Shape 89.svg",
                desc1: "No active pollution sources or waste-burning spots have been identified in your locality.",
                desc2: "Your local air quality metrics are currently stable and well within safe breathing limits."
              },
              {
                title: "AI Pollution Scan",
                bg: "bg-[#5690FF]",
                text: "text-[#171717]",
                icon: "/assets/Shape 106.svg",
                desc1: "Cross-reference active satellite imagery datasets directly with community reports.",
                desc2: "Click 'Run Hotspot Detection' inside the Analyze section to scan for environmental spikes."
              },
              {
                title: "Emergency Alerts",
                bg: "bg-[#FFB800]",
                text: "text-[#171717]",
                icon: "/assets/BlackStar.svg",
                desc1: "Real-time dispatches are sent automatically to municipality teams to resolve local anomalies.",
                desc2: "We notify emergency responders instantly when regional AQI levels exceed safe safety levels."
              },
            ].map((p) => (
              <div
                key={p.title}
                className={`w-90 h-70 rounded-3xl border border-[#171717] flex flex-col relative overflow-hidden ${p.bg} shadow-[0_8px_24px_rgba(0,0,0,0.03)]`}
              >
                <div className="flex items-center justify-between px-7 h-19 shrink-0">
                  <h3 className={`text-[20px] font-bold tracking-tight ${p.text}`}>{p.title}</h3>
                  <div className="relative w-6 h-6">
                    <Image src={p.icon} alt="icon" fill className="object-contain" />
                  </div>
                </div>
                
                <div className="flex-1 bg-white rounded-t-3xl border-t border-[#171717] p-5 flex flex-col justify-start">
                  <p className="text-[15.5px] font-bold text-[#111] leading-relaxed">
                    {p.desc1}
                  </p>
                  <p className="text-[14px] text-[#555] mt-2 leading-relaxed font-semibold">
                    {p.desc2}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Alert Count Pill */}
        <div className="mt-8 bg-white rounded-full px-6 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.08)] flex items-center gap-3 overflow-visible border border-black/5">
          <Image src="/assets/Group 765.svg" alt="Red Alert Triangle" width={24} height={24} className="object-contain scale-[1.8] shrink-0" />
          <span className="text-[18px] font-bold text-[#171717] tracking-tight">
            {alertCount > 0
              ? `${alertCount} alert${alertCount !== 1 ? "s" : ""} dispatched to municipality`
              : "No alerts dispatched yet — hotspot detection pending"}
          </span>
        </div>
      </div>
    </section>
  );
}
