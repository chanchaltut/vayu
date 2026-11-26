"use client";
import GridBackground from "@/components/backgrounds/GridBackground";
import SectionHeader from "@/components/texts/SectionHeader";
import UploadCard from "@/components/cards/UploadCard";
import InstructionCard from "../cards/InstructionCard";
import { useI18n } from "@/lib/i18n";

export default function CitizenUpload() {
  const { t } = useI18n();
  const steps = t.report.steps;

  return (
    <section id="report" className="relative flex w-full flex-col items-center overflow-hidden pb-12 pt-16 md:min-h-screen md:pb-8 md:pt-24 lg:pt-20">
      <GridBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 sm:px-6 md:px-8">
        <SectionHeader eyebrow={t.nav.report} heading={t.report.heading} subheading={t.report.sub} />

        <div className="mt-8 flex w-full justify-center md:mt-14 lg:mt-16">
          <UploadCard />
        </div>

        <ol className="mt-10 w-full max-w-150 px-1 md:mt-14 md:grid md:max-w-290 md:grid-cols-3 md:gap-6 md:px-0 lg:mt-16 lg:gap-12">
          {steps.map((s, i) => (
            <InstructionCard key={i} step={i + 1} title={s.title} description={s.desc} last={i === steps.length - 1} />
          ))}
        </ol>

        <div className="mt-8 flex max-w-150 items-start justify-center gap-2 rounded-2xl bg-[#FFF7ED] px-4 py-3 text-[13.5px] font-medium tracking-tight text-[#9a3412] md:mt-10 md:items-center md:bg-transparent md:p-0 md:text-[15px] md:text-[#8C8C8C]">
          <svg className="mt-0.5 shrink-0 md:mt-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{t.report.caution}</span>
        </div>
      </div>
    </section>
  );
}
