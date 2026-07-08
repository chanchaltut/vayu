import GridBackground from "@/components/backgrounds/GridBackground";
import SectionHeader from "@/components/texts/SectionHeader";
import UploadCard from "@/components/cards/UploadCard"; // IMPORT ADDED
import InstructionCard from "../cards/InstructionCard";

export default function CitizenUpload() {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center pt-20 pb-8 overflow-hidden">
      {/* The Reusable White Grid Background */}
      <GridBackground />

      {/* Section Content Wrapper */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 flex flex-col items-center">
        {/* Header */}
        <SectionHeader
          heading="See something? Report it."
          subheading="Your photo could trigger action within the hour."
        />

        {/* Main Upload Card */}
        <div className="mt-16 w-full flex justify-center">
          <UploadCard />
        </div>

        <div className="mt-16 flex flex-row items-center justify-center gap-18 w-full max-w-290">
          <InstructionCard
            title="Go to the source"
            description="Stand close enough to clearly show the pollution — smoke, burning waste, dust, or discharge. Make sure the source fills most of the frame, not the background."
          />
          <InstructionCard
            title="Take the photo right now"
            description="Capture the event as it is happening — do not use an old photo or a screenshot. Our system records the exact time of your shot, which is used to verify and timestamp the hotspot report."
          />
          <InstructionCard
            title="Upload and confirm your location"
            description="Tap upload, allow location access when prompted, and submit. Your GPS coordinates are attached automatically — no need to type an address. The AI will analyse and map your report within seconds."
          />
        </div>

        {/* --- Caution Text --- */}
        <div className="mt-10 flex items-center justify-center gap-2 text-[#8C8C8C] text-[15px] font-medium tracking-tight">
          {/* Alert Circle SVG */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>Do not enter unsafe or restricted areas to get the shot.</span>
        </div>
      </div>
    </section>
  );
}
