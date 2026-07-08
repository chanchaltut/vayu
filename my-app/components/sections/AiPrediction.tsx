"use client";

import { useEffect, useState } from "react";
import GridBackground from "@/components/backgrounds/GridBackground";
import SectionHeader from "@/components/texts/SectionHeader";
import CountCard from "@/components/cards/CountCard";
import AqiOverviewCard from "../cards/AqiOverviewCard";
import WeeklyTemperatureCard from "../cards/WeeklyTemperatureCard";
import HotspotsMapCard from "../cards/HotspotsMapCard";
import TextDescriptionCard from "../cards/TextDescriptionCard";

interface Hotspot {
  id: string;
  lat: number;
  lon: number;
  severity: number;
  avg_aqi: number;
  avg_temperature: number;
  reasoning: string;
  colour: string;
  aqi_category: string;
  action: string;
}

interface SensorReading {
  aqi: number;
  temperature: number;
  timestamp: string;
}

const weekTempData = [
  { day: "Sat", icon: "/assets/RainCloud.png", temp: 12, isActive: false },
  { day: "Sun", icon: "/assets/RainCloud.png", temp: 11, isActive: true },
  { day: "Mon", icon: "/assets/SunCloud.png", temp: 10, isActive: false },
  { day: "Tue", icon: "/assets/RainCloud.png", temp: 10, isActive: false },
  { day: "Wed", icon: "/assets/SunCloud.png", temp: 10, isActive: false },
  { day: "Thu", icon: "/assets/RainCloud.png", temp: 12, isActive: false },
];

export default function AiPrediction() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [latestAqi, setLatestAqi] = useState<number>(0);
  const [latestTemp, setLatestTemp] = useState<number>(0);

  useEffect(() => {
    // Fetch hotspots
    fetch("/api/hotspots")
      .then((r) => r.json())
      .then((json) => setHotspots(json?.data?.hotspots ?? []))
      .catch(() => { });

    // Fetch recent sensor readings
    fetch("/api/sensors")
      .then((r) => r.json())
      .then((json) => {
        const data: SensorReading[] = json?.data?.readings ?? [];

        setReadings(data);

        if (data.length > 0) {
          setLatestAqi(data[0].aqi);

          setLatestTemp(
            data[0].temperature != null
              ? Math.round(data[0].temperature)
              : 0
          );
        }
      })
      .catch(() => { });
  }, []);

  const topReasoning =
    hotspots[0]?.reasoning ??
    "AI is analysing data — run hotspot detection to populate this.";

  return (
    <section
      id="ai-prediction"
      className="relative w-full flex flex-col items-center pt-20 pb-8 overflow-hidden"
    >
      {/* Background */}
      <GridBackground />

      <div className="relative z-10 w-full max-w-360 mx-auto px-8 flex flex-col items-center">
        <SectionHeader
          heading="Detect. Analyze. Predict."
          subheading="Hotspot detection now. Air quality forecasts for the next 24 hours."
        />

        {/* Top Row */}
        <div className="mt-8 w-full max-w-360 flex justify-between gap-8">
          {/* Left Column */}
          <div className="flex flex-col gap-6 w-[45%]">
            <div className="flex items-center justify-between w-full">
              <CountCard
                label="Temperature"
                value={latestTemp ? `${latestTemp}°C` : "—"}
              />

              <CountCard
                label="AQI"
                value={latestAqi || "—"}
              />

              <CountCard
                label="Hotspots"
                value={hotspots.length || "—"}
              />
            </div>

            <AqiOverviewCard readings={readings} />
          </div>

          {/* Right Column */}
          <div className="w-[50%] flex justify-end">
            <HotspotsMapCard hotspots={hotspots} />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-8 w-full max-w-360 flex justify-between items-end">
          <div className="w-[45%] flex items-end justify-center gap-4">
            {weekTempData.map((data) => (
              <WeeklyTemperatureCard
                key={data.day}
                day={data.day}
                icon={data.icon}
                temperature={data.temp}
                isActive={data.isActive}
              />
            ))}
          </div>

          <div className="w-[40%]">
            <TextDescriptionCard reasoning={topReasoning} />
          </div>
        </div>
      </div>
    </section>
  );
}