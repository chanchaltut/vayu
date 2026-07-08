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
  red: { bg: "bg-[#050B14]", text: "text-white", icon: "/assets/Shape 89.svg" },
  orange: { bg: "bg-[#5690FF]", text: "text-[#171717]", icon: "/assets/Shape 106.svg" },
  yellow: { bg: "bg-[#FFB800]", text: "text-[#171717]", icon: "/assets/BlackStar.svg" },
  green: { bg: "bg-[#D9FBD0]", text: "text-[#171717]", icon: "/assets/BlackStar.svg" },
};

export default function Municipality() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [alertCount, setAlertCount] = useState<number>(0);

  useEffect(() => {
    fetch("/api/hotspots")
      .then((r) => r.json())
      .then((json) => setHotspots(json?.data?.hotspots ?? []))
      .catch(() => { });

    fetch("/api/alerts")
      .then((r) => r.json())
      .then((json) => setAlertCount(json?.data?.count ?? 0))
      .catch(() => { });
  }, []);

  // Show top-3 hotspots by severity desc; fallback to placeholder cards
  const top3 = hotspots.slice(0, 3);

  return (
    <section className="relative w-full flex flex-col items-center pt-20 pb-28 overflow-hidden">
      {/* Background Grid */}
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
          <ReportCard
            title="Kolkata"
            icon="/assets/Shape 89.svg"
            bgColor="bg-[#050B14]" // Very dark blue/black
            textColor="text-white"
          />
          <ReportCard
            title="howrah"
            icon="/assets/Shape 106.svg"
            bgColor="bg-[#5690FF]" // Vibrant blue
            textColor="text-[#171717]"
          />
          <ReportCard
            title="new jalpaiguri"
            icon="/assets/BlackStar.svg"
            bgColor="bg-[#FFB800]" // Vibrant yellow
            textColor="text-[#171717]"
          />
        </div>

        {/* Alert Count Pill */}
        <div className="mt-8 bg-white rounded-full px-6 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.08)] flex items-center gap-3 overflow-visible">
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
