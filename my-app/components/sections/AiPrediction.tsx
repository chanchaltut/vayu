import GridBackground from "@/components/backgrounds/GridBackground";
import SectionHeader from "@/components/texts/SectionHeader";
import CountCard from "@/components/cards/CountCard";
import AqiOverviewCard from "../cards/AqiOverviewCard";
import WeeklyTemperatureCard from "../cards/WeeklyTemperatureCard";
import HotspotsMapCard from "../cards/HotspotsMapCard";
import TextDescriptionCard from "../cards/TextDescriptionCard";

export default function AiPrediction() {
  const weekTempData = [
    {
      day: "Sat",
      icon: "/assets/RainCloud.png",
      temp: 12,
      isActive: false
    },
    {
      day: "Sun",
      icon: "/assets/RainCloud.png",
      temp: 11,
      isActive: true
    }, // The active deep blue card
    {
      day: "Mon",
      icon: "/assets/SunCloud.png",
      temp: 10,
      isActive: false
    },
    {
      day: "Tue",
      icon: "/assets/RainCloud.png",
      temp: 10,
      isActive: false
    },
    {
      day: "Wed",
      icon: "/assets/SunCloud.png",
      temp: 10,
      isActive: false
    },
    {
      day: "Thu",
      icon: "/assets/RainCloud.png",
      temp: 12,
      isActive: false
    },
  ];

  return (
    <section id="ai-prediction" className="relative w-full flex flex-col items-center pt-20 pb-8 overflow-hidden">
      {/* Reusable White Grid Background */}
      <GridBackground />

      {/* Section Content Wrapper */}
      <div className="relative z-10 w-full max-w-360 mx-auto px-8 flex flex-col items-center">
        {/* Header */}
        <SectionHeader
          heading="Detect. Analyze. Predict."
          subheading="Hotspot detection now. Air quality forecasts for the next 24 hours."
        />

        {/* --- TOP ROW: Counts + AQI (Left) | Map (Right) --- */}
        <div className="mt-8 w-full max-w-360 flex justify-between gap-8">
          {/* Left Column (Narrower) */}
          <div className="flex flex-col gap-6 w-[45%]">
            <div className="flex items-center justify-between w-full">
              <CountCard label="Temperature" value="27°C" />
              <CountCard label="AQI" value="27" />
              <CountCard label="Hotspot count" value="27" />
            </div>
            <AqiOverviewCard />
          </div>

          {/* Right Column (Wider) */}
          <div className="w-[50%] flex justify-end">
            <HotspotsMapCard />
          </div>
        </div>

        {/* --- BOTTOM ROW: Weekly Temps (Left) | Description (Right) --- */}
        <div className="mt-8 w-full max-w-360 flex justify-between items-end">
          {/* Left Column (Wider) */}
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

          {/* Right Column (Narrower) */}
          <div className="w-[40%]">
            <TextDescriptionCard />
          </div>
        </div>
      </div>
    </section>
  );
}
