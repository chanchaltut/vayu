import Image from "next/image";

interface WeeklyTemperatureCardProps {
  day: string;
  icon: string;
  iconAlt: string;
  temperature: number;
  isActive?: boolean;
}

export default function WeeklyTemperatureCard({ day, icon, iconAlt, temperature, isActive = false }: WeeklyTemperatureCardProps) {
  return (
    <div
      className={`flex h-full shrink-0 snap-start flex-col items-center justify-between gap-3 rounded-2xl transition-all duration-300 ease-in-out ${
        isActive
          ? "w-[84px] bg-[#000080] py-5 shadow-[0_8px_24px_rgba(0,0,128,0.3)] lg:w-24 lg:py-6"
          : "w-[76px] bg-[#BFBFBF] py-4 shadow-sm lg:w-22 lg:py-5"
      }`}
    >
      <span className={`w-full truncate px-1 text-center tracking-tight text-white ${isActive ? "text-[18px] font-semibold lg:text-[20px]" : "text-[16px] font-medium lg:text-[18px]"}`}>
        {day}
      </span>
      <div className="relative h-11 w-11 lg:h-12 lg:w-12">
        <Image src={icon} alt={iconAlt} fill sizes="48px" className="object-contain" />
      </div>
      <div className="flex items-start text-white">
        <span className={`leading-none tracking-tight tabular-nums ${isActive ? "text-[32px] font-bold lg:text-[36px]" : "text-[28px] font-semibold lg:text-[32px]"}`}>
          {temperature}
        </span>
        <span className={`mt-1 ${isActive ? "text-[16px] font-semibold" : "text-[14px] font-medium"}`}>°</span>
      </div>
    </div>
  );
}
