interface CurrentTempProps {
  temperature: number | null;
  description?: string;
}

export default function CurrentTemp({ temperature, description = "" }: CurrentTempProps) {
  return (
    <div className="flex select-none flex-col items-start text-white">
      <div className="flex items-start leading-[0.78]">
        <span className="m-0 p-0 text-[112px] font-bold tracking-tighter tabular-nums xs:text-[128px] sm:text-[150px] md:text-[150px] lg:text-[220px] xl:text-[300px]">
          {temperature ?? "--"}
        </span>
        <span className="ml-1 mt-2 text-[32px] font-normal md:mt-3 md:text-[40px] lg:mt-4 lg:text-[56px] xl:mt-5 xl:text-[75px]">
          °C
        </span>
      </div>
      <p className="mt-2 min-h-[1.4em] max-w-[18rem] pl-1 text-[16px] font-medium leading-snug opacity-95 md:mt-0 md:max-w-xs md:text-[18px] lg:text-[22px]">
        {description}
      </p>
    </div>
  );
}
