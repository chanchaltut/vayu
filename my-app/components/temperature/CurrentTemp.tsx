interface CurrentTempProps {
  temperature?: number;
  description?: string;
}

export default function CurrentTemp({
  temperature = 27,
  description = "occasional showers and\nscattered thunderstorms",
}: CurrentTempProps) {
  return (
    <div className="flex flex-col items-start text-white select-none">
      {/* Temperature Number & Symbol */}
      <div className="flex items-start leading-[0.78]">
        {/* The massive number */}
        <span className="text-[300px] font-bold tracking-tighter m-0 p-0">
          {temperature}
        </span>
        {/* The degree symbol, smaller and aligned to the top */}
        <span className="text-[75px] font-normal mt-5 ml-1">°C</span>
      </div>

      {/* Description Text aligned directly to the left edge of the massive number */}
      <div className="text-left pl-1.5 mt-0">
        <p className="text-[22px] font-medium leading-snug whitespace-pre-line opacity-95">
          {description}
        </p>
      </div>
    </div>
  );
}
