"use client";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";

/**
 * Desktop: text wrapped around the cut-out SVG shape from the original design.
 * Phone / tablet: an editorial card — image on top, copy below, tagline as a pull quote.
 */
export default function DeformedContainer() {
  const { t } = useI18n();

  return (
    <>
      <article className="overflow-hidden rounded-[28px] border border-black/6 bg-[#F5F5F5] shadow-[0_4px_20px_rgba(0,0,0,0.04)] lg:hidden">
        <div className="relative aspect-[16/10] w-full sm:aspect-[2/1]">
          <Image src="/assets/Municipality.png" alt={t.act.imageAlt} fill sizes="(max-width: 1024px) 100vw, 520px" className="object-cover" />
        </div>
        <div className="p-5 sm:p-7">
          <p className="text-[15px] font-medium leading-[1.6] tracking-tight text-[#2b2b2b]">{t.act.body}</p>
          <p className="mt-5 border-l-[3px] border-red-600 pl-4 text-[17px] font-bold leading-snug tracking-tight text-[#171717]">{t.act.tagline}</p>
        </div>
      </article>

      <div className="relative hidden w-full overflow-visible drop-shadow-[0_4px_20px_rgba(0,0,0,0.04)] lg:block">
        <div className="absolute inset-0 z-0">
          <Image src="/assets/Hero Card.svg" alt="" fill className="object-fill" priority />
        </div>
        <div className="relative z-10 flex w-full flex-row items-stretch gap-8 p-6">
          <div className="flex flex-1 flex-col justify-between py-2">
            <p className="text-[15px] font-medium leading-[1.6] tracking-tight text-[#171717]">{t.act.body}</p>
            <div className="ml-20 mt-6 flex w-full justify-center">
              <p className="w-[60%] text-[15px] font-medium leading-[1.6] tracking-tight text-[#171717]">{t.act.tagline}</p>
            </div>
          </div>
          <div className="relative h-65 w-[min(520px,42%)] shrink-0 overflow-hidden rounded-[14px] border border-black/5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <Image src="/assets/Municipality.png" alt={t.act.imageAlt} fill sizes="520px" className="object-cover" />
          </div>
        </div>
      </div>
    </>
  );
}
