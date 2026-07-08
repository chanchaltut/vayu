"use client";
import { useState, useEffect } from "react";
import NavButton from "../buttons/NavButton";

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Scroll visibility & background style update handler
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

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

  // Scroll Spy to dynamically highlight active section inside Navbar capsules
  useEffect(() => {
    const sections = ["home", "report", "detect", "act", "team"];
    
    const handleScrollSpy = () => {
      const scrollPos = window.scrollY + 200; // Offset triggers highlight slightly early

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, []);

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
          ${isScrolled
            ? "bg-white/80 border border-black/10 shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
            : "bg-white/10 border border-white/20 border-t-white/50 border-l-white/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.05)]"
          }
        `}
      >
        <NavButton label="Home" isDark={activeSection === "home"} isScrolled={isScrolled} onClick={() => scrollToSection("home")} />
        <NavButton label="Report" isDark={activeSection === "report"} isScrolled={isScrolled} onClick={() => scrollToSection("report")} />
        <NavButton label="Detect" isDark={activeSection === "detect"} isScrolled={isScrolled} onClick={() => scrollToSection("detect")} />
        <NavButton label="Act" isDark={activeSection === "act"} isScrolled={isScrolled} onClick={() => scrollToSection("act")} />
        <NavButton label="Team" isDark={activeSection === "team"} isScrolled={isScrolled} onClick={() => scrollToSection("team")} />
      </nav>
    </div>
  );
}
