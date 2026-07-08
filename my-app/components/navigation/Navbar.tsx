"use client";
import { useState, useEffect } from "react";
import NavButton from "../buttons/NavButton";

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false); // NEW: Tracks if we left the top

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 1. Hide/Show Logic
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      // 2. Background UI Logic: If scrolled past 100px, trigger the "scrolled" style
      if (currentScrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-50 
        transition-transform duration-300 ease-in-out
        ${isVisible ? "translate-y-0" : "translate-y-[-200%]"}
      `}
    >
      <nav
        className={`
          flex items-center gap-2
          h-15 px-3
          rounded-full
          backdrop-blur-md transition-colors duration-500
          ${
            isScrolled
              ? "bg-white/80 border border-black/10 shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
              : "bg-white/10 border border-white/20 border-t-white/50 border-l-white/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.05)]"
          }
        `}
      >
        <NavButton label="Home" isScrolled={isScrolled} onClick={() => scrollToSection("home")} />
        <NavButton label="Report" isScrolled={isScrolled} onClick={() => scrollToSection("report")} />
        <NavButton label="Detect" isScrolled={isScrolled} onClick={() => scrollToSection("detect")} />
        <NavButton label="Act" isScrolled={isScrolled} onClick={() => scrollToSection("act")} />
        <NavButton label="Team" isDark={true} isScrolled={isScrolled} onClick={() => scrollToSection("team")} />
      </nav>
    </div>
  );
}
