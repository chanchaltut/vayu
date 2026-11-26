"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// Minimal typing for the Web Speech API (not in lib.dom for all TS versions).
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function getRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition || w.webkitSpeechRecognition || null) as (new () => SpeechRecognitionLike) | null;
}

const noopSubscribe = () => () => {};

interface MicButtonProps {
  /** BCP-47 language for recognition, e.g. "hi-IN". */
  locale: string;
  onText: (text: string) => void;
  label: string;
  listeningLabel: string;
  className?: string;
}

/** Dictation button. Renders nothing in browsers without speech recognition. */
export default function MicButton({ locale, onText, label, listeningLabel, className = "" }: MicButtonProps) {
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => !!getRecognition(),
    () => false
  );
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => () => recRef.current?.stop(), []);

  if (!supported) return null;

  const toggle = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const Rec = getRecognition();
    if (!Rec) return;
    const rec = new Rec();
    rec.lang = locale;
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (text) onText(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={listening}
      aria-label={listening ? listeningLabel : label}
      title={listening ? listeningLabel : label}
      className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
        listening ? "bg-red-500 text-white shadow-[0_0_0_6px_rgba(239,68,68,0.18)]" : "bg-white text-[#595959] shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:text-black"
      } ${className}`}
    >
      {listening && <span className="absolute inset-0 animate-ping rounded-full bg-red-400/40" />}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    </button>
  );
}
