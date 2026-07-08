import Image from "next/image";

interface ReportCardProps {
  title: string;
  icon: string;
  bgColor: string;
  textColor: string;
}

export default function ReportCard({
  title,
  icon,
  bgColor,
  textColor,
}: ReportCardProps) {
  return (
    <div
      className={`w-90 h-70 rounded-3xl border border-[#171717] flex flex-col relative overflow-hidden ${bgColor} shadow-[0_8px_24px_rgba(0,0,0,0.04)]`}
    >
      {/* Header Area (Colored) */}
      <div className="flex items-center justify-between px-7 h-19 shrink-0">
        <h3 className={`text-[20px] font-bold tracking-tight ${textColor}`}>
          {title}
        </h3>
        <div className="relative w-6 h-6 flex items-center justify-center">
          <Image
            src={icon}
            alt={`${title} shape`}
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Empty White Content Area */}
      <div className="flex-1 bg-white rounded-t-3xl border-t border-[#171717] w-full">
        {/* Placeholder for future internal components */}
      </div>
    </div>
  );
}
