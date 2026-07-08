import Image from "next/image";

export default function HotspotsMapCard() {
  return (
    <div className="w-150 h-110 bg-[#FAFAFA] rounded-3xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-black/6 shrink-0">
        <h3 className="text-[22px] font-bold text-[#1A1A1A] tracking-tight">
          Hotspots
        </h3>
        <button
          title="Menu"
          type="button"
          className="text-[#8C8C8C] cursor-pointer"
        >
          <Image
            src="/assets/Menu.svg"
            alt="Menu"
            width={28}
            height={28}
            className="object-contain"
          />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-4 flex flex-col items-center justify-between flex-1">
        {/* Map Image Container */}
        <div className="relative w-full flex-1 rounded-b-xl overflow-hidden shadow-sm">
          <Image
            src="/assets/Map.png"
            alt="Hotspots Map of India"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 500px"
          />
        </div>

        {/* Color Scale Bar */}
        <div className="relative w-110 h-8 mt-6 shrink-0">
          <Image
            src="/assets/Bar.png"
            alt="AQI Scale Bar"
            fill
            className="object-contain"
            sizes="443px"
          />
        </div>
      </div>
    </div>
  );
}
