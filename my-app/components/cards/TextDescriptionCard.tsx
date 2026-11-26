"use client";
import { useI18n } from "@/lib/i18n";

interface TextDescriptionCardProps {
  reasoning?: string | null;
  onDetect?: () => void;
  isDetecting?: boolean;
}

export default function TextDescriptionCard({ reasoning, onDetect, isDetecting = false }: TextDescriptionCardProps) {
  const { t } = useI18n();
  return (
    <div className="rainbow-border h-full w-full shrink-0 rounded-3xl p-0.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex h-full w-full flex-col items-start justify-between gap-4 rounded-[22px] bg-white px-5 py-5 sm:px-6">
        <div className="flex w-full flex-col items-start gap-1.5">
          <h4 className="flex w-full items-center justify-between text-[17px] font-bold tracking-tight text-[#1A1A1A]">
            <span className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 2c.6 4.8 3.2 7.4 8 8-4.8.6-7.4 3.2-8 8-.6-4.8-3.2-7.4-8-8 4.8-.6 7.4-3.2 8-8z" fill="url(#gemini-spark)" />
                <defs>
                  <linearGradient id="gemini-spark" x1="4" y1="2" x2="20" y2="18">
                    <stop stopColor="#005AFF" />
                    <stop offset="1" stopColor="#C200FB" />
                  </linearGradient>
                </defs>
              </svg>
              {t.detect.analysis}
            </span>
            {isDetecting && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-purple-500" />
              </span>
            )}
          </h4>
          {/* Gemini's reasoning is shown as written; only the UI around it is translated. */}
          <p className="text-[15px] font-medium leading-[1.45] tracking-tight text-[#2B3037]">
            {isDetecting ? t.detect.processing : reasoning || t.detect.analysisIdle}
          </p>
        </div>

        {onDetect && (
          <button
            type="button"
            onClick={onDetect}
            disabled={isDetecting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-[14.5px] font-semibold tracking-tight text-white transition-all hover:bg-black/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-400 md:py-2.5 md:text-[14px]"
          >
            {isDetecting && (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {isDetecting ? t.detect.running : t.detect.run}
          </button>
        )}
      </div>
    </div>
  );
}
