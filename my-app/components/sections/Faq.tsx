"use client";
import GridBackground from "@/components/backgrounds/GridBackground";
import SectionHeader from "@/components/texts/SectionHeader";
import { useI18n } from "@/lib/i18n";

// Visible answers mirror the FAQPage JSON-LD in lib/seo.ts.
export default function Faq() {
  const { t } = useI18n();
  return (
    <section id="faq" className="relative flex w-full flex-col items-center overflow-hidden pb-14 pt-16 md:pb-24 md:pt-20">
      <GridBackground />
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-4 sm:px-6">
        <SectionHeader eyebrow="FAQ" heading={t.faq.heading} subheading={t.faq.sub} />
        <div className="mt-8 flex w-full flex-col gap-2.5 md:mt-12 md:gap-3">
          {t.faq.items.map((f, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-black/8 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-shadow open:shadow-[0_8px_30px_rgba(0,0,0,0.06)] md:rounded-3xl"
              open={i === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[16px] font-bold tracking-tight text-[#1A1A1A] md:px-6 md:py-5 md:text-[18px] [&::-webkit-details-marker]:hidden">
                <h3>{f.q}</h3>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5F5F5] transition-transform duration-300 group-open:rotate-45">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="px-5 pb-5 text-[15px] font-medium leading-[1.6] text-[#444] md:px-6 md:pb-6 md:text-[16px]">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
