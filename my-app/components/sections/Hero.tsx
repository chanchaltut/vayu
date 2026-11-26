"use client";
import Image from "next/image";
import { useSyncExternalStore } from "react";
import LanguageToggle from "@/components/buttons/LanguageToggle";
import AqiCard from "@/components/cards/AqiCard";
import WeeklyForecast from "@/components/cards/WeeklyForecast";
import CurrentTemp from "@/components/temperature/CurrentTemp";
import CloudLogo from "@/components/texts/CloudLogo";
import HeroGreeting from "@/components/texts/HeroGreeting";
import { useI18n } from "@/lib/i18n";
import { useVayuData } from "@/lib/vayuData";
import { aqiKey, themeKeyFor, weatherText, type ThemeKey } from "@/lib/weatherUi";

const THEMES: Record<ThemeKey, { bg: string; grid: string; illustration: string }> = {
  clear: {
    bg: "linear-gradient(117.3deg, rgba(252, 140, 60, 0.8) 9.06%, rgba(255, 196, 142, 0.75) 31.05%, rgba(253, 223, 183, 0.8) 47.47%, rgba(228, 181, 137, 0.85) 64.62%, rgba(252, 140, 60, 0.9) 93.42%)",
    grid: "rgba(255, 142, 61, 0.35)",
    illustration: "/assets/SunCloud.png",
  },
  rainy: {
    bg: "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)",
    grid: "rgba(135, 206, 250, 0.35)",
    illustration: "/assets/RainCloud.png",
  },
  stormy: {
    bg: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
    grid: "rgba(186, 85, 211, 0.35)",
    illustration: "/assets/ThunderCloud.png",
  },
  snowy: {
    bg: "linear-gradient(135deg, #83a4d4 0%, #b6fbff 100%)",
    grid: "rgba(255, 255, 255, 0.5)",
    illustration: "/assets/SnowCloud.png",
  },
};

// Decorative glowing squares. `m` marks the few that stay on phones.
const SPARKS: { c: string; m?: boolean; d: string }[] = [
  { c: "top-20 left-30 w-10 h-10 bg-white/30", d: "0s" },
  { c: "top-41 left-21 w-8 h-8 bg-white/20", d: "0.2s" },
  { c: "top-60 left-50 w-10 h-10 bg-white/25", d: "0.4s" },
  { c: "top-42 left-72 w-6 h-6 bg-white/15", d: "0.6s" },
  { c: "top-80 left-10 w-10 h-10 bg-white/20", d: "0.8s" },
  { c: "top-91 left-51 w-8 h-8 bg-white/15", d: "0s" },
  { c: "top-21 left-115 w-8 h-8 bg-white/20", d: "0.2s" },
  { c: "top-11 right-21 w-8 h-8 bg-white/25", d: "0.4s" },
  { c: "top-30 right-50 w-10 h-10 bg-white/20", d: "0.6s" },
  { c: "top-50 right-10 w-10 h-10 bg-white/25", d: "0.8s" },
  { c: "top-72 right-42 w-6 h-6 bg-white/15", d: "0s" },
  { c: "top-91 right-71 w-8 h-8 bg-white/15", d: "0.2s" },
  { c: "top-[30%] left-[8%] w-6 h-6 bg-white/25", m: true, d: "0.3s" },
  { c: "top-[46%] right-[6%] w-8 h-8 bg-white/20", m: true, d: "0.7s" },
  { c: "top-[62%] left-[40%] w-5 h-5 bg-white/20", m: true, d: "0.1s" },
  { c: "top-[12%] left-[52%] w-5 h-5 bg-white/25", m: true, d: "0.5s" },
];

const noopSubscribe = () => () => {};
function partOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

export default function Hero() {
  const { t } = useI18n();
  const { place, temperature, weatherCode, aqi, daily, locating, requestPreciseLocation } = useVayuData();
  // Server renders "morning"; the client swaps in its own clock after hydration.
  const part = useSyncExternalStore(noopSubscribe, partOfDay, () => "morning" as const);

  const themeKey = themeKeyFor(weatherCode);
  const theme = THEMES[themeKey];
  const desc = weatherCode != null ? `${weatherText(weatherCode, t)} · ${t.hero.today}` : "";
  const aqiTitle = aqi != null ? t.aqi[aqiKey(aqi)] : t.hero.aqiLoading;

  const illustration = (cls: string) => (
    <Image
      src={theme.illustration}
      alt={t.hero.illustration}
      width={379}
      height={285}
      priority
      className={`h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-all duration-1000 animate-float ${cls}`}
    />
  );

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] w-full flex-col overflow-hidden"
      style={{ "--grid-color": theme.grid } as React.CSSProperties}
    >
      {(Object.keys(THEMES) as ThemeKey[]).map((k) => (
        <div
          key={k}
          aria-hidden
          className={`absolute inset-0 transition-opacity duration-1000 ${themeKey === k ? "opacity-100" : "opacity-0"}`}
          style={{ background: THEMES[k].bg }}
        />
      ))}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid-pattern" />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {SPARKS.map((s, i) => (
          <div
            key={i}
            className={`absolute shadow-[0_0_16px_3px_rgba(255,255,255,0.3)] animate-twinkle ${s.c} ${s.m ? "md:hidden" : "hidden md:block"}`}
            style={{ animationDelay: s.d }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-5 pb-28 pt-[max(env(safe-area-inset-top),20px)] sm:px-8 md:px-10 md:pb-10 md:pt-6 lg:px-16 lg:pb-16">
        {/* Top bar: language + brand mark */}
        <div className="relative z-20 flex items-center justify-between md:items-start">
          <LanguageToggle />
          <CloudLogo />
        </div>

        {/* Greeting + current conditions */}
        <div className="relative mt-8 flex flex-col gap-8 md:mt-14 md:flex-row md:items-start md:justify-between lg:mt-12">
          <HeroGreeting
            line1={t.hero.good}
            line2={t.hero[part]}
            location={place ?? t.hero.detecting}
            onLocate={requestPreciseLocation}
            locating={locating}
            locateLabel={t.hero.useMyLocation}
            locatingLabel={t.hero.locating}
          />

          <div className="relative">
            <CurrentTemp temperature={temperature} description={desc} />
            {/* Phone: the illustration tucks into the corner beside the temperature */}
            <div className="pointer-events-none absolute -right-2 -top-14 w-[46%] max-w-52 xs:-top-16 md:hidden">
              {illustration("w-full")}
            </div>
          </div>
        </div>

        {/* Tablet / desktop: illustration floats in the middle of the hero */}
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex">
          {illustration("w-60 lg:w-80 xl:w-94")}
        </div>

        {/* Air quality + forecast */}
        <div className="relative mt-auto flex flex-col gap-4 pt-10 md:flex-row md:items-end md:justify-between md:gap-8">
          <AqiCard title={aqiTitle} aqiValue={aqi} label={t.hero.currentAqi} />
          <WeeklyForecast days={daily.slice(1, 6)} label={t.hero.forecast} />
        </div>
      </div>
    </section>
  );
}
