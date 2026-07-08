import Image from "next/image";

interface DailyWeather {
  day: string;
  temp: number;
  icon: string;
}

const forecastData: DailyWeather[] = [
  {
    day: "Mon",
    temp: 30,
    icon: "/assets/SnowCloud.png"
  },
  {
    day: "Tue",
    temp: 27,
    icon: "/assets/RainCloud.png"
  },
  {
    day: "Wed",
    temp: 27,
    icon: "/assets/SunCloud.png"
  },
  {
    day: "Thu",
    temp: 27,
    icon: "/assets/RainCloud.png"
  },
  {
    day: "Fri",
    temp: 27,
    icon: "/assets/ThunderCloud.png"
  },
];

export default function WeeklyForecast() {
  return (
    <div className="flex flex-col w-54">
      {forecastData.map((data) => (
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
