import Image from "next/image";

interface AqiCardProps {
  title?: string;
  aqiValue?: number;
  className?: string;
}

export default function AqiCard({
  title = "Harmful for your body",
  aqiValue = 30,
  className = "",
}: AqiCardProps) {
  return (
    <div
      className={`
        relative flex items-center gap-6 
        w-122 h-31 px-8 py-6 
        rounded-4xl overflow-hidden
        backdrop-blur-xl 
        shadow-[20px_20px_40px_-10px_rgba(0,0,0,0.12)]
        ${className}
      `}
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.40) 1%, rgba(255, 255, 255, 0.01) 100%)",
      }}
    >
      {/* Fading border that follows card radius */}
      <div
        className="absolute inset-0 rounded-4xl pointer-events-none"
        style={{
          borderLeft: "3px solid white",
          borderRight: "3px solid white",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, white 8%, white 98%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, white 8%, white 98%, transparent 100%)",
        }}
      ></div>

      {/* The Wind Icon (Custom SVG matching your Figma) */}
      <div className="shrink-0">
        <Image
          src="/assets/AQICardLogo.svg"
          alt="Wind icon"
          width={80}
          height={80}
          style={{ height: "auto" }}
        />
      </div>

      {/* The Text Arrangement */}
      <div className="flex flex-col w-full text-[#0a0a0a]">
        <h2 className="text-[28px] font-bold leading-tight tracking-tight">
          {title}
        </h2>
        <div className="flex items-center gap-6 mt-1 text-[22px] font-medium">
          <span className="font-normal text-black/80">Current AQI</span>
          <span>{aqiValue}</span>
        </div>
      </div>
    </div>
  );
}
