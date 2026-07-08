"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import LanguageToggle from "@/components/buttons/LanguageToggle";
import AqiCard from "@/components/cards/AqiCard";
import WeeklyForecast from "@/components/cards/WeeklyForecast";
import CurrentTemp from "@/components/temperature/CurrentTemp";
import CloudLogo from "@/components/texts/CloudLogo";
import HeroGreeting from "@/components/texts/HeroGreeting";

interface Coords {
  lat: number;
  lon: number;
}

interface WeatherTheme {
  bg: string;
  grid: string;
  illustration: string;
}

const THEMES: Record<string, WeatherTheme> = {
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

function getThemeKey(code: number): string {
  if (code === 0 || code === 1 || code === 2 || code === 3) {
    return "clear";
  }
  if (code >= 51 && code <= 67) {
    return "rainy";
  }
  if (code >= 71 && code <= 77) {
    return "snowy";
  }
  if (code >= 80 && code <= 82) {
    return "rainy";
  }
  if (code >= 95 && code <= 99) {
    return "stormy";
  }
  return "clear"; // default
}

function getWeatherDescription(code: number): string {
  if (code === 0) return "clear sky";
  if (code === 1 || code === 2 || code === 3) return "mainly clear and partly cloudy";
  if (code === 45 || code === 48) return "foggy conditions";
  if (code >= 51 && code <= 55) return "light to moderate drizzle";
  if (code >= 61 && code <= 65) return "occasional rain showers";
  if (code >= 71 && code <= 77) return "light snow flurries";
  if (code >= 80 && code <= 82) return "violent rain showers";
  if (code >= 95 && code <= 99) return "thunderstorms and unstable weather";
  return "partly cloudy";
}

export default function Hero() {
  const [temperature, setTemperature] = useState(27);
  const [aqi, setAqi] = useState(30);
  const [aqiLabel, setAqiLabel] = useState("Air quality data loading...");
  const [weatherDesc, setWeatherDesc] = useState("mainly clear and partly cloudy");
  
  // Theme key state to drive smooth background layers transitions
  const [themeKey, setThemeKey] = useState<string>("clear");
  const [activeTheme, setActiveTheme] = useState<WeatherTheme>(THEMES.clear);

  // Geolocation states
  const [coords, setCoords] = useState<Coords>({ lat: 22.5726, lon: 88.3639 });
  const [locationName, setLocationName] = useState("Detecting location...");
  const [greeting, setGreeting] = useState({ line1: "Good", line2: "Morning" });

  // 1. Calculate time-of-day greeting
  useEffect(() => {
    const hrs = new Date().getHours();
    if (hrs >= 5 && hrs < 12) {
      setGreeting({ line1: "Good", line2: "Morning" });
    } else if (hrs >= 12 && hrs < 17) {
      setGreeting({ line1: "Good", line2: "Afternoon" });
    } else if (hrs >= 17 && hrs < 21) {
      setGreeting({ line1: "Good", line2: "Evening" });
    } else {
      setGreeting({ line1: "Good", line2: "Night" });
    }
  }, []);

  // 2. Geolocation cascade (IP location, Photo upload, Hardware deployed, Browser Geolocation fallback)
  useEffect(() => {
    const resolveLocation = async () => {
      // Priority 1: IP Geolocation (via ipapi.co) — fast, automatic, captures true city like Kalyani
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.latitude && data.longitude) {
          const lat = data.latitude;
          const lon = data.longitude;
          setCoords({ lat, lon });
          setLocationName(`${data.city || "Kalyani"}, ${data.country_name || "India"}`);
          return; // geolocated successfully via IP, exit cascade
        }
      } catch (e) {
        console.error("IP Geolocation failed, fallback active:", e);
      }

      // Priority 2: Check local storage for last uploaded photo coordinates
      const cachedCoords = localStorage.getItem("vayu_last_upload_coords");
      if (cachedCoords) {
        try {
          const parsed = JSON.parse(cachedCoords);
          if (parsed.lat && parsed.lon) {
            setCoords({ lat: parsed.lat, lon: parsed.lon });
            setLocationName(parsed.city || "Reported Location");
            return;
          }
        } catch (e) {}
      }

      // Priority 3: Fetch hardware coordinates from latest sensor reading
      try {
        const res = await fetch("/api/sensors");
        const json = await res.json();
        const latest = json?.data?.readings?.[0];
        if (latest && latest.lat && latest.lon) {
          setCoords({ lat: latest.lat, lon: latest.lon });
          setLocationName(latest.source === "satellite" ? "Kolkata, India" : "Hardware Deployed");
          return;
        }
      } catch (e) {}

      // Priority 4: Browser geolocation with High Accuracy
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            setCoords({ lat, lon });
            
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
              );
              const data = await res.json();
              const addr = data?.address;
              const place = addr?.suburb || addr?.town || addr?.village || addr?.city_district || addr?.city || addr?.county || addr?.state || "India";
              setLocationName(`${place}, India`);
            } catch (e) {
              setLocationName("Your Location");
            }
          },
          () => {
            // Default final fallback
            setLocationName("Kolkata, India");
            setCoords({ lat: 22.5726, lon: 88.3639 });
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } else {
        setLocationName("Kolkata, India");
        setCoords({ lat: 22.5726, lon: 88.3639 });
      }
    };

    resolveLocation();
  }, []);

  // 3. Fetch real meteorological data & map climate visual themes
  useEffect(() => {
    const fetchWeatherAndAqi = async () => {
      try {
        // Fetch weather
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code`;
        const weatherRes = await fetch(weatherUrl);
        const weatherJson = await weatherRes.json();
        
        if (weatherJson?.current?.temperature_2m != null) {
          setTemperature(Math.round(weatherJson.current.temperature_2m));
        }
        if (weatherJson?.current?.weather_code != null) {
          const code = weatherJson.current.weather_code;
          setWeatherDesc(getWeatherDescription(code));
          
          // Select visual weather template dynamically
          const tKey = getThemeKey(code);
          setThemeKey(tKey);
          setActiveTheme(THEMES[tKey]);
        }

        // Fetch satellite-derived Air Quality
        const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&current=us_aqi`;
        const aqRes = await fetch(aqUrl);
        const aqJson = await aqRes.json();
        const liveAqi = aqJson?.current?.us_aqi;
        
        if (liveAqi != null) {
          setAqi(liveAqi);
          setAqiLabel(
            liveAqi <= 50 ? "Good air quality" :
              liveAqi <= 100 ? "Satisfactory air quality" :
                liveAqi <= 200 ? "Moderate air quality" :
                  liveAqi <= 300 ? "Poor — harmful for sensitive groups" :
                    liveAqi <= 400 ? "Very poor — harmful for your body" :
                      "Severe — hazardous"
          );
        }
      } catch (err) {
        console.error("Failed to load location parameters", err);
      }
    };

    fetchWeatherAndAqi();
  }, [coords]);

  return (
    <section 
      className="relative min-h-screen w-full overflow-hidden flex flex-col"
      style={{
        "--grid-color": activeTheme.grid,
      } as React.CSSProperties}
    >
      {/* Absolute background layers with hardware-accelerated transitions to bypass linear-gradient limitation */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          themeKey === "clear" ? "opacity-100" : "opacity-0"
        }`}
        style={{ background: THEMES.clear.bg }}
      />
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          themeKey === "rainy" ? "opacity-100" : "opacity-0"
        }`}
        style={{ background: THEMES.rainy.bg }}
      />
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          themeKey === "stormy" ? "opacity-100" : "opacity-0"
        }`}
        style={{ background: THEMES.stormy.bg }}
      />
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          themeKey === "snowy" ? "opacity-100" : "opacity-0"
        }`}
        style={{ background: THEMES.snowy.bg }}
      />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none" />

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
          <div className="w-full flex justify-between relative z-10">
            <HeroGreeting line1={greeting.line1} line2={greeting.line2} location={locationName} />
            <CurrentTemp temperature={temperature} description={weatherDesc} />
          </div>
        </div>

        {/* --- CENTER FLOAT: Climate Illustration (Smooth transitions + soft floating animation) --- */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Image
            src={activeTheme.illustration}
            alt="Climate Illustration"
            width={379}
            height={285}
            className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] w-94 h-auto transition-all duration-1000 animate-float"
            priority
          />
        </div>

        {/* BOTTOM HALF */}
        <div className="w-full flex justify-between items-end">
          <AqiCard title={aqiLabel} aqiValue={aqi} />
          <WeeklyForecast lat={coords.lat} lon={coords.lon} />
        </div>
      </div>
    </section>
  );
}
