interface CountCardProps {
  label: string;
  value: string | number;
}

export default function CountCard({ label, value }: CountCardProps) {
  return (
    <div className="relative bg-white rounded-[10px] px-3 py-2 shadow-[0_1px_8px_rgba(0,0,0,0.10)] flex items-center gap-2">
      <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-[#FF0000] rounded-full"></div>

      <span className="text-[#171717] text-[15px] font-semibold tracking-[-0.1px]">
        {label}
      </span>

      <span className="text-[#171717] text-[17px] font-bold tracking-tight leading-none">
        {value}
      </span>
    </div>
  );
}
