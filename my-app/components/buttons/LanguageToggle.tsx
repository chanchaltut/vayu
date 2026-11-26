"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LANGUAGES, useI18n, type LangCode } from "@/lib/i18n";

export default function LanguageToggle() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || sheetRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Lock page scroll while the mobile sheet is open.
  useEffect(() => {
    if (!open || window.matchMedia("(min-width: 768px)").matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const choose = (code: LangCode) => {
    setLang(code);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative z-[60]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t.lang.label}: ${lang.label}`}
        className="flex h-10 min-w-0 items-center gap-2 rounded-full border border-white/40 border-t-white/60 border-l-white/60 bg-white/30 px-3.5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.08)] backdrop-blur-md transition-all duration-300 hover:bg-white/45 md:h-12 md:px-5"
      >
        <svg className="h-4 w-4 shrink-0 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
        </svg>
        <span className="truncate text-[15px] font-bold leading-none tracking-wide text-white drop-shadow-sm md:text-[17px]">
          {lang.code === "en" ? "En" : lang.native}
        </span>
        <svg
          className={`h-3.5 w-3.5 shrink-0 text-white transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <>
          {/* Phone: dimmed backdrop + bottom sheet (portalled so it sits above the tab bar) */}
          {createPortal(
          <div ref={sheetRef}>
          <div className="animate-fade fixed inset-0 z-[70] bg-black/40 backdrop-blur-[2px] md:hidden" onClick={() => setOpen(false)} />
          <div
            role="listbox"
            aria-label={t.lang.label}
            className="animate-sheet pb-safe fixed inset-x-0 bottom-0 z-[80] rounded-t-[28px] bg-white px-5 pt-3 shadow-[0_-12px_40px_rgba(0,0,0,0.2)] md:hidden"
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-black/15" />
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[19px] font-bold tracking-tight text-[#1A1A1A]">{t.lang.label}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-[#1A1A1A]"
                aria-label={t.common.close}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pb-5">
              {LANGUAGES.map((l) => {
                const on = l.code === lang.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    role="option"
                    aria-selected={on}
                    lang={l.code}
                    onClick={() => choose(l.code)}
                    className={`flex flex-col items-start rounded-2xl border px-4 py-3 text-left transition-colors ${
                      on ? "border-[#1A1A1A] bg-[#1A1A1A] text-white" : "border-black/8 bg-[#F5F5F5] text-[#1A1A1A] active:bg-[#EBEBEB]"
                    }`}
                  >
                    <span className="text-[17px] font-bold leading-tight">{l.native}</span>
                    <span className={`text-[12px] font-medium ${on ? "text-white/70" : "text-[#8C8C8C]"}`}>{l.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          </div>,
          document.body
          )}

          {/* Tablet / desktop: dropdown */}
          <div
            role="listbox"
            aria-label={t.lang.label}
            className="animate-fade absolute left-0 top-14 hidden max-h-80 w-52 flex-col gap-0.5 overflow-y-auto rounded-2xl border border-black/10 bg-white py-2 shadow-[0_16px_40px_rgba(0,0,0,0.18)] md:flex"
          >
            {LANGUAGES.map((l) => {
              const on = l.code === lang.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  role="option"
                  aria-selected={on}
                  lang={l.code}
                  onClick={() => choose(l.code)}
                  className={`flex w-full items-center justify-between px-4 py-2 text-left text-[14.5px] font-bold tracking-tight transition-colors ${
                    on ? "bg-black/10 text-black" : "text-[#1A1A1A] hover:bg-black/5"
                  }`}
                >
                  <span>{l.native}</span>
                  <span className="text-[11px] font-semibold text-gray-500">{l.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
