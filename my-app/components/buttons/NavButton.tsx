interface NavButtonProps {
  label: string;
  href: string;
  isDark?: boolean;
  isScrolled?: boolean;
  onClick?: () => void;
}

export default function NavButton({ label, href, isDark = false, isScrolled = false, onClick }: NavButtonProps) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      aria-current={isDark ? "true" : undefined}
      className={`flex h-9 items-center justify-center whitespace-nowrap rounded-full px-4 text-[15px] font-medium tracking-tight transition-all duration-300 ease-in-out lg:px-5 ${
        isDark
          ? "bg-[#1A1A1A] text-white shadow-sm hover:bg-black"
          : isScrolled
            ? "bg-black/5 text-[#1A1A1A] hover:bg-black/10"
            : "bg-white text-[#1A1A1A] shadow-sm hover:bg-white/90"
      }`}
    >
      {label}
    </a>
  );
}
