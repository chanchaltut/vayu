import GridBackground from "@/components/backgrounds/GridBackground";
import SectionHeader from "@/components/texts/SectionHeader";
import ReportCard from "@/components/cards/ReportCard";
import Image from "next/image";
import DeformedContainer from "../containers/DeformedContainer";

export default function Municipality() {
  return (
    <section className="relative w-full flex flex-col items-center pt-20 pb-28 overflow-hidden">
      {/* Background Grid */}
      <GridBackground />

      {/* Section Content Wrapper */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 flex flex-col items-center">
        {/* Header */}
        <SectionHeader
          heading="Act now."
          subheading="Confirmed hotspots, ranked by severity — ready for immediate dispatch."
        />

        <div className="mt-12 w-full">
          <DeformedContainer />
        </div>

        {/* --- Report Cards Row --- */}
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

        {/* --- Bottom Alert Pill --- */}
        <div className="mt-8 bg-white rounded-full px-6 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.08)] flex items-center gap-3 overflow-visible">
          {/* Custom Red Alert Triangle SVG */}
          <Image
            src="/assets/Group 765.svg"
            alt="Red Alert Triangle"
            width={24}
            height={24}
            className="object-contain scale-[1.8] shrink-0"
          />
          <span className="text-[18px] font-bold text-[#171717] tracking-tight">
            So far 30 responses are initiated by the municipality
          </span>
        </div>
      </div>
    </section>
  );
}
