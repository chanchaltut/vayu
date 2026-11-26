"use client";
import { useEffect, useRef, useState } from "react";
import NavButton from "../buttons/NavButton";
import { useI18n } from "@/lib/i18n";

const SECTIONS = ["home", "report", "detect", "act", "team"] as const;
type SectionId = (typeof SECTIONS)[number];

// Small line icons for the mobile tab bar.
const ICONS: Record<SectionId, React.ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
  report: (
    <>
      <path d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  detect: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5M11 8v6M8 11h6" />
    </>
  ),
  act: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  team: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6" />
    </>
  ),
};

export default function Navbar() {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [active, setActive] = useState<SectionId>("home");
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY.current && y > 80) setIsVisible(false);
      else if (y < lastY.current) setIsVisible(true);
      setIsScrolled(y > 100);
      lastY.current = y;

      // Scroll spy: the last section whose top has passed 40% of the viewport.
      const probe = y + window.innerHeight * 0.4;
      let current: SectionId = "home";
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= probe) current = id;
      }
      // At the very bottom, always highlight the last section.
      if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) current = "team";
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: SectionId) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", id === "home" ? location.pathname : `#${id}`);
  };

  return (
    <>
      {/* Tablet & desktop: floating pill at the top that hides on scroll-down. */}
      <div
        className={`fixed top-4 left-1/2 z-50 hidden -translate-x-1/2 transition-transform duration-300 ease-in-out md:block ${
          isVisible ? "translate-y-0" : "-translate-y-[200%]"
        }`}
      >
        <nav
          aria-label={t.nav.menu}
          className={`flex h-15 items-center gap-1.5 rounded-full px-3 backdrop-blur-md transition-colors duration-500 lg:gap-2 ${
            isScrolled
              ? "border border-black/10 bg-white/80 shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
              : "border border-white/20 border-t-white/50 border-l-white/50 bg-white/10 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.05)]"
          }`}
        >
          {SECTIONS.map((id) => (
            <NavButton
              key={id}
              label={t.nav[id]}
              href={`#${id}`}
              isDark={active === id}
              isScrolled={isScrolled}
              onClick={() => go(id)}
            />
          ))}
        </nav>
      </div>

      {/* Phones: thumb-reach tab bar docked at the bottom. */}
      <nav
        aria-label={t.nav.menu}
        className="pb-safe fixed inset-x-0 bottom-0 z-50 px-3 md:hidden"
      >
        <div className="mx-auto mb-3 flex max-w-md items-stretch justify-between rounded-[26px] border border-black/5 bg-white/85 p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.16)] backdrop-blur-xl">
          {SECTIONS.map((id) => {
            const on = active === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  go(id);
                }}
                aria-current={on ? "true" : undefined}
                className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[20px] py-2 transition-colors duration-300 ${
                  on ? "bg-[#1A1A1A] text-white" : "text-[#595959] active:bg-black/5"
                }`}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {ICONS[id]}
                </svg>
                <span className="w-full truncate px-0.5 text-center text-[10.5px] font-semibold leading-tight tracking-tight">
                  {t.nav[id]}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
