"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface DailyWeather {
  day: string;
  temp: number;
  icon: string;
}

interface WeeklyForecastProps {
  lat?: number;
  lon?: number;
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

export default function WeeklyForecast({
  lat = 22.5726,
  lon = 88.3639,
}: WeeklyForecastProps) {
  const [forecast, setForecast] = useState<DailyWeather[]>([
    { day: "Mon", temp: 30, icon: "/assets/SunCloud.png" },
    { day: "Tue", temp: 29, icon: "/assets/RainCloud.png" },
    { day: "Wed", temp: 28, icon: "/assets/SunCloud.png" },
    { day: "Thu", temp: 29, icon: "/assets/RainCloud.png" },
    { day: "Fri", temp: 28, icon: "/assets/ThunderCloud.png" },
  ]);

  useEffect(() => {
    // Fetch live 5-day daily forecast based on real satellite-meteorology models
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,weather_code&timezone=Asia/Kolkata`
    )
      .then((res) => res.json())
      .then((data) => {
        const daily = data?.daily;
        if (!daily?.time) return;

        const mapped: DailyWeather[] = daily.time.slice(1, 6).map((timeStr: string, index: number) => {
          const date = new Date(timeStr);
          const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
          const temp = Math.round(daily.temperature_2m_max[index + 1]);
          const weatherCode = daily.weather_code[index + 1];

          return {
            day: dayName,
            temp,
            icon: getWeatherIcon(weatherCode),
          };
        });

        setForecast(mapped);
      })
      .catch((err) => {
        console.error("Failed to load satellite forecast", err);
      });
  }, [lat, lon]);

  return (
    <div className="flex flex-col w-54">
      {forecast.map((data) => (
        <div key={data.day} className="flex items-center justify-between pt-2">
          {/* Day */}
          <span className="text-[28px] font-normal text-white w-15">
            {data.day}
          </span>

          {/* Temperature with Celsius symbol */}
          <div className="flex items-start">
            <span className="text-[28px] font-normal text-white leading-none">
              {data.temp}
            </span>
            <span className="text-[14px] font-normal text-white mt-1 ml-0.5">
              °C
            </span>
          </div>

          {/* Weather Icon */}
          <div className="w-12 h-12 relative shrink-0">
            <Image
              src={data.icon}
              alt={`${data.day} weather`}
              fill
              sizes="(max-width: 1024px) 32px, 48px"
              className="object-contain"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
