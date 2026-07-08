interface CurrentTempProps {
  temperature?: number;
  description?: string;
}

export default function CurrentTemp({
  temperature = 27,
  description = "occasional showers and\nscattered thunderstorms",
}: CurrentTempProps) {
  return (
    <div className="flex flex-col items-end text-white">
      {/* Temperature Number & Symbol */}
      <div className="flex items-start leading-[0.8]">
        {/* The massive number */}
        <span className="text-[300px] font-bold tracking-tighter m-0 p-0">
          {temperature}
        </span>
        {/* The degree symbol, smaller and aligned to the top */}
        <span className="text-[75px] font-normal mt-3 ml-1">°C</span>
      </div>

      {/* Description Text */}
      <div className="text-left mr-38">
        {/* Using whitespace-pre-line to respect the \n line break in the default prop */}
        <p className="text-[22px] font-medium leading-snug whitespace-pre-line">
          {description}
        </p>
      </div>
    </div>
  );
}
