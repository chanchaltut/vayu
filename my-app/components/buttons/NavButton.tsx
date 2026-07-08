interface NavButtonProps {
  label: string;
  isDark?: boolean;
  isScrolled?: boolean;
  onClick?: () => void;
}

export default function NavButton({
  label,
  isDark = false,
  isScrolled = false,
  onClick,
}: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center justify-center
        h-9 px-5 
        rounded-full 
        text-[15px] font-medium tracking-tight
        transition-all duration-300 ease-in-out
        cursor-pointer pointer-events-auto
        ${
          isDark
            ? "bg-[#1A1A1A] text-white hover:bg-black shadow-sm"
            : isScrolled
              ? "bg-black/5 text-[#1A1A1A] hover:bg-black/10" 
              : "bg-white text-[#1A1A1A] hover:bg-white/90 shadow-sm"
        }
      `}
    >
      {label}
    </button>
  );
}
