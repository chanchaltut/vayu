interface LanguageToggleProps {
  language?: string;
  onClick?: () => void;
}

export default function LanguageToggle({
  language = "हिन्दी",
  onClick,
}: LanguageToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex items-center justify-center
        w-19 h-12 
        rounded-full 
        bg-white/20 backdrop-blur-md
        border border-white/20 border-t-white/50 border-l-white/50
        shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.05)]
        hover:bg-white/25 transition-all duration-300 ease-in-out
        cursor-pointer pointer-events-auto
      "
    >
      <span className="text-white text-[18px] font-medium leading-none tracking-wide drop-shadow-sm">
        {language}
      </span>
    </button>
  );
}
