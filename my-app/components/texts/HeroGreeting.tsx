interface HeroGreetingProps {
  line1?: string;
  line2?: string;
  location?: string;
}

export default function HeroGreeting({
  line1 = "Good",
  line2 = "Morning",
  location = "Detecting location...",
}: HeroGreetingProps) {
  return (
    <div className="flex flex-col text-white font-bold leading-[0.85] tracking-tight">
      <h1 className="text-[clamp(80px,8vw,130px)] m-0 p-0">{line1}</h1>
      <h1 className="text-[clamp(80px,8vw,130px)] m-0 p-0">{line2}</h1>
      <div className="text-[clamp(14px,1.2vw,18px)] font-semibold opacity-90 mt-8 leading-none tracking-wider uppercase flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-full border border-white/15 w-fit">
        <svg
          className="w-4.5 h-4.5 text-white shrink-0 animate-bounce"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z"
          />
        </svg>
        <span>{location}</span>
      </div>
    </div>
  );
}
