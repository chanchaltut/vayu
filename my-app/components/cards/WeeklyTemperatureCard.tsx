import Image from "next/image";

interface WeeklyTemperatureCardProps {
  day: string;
  icon: string;
  temperature: number;
  isActive?: boolean;
}

export default function WeeklyTemperatureCard({
  day,
  icon,
  temperature,
  isActive = false,
}: WeeklyTemperatureCardProps) {
  return (
    <div
      className={`
        flex flex-col items-center justify-between rounded-2xl transition-all duration-300 ease-in-out
        ${
          isActive
            ? "bg-[#000080] w-24 h-full py-6 shadow-[0_8px_24px_rgba(0,0,128,0.3)]"
            : "bg-[#BFBFBF] w-22 h-full py-5 shadow-sm"
        }
      `}
    >
      {/* Day */}
      <span
        className={`text-white tracking-tight ${
          isActive ? "text-[20px] font-semibold" : "text-[18px] font-medium"
        }`}
      >
        {day}
      </span>

      {/* Weather Icon */}
      <div className="relative w-12 h-12 flex items-center justify-center">
        <img
          src={icon}
          alt={`${day} weather`}
          className="w-12 h-12 object-contain"
        />
      </div>

      {/* Temperature */}
      <div className="flex items-start text-white">
        <span
          className={`leading-none tracking-tight ${
            isActive ? "text-[36px] font-bold" : "text-[32px] font-semibold"
          }`}
        >
          {temperature}
        </span>
        <span
          className={`mt-1 ${
            isActive ? "text-[16px] font-semibold" : "text-[14px] font-medium"
          }`}
        >
          °
        </span>
      </div>
    </div>
  );
}
