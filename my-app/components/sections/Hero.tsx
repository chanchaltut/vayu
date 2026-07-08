"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import LanguageToggle from "@/components/buttons/LanguageToggle";
import AqiCard from "@/components/cards/AqiCard";
import WeeklyForecast from "@/components/cards/WeeklyForecast";
import CurrentTemp from "@/components/temperature/CurrentTemp";
import CloudLogo from "@/components/texts/CloudLogo";
import HeroGreeting from "@/components/texts/HeroGreeting";

export default function Hero() {
  const [temperature, setTemperature] = useState(27);
  const [aqi, setAqi] = useState(30);
  const [aqiLabel, setAqiLabel] = useState("Air quality data loading...");

  useEffect(() => {
    fetch("/api/sensors")
      .then((r) => r.json())
      .then((json) => {
        const latest = json?.data?.readings?.[0];
        if (!latest) return;
        if (latest.temperature != null) setTemperature(Math.round(latest.temperature));
        if (latest.aqi != null) {
          setAqi(latest.aqi);
          const a = latest.aqi;
          setAqiLabel(
            a <= 50 ? "Good air quality" :
            a <= 100 ? "Satisfactory air quality" :
            a <= 200 ? "Moderate air quality" :
            a <= 300 ? "Poor — harmful for sensitive groups" :
            a <= 400 ? "Very poor — harmful for your body" :
            "Severe — hazardous"
          );
        }
      })
      .catch(() => {/* keep defaults */});
  }, []);

  return (
    <section className="relative min-h-screen w-full bg-hero-gradient overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none"></div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-30 w-10 h-10 bg-white/30 backdrop-blur-sm shadow-[0_0_20px_4px_rgba(255,255,255,0.4)] animate-twinkle" style={{ animationDelay: "0s" }}></div>
        <div className="absolute top-41 left-21 w-8 h-8 bg-white/20 shadow-[0_0_14px_3px_rgba(255,255,255,0.3)] animate-twinkle" style={{ animationDelay: "0.2s" }}></div>
        <div className="absolute top-60 left-50 w-10 h-10 bg-white/25 shadow-[0_0_16px_3px_rgba(255,255,255,0.35)] animate-twinkle" style={{ animationDelay: "0.4s" }}></div>
        <div className="absolute top-42 left-72 w-6 h-6 bg-white/15 shadow-[0_0_10px_2px_rgba(255,255,255,0.25)] animate-twinkle" style={{ animationDelay: "0.6s" }}></div>
        <div className="absolute top-80 left-10 w-10 h-10 bg-white/20 shadow-[0_0_16px_3px_rgba(255,255,255,0.3)] animate-twinkle" style={{ animationDelay: "0.8s" }}></div>
        <div className="absolute top-91 left-51 w-8 h-8 bg-white/15 shadow-[0_0_12px_2px_rgba(255,255,255,0.25)] animate-twinkle" style={{ animationDelay: "0s" }}></div>
        <div className="absolute top-21 left-115 -translate-x-1/2 w-8 h-8 bg-white/20 shadow-[0_0_14px_3px_rgba(255,255,255,0.3)] animate-twinkle" style={{ animationDelay: "0.2s" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white/10 shadow-[0_0_10px_2px_rgba(255,255,255,0.2)]"></div>
        <div className="absolute top-11 right-21 w-8 h-8 bg-white/25 shadow-[0_0_14px_3px_rgba(255,255,255,0.3)] animate-twinkle" style={{ animationDelay: "0.4s" }}></div>
        <div className="absolute top-30 right-50 w-10 h-10 bg-white/20 shadow-[0_0_16px_3px_rgba(255,255,255,0.3)] animate-twinkle" style={{ animationDelay: "0.6s" }}></div>
        <div className="absolute top-50 right-10 w-10 h-10 bg-white/25 shadow-[0_0_16px_3px_rgba(255,255,255,0.35)] animate-twinkle" style={{ animationDelay: "0.8s" }}></div>
        <div className="absolute top-72 right-42 w-6 h-6 bg-white/15 shadow-[0_0_10px_2px_rgba(255,255,255,0.25)] animate-twinkle" style={{ animationDelay: "0s" }}></div>
        <div className="absolute top-91 right-71 w-8 h-8 bg-white/15 shadow-[0_0_12px_2px_rgba(255,255,255,0.25)] animate-twinkle" style={{ animationDelay: "0.2s" }}></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-between w-full max-w-8xl mx-auto p-10 lg:p-16">
        {/* TOP HALF */}
        <div className="flex flex-col gap-12">
          <div className="w-full flex justify-between items-center h-16 relative z-20">
            <div className="w-37 -mt-26 flex justify-start"><LanguageToggle /></div>
            <div className="flex-1"></div>
            <div className="w-37 -mt-16 flex justify-end"><CloudLogo /></div>
          </div>
          <div className="w-full flex justify-between relative z-10 pointer-events-none">
            <HeroGreeting />
            <CurrentTemp temperature={temperature} />
          </div>
        </div>

        {/* CENTER FLOAT */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Image src="/assets/SunCloud.png" alt="Sun and Cloud" width={379} height={285} className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] w-94 h-auto" priority />
        </div>

        {/* BOTTOM HALF */}
        <div className="w-full flex justify-between items-end">
          <AqiCard title={aqiLabel} aqiValue={aqi} />
          <WeeklyForecast />
        </div>
      </div>
    </section>
  );
}
