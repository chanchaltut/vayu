"use client";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import type { DailyWeather } from "@/lib/vayuData";
import { weatherIcon, weatherText, weekday } from "@/lib/weatherUi";

interface WeeklyForecastProps {
  days: DailyWeather[];
  label?: string;
}

export default function WeeklyForecast({ days, label }: WeeklyForecastProps) {
  const { lang, t } = useI18n();
  const rows = days.length ? days : Array.from({ length: 5 }, () => null);

  return (
    <div className="w-full md:w-auto">
      {label && <p className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wider text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.22)] md:hidden">{label}</p>}

      {/* Phone: five glass tiles side by side */}
      <div className="grid grid-cols-5 gap-2 md:hidden">
        {rows.map((d, i) => (
          <div
            key={d?.date ?? i}
            className="flex flex-col items-center gap-1 rounded-2xl border border-white/30 bg-white/20 px-1 py-2.5 text-white backdrop-blur-md [text-shadow:0_1px_3px_rgba(0,0,0,0.22)]"
          >
            <span className="w-full truncate text-center text-[13px] font-semibold">{d ? weekday(d.date, lang.locale) : "—"}</span>
            <div className="relative h-8 w-8">
              {d && <Image src={weatherIcon(d.code)} alt={weatherText(d.code, t)} fill sizes="32px" className="object-contain" />}
            </div>
            <span className="text-[17px] font-semibold leading-none tabular-nums">
              {d ? d.max : "--"}
              <span className="align-top text-[10px]">°</span>
            </span>
          </div>
        ))}
      </div>

      {/* Tablet / desktop: vertical list */}
      <div className="hidden w-48 flex-col md:flex lg:w-54">
        {rows.map((d, i) => (
          <div key={d?.date ?? i} className="flex items-center justify-between pt-2">
            <span className="w-16 truncate text-[22px] font-normal text-white lg:text-[28px]">
              {d ? weekday(d.date, lang.locale) : "—"}
            </span>
            <div className="flex items-start">
              <span className="text-[22px] font-normal leading-none text-white tabular-nums lg:text-[28px]">{d ? d.max : "--"}</span>
              <span className="ml-0.5 mt-1 text-[12px] font-normal text-white lg:text-[14px]">°C</span>
            </div>
            <div className="relative h-10 w-10 shrink-0 lg:h-12 lg:w-12">
              {d && <Image src={weatherIcon(d.code)} alt={weatherText(d.code, t)} fill sizes="48px" className="object-contain" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
