interface HeroGreetingProps {
  line1: string;
  line2: string;
  location: string;
  onLocate?: () => void;
  locating?: boolean;
  locateLabel?: string;
  locatingLabel?: string;
}

export default function HeroGreeting({
  line1,
  line2,
  location,
  onLocate,
  locating = false,
  locateLabel = "Use my precise location",
  locatingLabel = "Locating…",
}: HeroGreetingProps) {
  return (
    <div className="flex min-w-0 flex-col font-bold leading-[0.88] tracking-tight text-white">
      <h1 className="m-0 p-0 text-[52px] xs:text-[60px] sm:text-[72px] md:text-[clamp(64px,8vw,130px)]">
        <span className="block">{line1}</span>
        <span className="block">{line2}</span>
      </h1>
      <button
        type="button"
        onClick={onLocate}
        title={locateLabel}
        aria-label={`${location} — ${locateLabel}`}
        className="group mt-5 flex w-fit max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-left text-[12.5px] font-semibold uppercase leading-none tracking-wider opacity-95 backdrop-blur-sm transition-colors hover:bg-white/20 md:mt-8 md:px-4 md:py-2.5 md:text-[clamp(14px,1.2vw,18px)]"
      >
        <svg
          className={`h-4 w-4 shrink-0 text-white ${locating ? "animate-spin" : "animate-bounce"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
          aria-hidden
        >
          {locating ? (
            <path strokeLinecap="round" d="M12 3a9 9 0 1 0 9 9" />
          ) : (
            <>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z"
              />
            </>
          )}
        </svg>
        <span className="truncate">{locating ? locatingLabel : location}</span>
        {/* crosshair hint that the chip is tappable */}
        <svg className="h-3.5 w-3.5 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <circle cx="12" cy="12" r="6" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      </button>
    </div>
  );
}
