"use client";

interface TextDescriptionCardProps {
  reasoning?: string;
  onDetect?: () => Promise<void>;
  isDetecting?: boolean;
}

export default function TextDescriptionCard({
  reasoning = "AI is analysing data. Run hotspot detection to populate this.",
  onDetect,
  isDetecting = false,
}: TextDescriptionCardProps) {
  return (
    <div
      className="w-full h-full rounded-3xl p-0.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] shrink-0 transition-transform duration-300 hover:scale-[1.01]"
      style={{
        background:
          "linear-gradient(135deg, #FF3B30 0%, #C200FB 25%, #005AFF 50%, #00D604 80%, #FFCC00 100%)",
      }}
    >
      <div className="w-full h-full bg-white rounded-[22px] px-6 py-5 flex flex-col justify-between items-start gap-4">
        <div className="flex flex-col items-start gap-1.5 w-full">
          <h4 className="text-[17px] font-bold text-[#1A1A1A] tracking-tight flex items-center justify-between w-full">
            <span>Gemini Analysis</span>
            {isDetecting && (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
              </span>
            )}
          </h4>
          <p className="text-[15px] text-[#2B3037] leading-[1.4] font-medium tracking-tight">
            {isDetecting ? "Gemini Fusion Engine is processing sensor telemetry data..." : reasoning}
          </p>
        </div>

        {onDetect && (
          <button
            onClick={onDetect}
            disabled={isDetecting}
            className="w-full py-2.5 px-4 bg-black text-white hover:bg-black/90 active:scale-[0.98] transition-all rounded-xl text-[14px] font-semibold tracking-tight disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {isDetecting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Detecting Hotspots...
              </>
            ) : (
              "Run Hotspot Detection"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
