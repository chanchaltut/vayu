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

interface ForecastCard {
  day: string;
  icon: string;
  temp: number;
  isActive: boolean;
}

function getWeatherIcon(code: number): string {
  if (code === 0 || code === 1 || code === 2 || code === 3) {
    return "/assets/SunCloud.png";
  }
  if (code >= 51 && code <= 67) {
    return "/assets/RainCloud.png";
  }
  if (code >= 71 && code <= 77) {
    return "/assets/SnowCloud.png";
  }
  if (code >= 80 && code <= 82) {
    return "/assets/RainCloud.png";
  }
  if (code >= 95 && code <= 99) {
    return "/assets/ThunderCloud.png";
  }
  return "/assets/SunCloud.png"; // default
}

export default function AiPrediction() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [latestAqi, setLatestAqi] = useState<number | null>(null);
  const [latestTemp, setLatestTemp] = useState<number | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [forecastCards, setForecastCards] = useState<ForecastCard[]>([
    { day: "Sat", icon: "/assets/RainCloud.png", temp: 12, isActive: false },
    { day: "Sun", icon: "/assets/RainCloud.png", temp: 11, isActive: true },
    { day: "Mon", icon: "/assets/SunCloud.png", temp: 10, isActive: false },
    { day: "Tue", icon: "/assets/RainCloud.png", temp: 10, isActive: false },
    { day: "Wed", icon: "/assets/SunCloud.png", temp: 10, isActive: false },
    { day: "Thu", icon: "/assets/RainCloud.png", temp: 12, isActive: false },
  ]);

  const fetchHotspots = async () => {
    try {
      const res = await fetch("/api/hotspots");
      const json = await res.json();
      setHotspots(json?.data?.hotspots ?? []);
    } catch (e) {
      console.error("Failed to fetch hotspots", e);
    }
  };

  const fetchReadings = async () => {
    try {
      const res = await fetch("/api/sensors");
      const json = await res.json();
      const data: SensorReading[] = json?.data?.readings ?? [];
      setReadings(data);

      if (data.length > 0) {
        setLatestAqi(data[0].aqi);
        setLatestTemp(
          data[0].temperature != null ? Math.round(data[0].temperature) : null
        );
      }
    } catch (e) {
      console.error("Failed to fetch sensor readings", e);
    }
  };

  const fetchLiveForecast = async () => {
    try {
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=22.5726&longitude=88.3639&daily=temperature_2m_max,weather_code&timezone=Asia/Kolkata"
      );
      const data = await res.json();
      const daily = data?.daily;
      if (!daily?.time) return;

      const mapped: ForecastCard[] = daily.time.slice(0, 6).map((timeStr: string, index: number) => {
        const date = new Date(timeStr);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        const temp = Math.round(daily.temperature_2m_max[index]);
        const weatherCode = daily.weather_code[index];

        return {
          day: dayName,
          icon: getWeatherIcon(weatherCode),
          temp,
          isActive: index === 0, // Make today's card active
        };
      });

      setForecastCards(mapped);
    } catch (err) {
      console.error("Failed to fetch forecast cards", err);
    }
  };

  useEffect(() => {
    fetchHotspots();
    fetchReadings();
    fetchLiveForecast();
  }, []);

  const handleDetect = async () => {
    setIsDetecting(true);
    try {
      const res = await fetch("/api/detect-hotspots", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        // Refetch everything to update the views instantly
        await Promise.all([fetchHotspots(), fetchReadings()]);
      } else {
        alert("Hotspot detection failed. Make sure you have ingested sensor data first.");
      }
    } catch (err) {
      console.error("Error triggering hotspot detection", err);
    } finally {
      setIsDetecting(false);
    }
  };

  const topReasoning =
    hotspots.length > 0
      ? hotspots[0].reasoning
      : "AI is analysing data — run hotspot detection to populate this.";

  return (
    <section
      id="detect"
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
                value={latestTemp != null ? `${latestTemp}°C` : "—"}
              />

              <CountCard
                label="AQI"
                value={latestAqi != null ? latestAqi : "—"}
              />

              <CountCard
                label="Hotspots"
                value={hotspots.length}
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
        <div className="mt-8 w-full max-w-360 flex justify-between items-stretch">
          <div className="w-[45%] flex items-center justify-center gap-4">
            {forecastCards.map((data) => (
              <WeeklyTemperatureCard
                key={data.day}
                day={data.day}
                icon={data.icon}
                temperature={data.temp}
                isActive={data.isActive}
              />
            ))}
          </div>

          <div className="w-[40%] flex">
            <TextDescriptionCard
              reasoning={topReasoning}
              onDetect={handleDetect}
              isDetecting={isDetecting}
            />
          </div>
        </div>
      </div>
    </section>
  );
}