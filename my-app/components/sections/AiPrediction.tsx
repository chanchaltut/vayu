"use client";
import { useEffect, useState } from "react";
import GridBackground from "@/components/backgrounds/GridBackground";
import SectionHeader from "@/components/texts/SectionHeader";
import CountCard from "@/components/cards/CountCard";
import AqiOverviewCard from "../cards/AqiOverviewCard";
import WeeklyTemperatureCard from "../cards/WeeklyTemperatureCard";
import HotspotsMapCard from "../cards/HotspotsMapCard";
import TextDescriptionCard from "../cards/TextDescriptionCard";
import Toast from "../Toast";

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
  temperature?: number;
  timestamp: string;
}

interface ForecastCard {
  day: string;
  icon: string;
  temp: number;
  isActive: boolean;
}

interface Coords {
  lat: number;
  lon: number;
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
  
  // Geolocation cascade matching Hero.tsx
  const [coords, setCoords] = useState<Coords>({ lat: 22.5726, lon: 88.3639 });
  const [isDetecting, setIsDetecting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [forecastCards, setForecastCards] = useState<ForecastCard[]>([
    { day: "Sat", icon: "/assets/RainCloud.png", temp: 12, isActive: false },
    { day: "Sun", icon: "/assets/RainCloud.png", temp: 11, isActive: true },
    { day: "Mon", icon: "/assets/SunCloud.png", temp: 10, isActive: false },
    { day: "Tue", icon: "/assets/RainCloud.png", temp: 10, isActive: false },
    { day: "Wed", icon: "/assets/SunCloud.png", temp: 10, isActive: false },
    { day: "Thu", icon: "/assets/RainCloud.png", temp: 12, isActive: false },
  ]);

  // 1. Resolve Location Cascade (matching Hero.tsx priorities)
  useEffect(() => {
    const resolveLocation = async () => {
      // Priority 1: IP Geolocation — automatic & captures city like Kalyani
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.latitude && data.longitude) {
          setCoords({ lat: data.latitude, lon: data.longitude });
          return;
        }
      } catch (e) {
        console.error("[PREDICTION-LOC] IP lookup fallback active:", e);
      }

      // Priority 2: Check local storage cache
      const cachedCoords = localStorage.getItem("vayu_last_upload_coords");
      if (cachedCoords) {
        try {
          const parsed = JSON.parse(cachedCoords);
          if (parsed.lat && parsed.lon) {
            setCoords({ lat: parsed.lat, lon: parsed.lon });
            return;
          }
        } catch (e) {}
      }

      // Priority 3: Latest hardware node coordinate
      try {
        const res = await fetch("/api/sensors");
        const json = await res.json();
        const latest = json?.data?.readings?.[0];
        if (latest && latest.lat && latest.lon) {
          setCoords({ lat: latest.lat, lon: latest.lon });
          return;
        }
      } catch (e) {}

      // Priority 4: Browser geolocation fallback
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCoords({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            });
          },
          () => {
            setCoords({ lat: 22.5726, lon: 88.3639 }); // default Kolkata
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      }
    };

    resolveLocation();
  }, []);

  // 2. Fetch hotspots
  const fetchHotspots = async () => {
    try {
      const res = await fetch("/api/hotspots");
      const json = await res.json();
      setHotspots(json?.data?.hotspots ?? []);
    } catch (e) {
      console.error("Failed to fetch hotspots", e);
    }
  };

  // 3. Fetch readings (from BigQuery table or fallback dynamically to live hourly satellite AQI for current city)
  const fetchReadings = async () => {
    try {
      const res = await fetch("/api/sensors");
      const json = await res.json();
      let data: SensorReading[] = json?.data?.readings ?? [];
      
      // Dynamic Fallback: If BigQuery holds no readings, fetch live hourly satellite AQI values for coords
      if (data.length === 0) {
        const aqRes = await fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&hourly=us_aqi&timezone=Asia/Kolkata`
        );
        const aqJson = await aqRes.json();
        const hourlyAqi = aqJson?.hourly?.us_aqi;
        const hourlyTime = aqJson?.hourly?.time;
        if (hourlyAqi && hourlyTime) {
          // Take the last 7 hours of historical readings to represent the AQI trend
          const endIndex = hourlyAqi.length;
          const startIndex = Math.max(0, endIndex - 7);
          const slicedAqi = hourlyAqi.slice(startIndex, endIndex);
          const slicedTime = hourlyTime.slice(startIndex, endIndex);
          
          data = slicedAqi.map((aqiVal: number, idx: number) => ({
            aqi: aqiVal,
            timestamp: slicedTime[idx],
          }));
        }
      }
      setReadings(data);
    } catch (e) {
      console.error("Failed to fetch sensor readings", e);
    }
  };

  // 4. Fetch weather temperature / AQI for resolved geolocated coordinates
  useEffect(() => {
    const fetchLocalStats = async () => {
      try {
        // Fetch weather
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m`;
        const weatherRes = await fetch(weatherUrl);
        const weatherJson = await weatherRes.json();
        if (weatherJson?.current?.temperature_2m != null) {
          setLatestTemp(Math.round(weatherJson.current.temperature_2m));
        }

        // Fetch AQI
        const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&current=us_aqi`;
        const aqRes = await fetch(aqUrl);
        const aqJson = await aqRes.json();
        if (aqJson?.current?.us_aqi != null) {
          setLatestAqi(aqJson.current.us_aqi);
        }
      } catch (err) {
        console.error("Failed to fetch local stats for prediction section", err);
      }
    };

    fetchHotspots();
    fetchReadings();
    fetchLocalStats();
  }, [coords]);

  // 5. Fetch dynamic weekly weather forecast cards for coordinates
  useEffect(() => {
    const fetchLiveForecast = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,weather_code&timezone=Asia/Kolkata`
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

    fetchLiveForecast();
  }, [coords]);

  const handleDetect = async () => {
    setIsDetecting(true);
    try {
      const res = await fetch("/api/detect-hotspots", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        // Refetch everything to update the views instantly
        await Promise.all([fetchHotspots(), fetchReadings()]);
        
        // Dispatch custom event to auto-refresh the Municipality cards
        window.dispatchEvent(new Event("vayu_hotspots_updated"));

        setToast({
          message: `Hotspot detection complete! Identified ${json.data.hotspots_detected} active cells.`,
          type: "success",
        });
      } else {
        setToast({
          message: "Hotspot detection completed with no new anomalies identified.",
          type: "error",
        });
      }
    } catch (err) {
      setToast({
        message: "Network error triggering hotspot fusion engine.",
        type: "error",
      });
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
      {/* Dynamic Toast Popup */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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
            <HotspotsMapCard
              hotspots={hotspots}
              centerLat={coords.lat}
              centerLon={coords.lon}
            />
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