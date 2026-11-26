interface CountCardProps {
  label: string;
  value: string | number;
}

/** Phones: stacked stat tile. Tablet / desktop: compact pill from the original design. */
export default function CountCard({ label, value }: CountCardProps) {
  return (
    <div className="relative flex min-w-0 flex-col items-start gap-1 rounded-2xl bg-white px-3.5 py-3 shadow-[0_1px_8px_rgba(0,0,0,0.10)] md:flex-row md:items-center md:gap-2 md:rounded-[10px] md:px-3 md:py-2">
      <div className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#FF0000] md:left-1 md:top-1" />
      <span className="w-full truncate text-[12.5px] font-semibold tracking-[-0.1px] text-[#595959] md:w-auto md:text-[15px] md:text-[#171717]">
        {label}
      </span>
      <span className="text-[22px] font-bold leading-none tracking-tight text-[#171717] tabular-nums md:text-[17px]">{value}</span>
    </div>
  );
}
