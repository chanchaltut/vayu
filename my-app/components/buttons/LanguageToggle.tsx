"use client";
import { useEffect, useState, useRef } from "react";

interface Language {
  code: string;
  label: string;
  native: string;
}

const LANGUAGES: Language[] = [
  { code: "en", label: "English", native: "En" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "as", label: "Assamese", native: "অসমীয়া" },
];

export default function LanguageToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<Language>(LANGUAGES[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize Google Translate Element
  useEffect(() => {
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi,bn,or,gu,mr,ta,te,ml,kn,pa,as",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // 1. MutationObserver to intercept Google Translate injections and hide them dynamically
  useEffect(() => {
    const suppressGoogleBanner = () => {
      // Find the Google Translate iframe elements
      const banner =
        document.querySelector("iframe.goog-te-banner-frame") ||
        document.getElementById("goog-te-banner-frame") ||
        document.querySelector(".goog-te-banner-frame");
      if (banner) {
        (banner as HTMLElement).style.setProperty("display", "none", "important");
        (banner as HTMLElement).style.setProperty("visibility", "hidden", "important");
        (banner as HTMLElement).style.setProperty("height", "0", "important");
        (banner as HTMLElement).style.setProperty("opacity", "0", "important");
      }

      // Hide all Google Translate wrapper containers
      const skipTranslateDivs = document.querySelectorAll(".skiptranslate");
      skipTranslateDivs.forEach((div) => {
        const htmlDiv = div as HTMLElement;
        // Check if this skiptranslate element is the top bar container
        if (
          htmlDiv.style.top === "0px" ||
          htmlDiv.style.zIndex === "10000000" ||
          htmlDiv.innerHTML.includes("goog-te-banner-frame")
        ) {
          htmlDiv.style.setProperty("display", "none", "important");
          htmlDiv.style.setProperty("visibility", "hidden", "important");
          htmlDiv.style.setProperty("height", "0", "important");
        }
      });

      // Force-reset HTML & Body top alignment shifts
      document.body.style.setProperty("top", "0px", "important");
      document.body.style.setProperty("position", "static", "important");
      document.documentElement.style.setProperty("margin-top", "0px", "important");
    };

    const observer = new MutationObserver(suppressGoogleBanner);
    observer.observe(document.body, { childList: true, subtree: true });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });

    // Initial check
    suppressGoogleBanner();

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setActiveLang(lang);
    setIsOpen(false);
    localStorage.setItem("vayu_preferred_language", lang.code);

    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (select) {
      select.value = lang.code;
      select.dispatchEvent(new Event("change"));
    }

    // 2. High-frequency cleanup interval to override delayed styling calculations
    let count = 0;
    const interval = setInterval(() => {
      document.body.style.setProperty("top", "0px", "important");
      document.body.style.setProperty("position", "static", "important");
      document.documentElement.style.setProperty("margin-top", "0px", "important");

      const banner = document.querySelector("iframe.goog-te-banner-frame") as HTMLElement | null;
      if (banner) {
        banner.style.setProperty("display", "none", "important");
      }

      count++;
      if (count > 25) clearInterval(interval);
    }, 80);
  };

  return (
    <div ref={dropdownRef} className="relative z-[9999]">
      {/* Hidden container for Google Translate setup */}
      <div id="google_translate_element" className="hidden" />

      {/* Glassmorphic Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center justify-between gap-2.5
          min-w-28 h-12 px-5
          rounded-full 
          bg-white/30 backdrop-blur-md
          border border-white/40 border-t-white/60 border-l-white/60
          shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.08)]
          hover:bg-white/45 transition-all duration-300 ease-in-out
          cursor-pointer pointer-events-auto select-none
        "
      >
        <span className="text-white text-[17px] font-extrabold leading-none tracking-wide drop-shadow-sm truncate">
          {activeLang.native}
        </span>
        <svg
          className={`w-4 h-4 text-white transition-transform duration-300 shrink-0 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* High-Contrast Dropdown Menu */}
      {isOpen && (
        <div
          className="
            absolute top-14 left-0 w-46 max-h-68 overflow-y-auto 
            rounded-2xl bg-white border border-black/10
            shadow-[0_16px_40px_rgba(0,0,0,0.18)]
            scrollbar-thin scrollbar-thumb-black/15
            py-2 flex flex-col gap-0.5
          "
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageChange(lang)}
              className={`
                w-full text-left px-4 py-2 text-[14.5px] font-bold tracking-tight transition-colors duration-200 cursor-pointer
                ${
                  activeLang.code === lang.code
                    ? "bg-black/10 text-black font-extrabold"
                    : "text-[#1A1A1A] hover:bg-black/5 hover:text-black"
                }
              `}
            >
              <span className="mr-1">{lang.native}</span>
              <span className="text-[11px] text-gray-500 font-bold truncate">
                ({lang.label})
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
