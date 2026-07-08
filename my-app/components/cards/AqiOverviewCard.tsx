import Image from "next/image";

interface BarData {
  day: string;
  value: number; // 0–100, relative bar height
  highlighted?: boolean;
}

const chartData: BarData[] = [
  {
    day: "Sat",
    value: 20
  },
  {
    day: "sun",
    value: 40
  },
  {
    day: "Mon",
    value: 50
  },
  {
    day: "Tue",
    value: 60
  },
  {
    day: "Wed",
    value: 90,
    highlighted: true
  },
  {
    day: "Thu",
    value: 30
  },
  {
    day: "Fri",
    value: 50
  }
];

export default function AqiOverviewCard() {
  return (
    <div className="w-140 h-100 bg-[#FAFAFA] rounded-3xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-black/6">
        <h3 className="text-[22px] font-bold text-[#1A1A1A] tracking-tight">
          AQI Overview
        </h3>
        <button
          title="Menu"
          type="button"
          className="text-[#8C8C8C] cursor-pointer"
        >
          <Image src="/assets/Menu.svg" alt="Menu" width={28} height={28} />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-4">
        <p className="text-[15px] text-[#2B3037] font-medium">Highest AQI</p>
        <p className="text-[48px] font-thin text-[#2B3037] leading-none mt-1">
          324
        </p>

        {/* Chart */}
        <div className="mt-8">
          <div className="border-t border-dashed border-black/20"></div>
          <div className="flex items-end justify-between gap-3 h-56 -mt-8">
            {chartData.map((bar) => (
              <div
                key={bar.day}
                className="flex flex-col items-center gap-3 flex-1 h-full justify-end"
              >
                <div
                  className={`w-full rounded-xl transition-all duration-300 ${
                    bar.highlighted ? "bg-red-600" : "bg-[#D9D9D9]"
                  }`}
                  style={{ height: `${bar.value}%` }}
                ></div>
                <span className="text-[15px] text-[#1A1A1A] font-medium">
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
