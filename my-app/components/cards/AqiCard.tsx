import Image from "next/image";
import { AQI_COLOR, aqiKey } from "@/lib/weatherUi";

interface AqiCardProps {
  title: string;
  aqiValue: number | null;
  label?: string;
  className?: string;
}

export default function AqiCard({ title, aqiValue, label = "Current AQI", className = "" }: AqiCardProps) {
  // Position on a 0–300+ scale (anything above 300 pins to the end).
  const pct = aqiValue == null ? null : Math.min(100, (aqiValue / 300) * 100);
  const color = aqiValue == null ? "#ffffff" : AQI_COLOR[aqiKey(aqiValue)];

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[28px] px-5 py-4 shadow-[20px_20px_40px_-10px_rgba(0,0,0,0.12)] backdrop-blur-xl md:w-122 md:rounded-4xl md:px-8 md:py-6 ${className}`}
      style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.40) 1%, rgba(255,255,255,0.01) 100%)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          borderLeft: "3px solid white",
          borderRight: "3px solid white",
          maskImage: "linear-gradient(to bottom, transparent 0%, white 8%, white 98%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, white 8%, white 98%, transparent 100%)",
        }}
      />

      <div className="flex items-center gap-4 md:gap-6">
        <div className="w-14 shrink-0 md:w-20">
          <Image src="/assets/AQICardLogo.svg" alt="" width={80} height={80} className="h-auto w-full drop-shadow-[0_2px_6px_rgba(0,0,0,0.18)]" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col text-[#0a0a0a]">
          <h2 className="text-[19px] font-bold leading-tight tracking-tight md:text-[26px] lg:text-[28px]">{title}</h2>
          <div className="mt-1 flex items-baseline gap-3 text-[16px] font-medium md:gap-6 md:text-[22px]">
            <span className="font-normal text-black/75">{label}</span>
            <span className="text-[22px] font-bold tabular-nums md:text-[26px]">{aqiValue ?? "—"}</span>
          </div>
        </div>
      </div>

      {/* AQI scale */}
      <div className="relative mt-3.5 h-1.5 rounded-full bg-[linear-gradient(90deg,#16a34a_0%,#84cc16_17%,#f59e0b_40%,#ea580c_67%,#dc2626_85%,#7e22ce_100%)] opacity-90">
        {pct != null && (
          <span
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-md transition-[left] duration-700"
            style={{ left: `${pct}%`, background: color }}
          />
        )}
      </div>
    </div>
  );
}
