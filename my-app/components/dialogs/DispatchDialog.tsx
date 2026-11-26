"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/lib/i18n";
import type { Hotspot } from "@/lib/useHotspots";
import { aqiCategoryText } from "@/lib/weatherUi";

interface DispatchDialogProps {
  hotspot: Hotspot;
  onClose: () => void;
  onSent: (message: string) => void;
}

const PHONE_KEY = "vayu_dispatch_phone";

export default function DispatchDialog({ hotspot, onClose, onSent }: DispatchDialogProps) {
  const { t, fmt } = useI18n();
  const d = t.act.dialog;
  const [phone, setPhone] = useState(() => localStorage.getItem(PHONE_KEY) ?? "");
  const [channel, setChannel] = useState<"sms" | "whatsapp">("sms");
  const [language, setLanguage] = useState<"both" | "en" | "hi">("both");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const normalised = phone.replace(/[\s()-]/g, "");
    if (!/^\+\d{8,15}$/.test(normalised)) return setError(d.invalidPhone);
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotspot_id: hotspot.id, recipient: normalised, channel, language }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.error);
      localStorage.setItem(PHONE_KEY, normalised);
      onSent(fmt(d.sent, { phone: normalised }));
    } catch {
      setError(d.failed);
    } finally {
      setSending(false);
    }
  };

  const seg = (on: boolean) =>
    `flex-1 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition-colors ${on ? "bg-[#1A1A1A] text-white" : "bg-[#F5F5F5] text-[#1A1A1A] hover:bg-[#EBEBEB]"}`;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true" aria-labelledby="dispatch-title">
      <div className="animate-fade absolute inset-0 bg-black/45 backdrop-blur-[2px]" onClick={onClose} />
      <form
        onSubmit={submit}
        className="animate-sheet pb-safe relative w-full max-w-md rounded-t-[28px] bg-white px-5 pt-3 shadow-[0_-12px_40px_rgba(0,0,0,0.2)] md:animate-fade md:rounded-[28px] md:px-7 md:pb-7 md:pt-6"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-black/15 md:hidden" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="dispatch-title" className="text-[20px] font-bold tracking-tight text-[#1A1A1A]">
              {d.title}
            </h3>
            <p className="mt-1 text-[14px] font-medium text-[#595959]">{d.intro}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={d.cancel} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-black/8 bg-[#FAFAFA] px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-600 text-[13px] font-bold text-white">{hotspot.severity}</span>
          <div className="min-w-0">
            <p className="text-[14.5px] font-bold text-[#1A1A1A]">
              AQI {hotspot.avg_aqi} · {aqiCategoryText(hotspot.aqi_category, t)}
            </p>
            <p className="truncate text-[13px] font-medium text-[#595959]">{hotspot.action}</p>
          </div>
        </div>

        <label className="mt-5 block">
          <span className="text-[13.5px] font-semibold text-[#1A1A1A]">{d.phone}</span>
          <input
            ref={inputRef}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="mt-1.5 h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-[16px] font-medium outline-none focus:border-[#005AFF] focus:ring-4 focus:ring-[#005AFF]/10"
          />
          <span className="mt-1 block text-[12px] font-medium text-[#8C8C8C]">{d.phoneHint}</span>
        </label>

        <fieldset className="mt-4">
          <legend className="text-[13.5px] font-semibold text-[#1A1A1A]">{d.channel}</legend>
          <div className="mt-1.5 flex gap-2">
            <button type="button" className={seg(channel === "sms")} onClick={() => setChannel("sms")} aria-pressed={channel === "sms"}>
              {d.sms}
            </button>
            <button type="button" className={seg(channel === "whatsapp")} onClick={() => setChannel("whatsapp")} aria-pressed={channel === "whatsapp"}>
              {d.whatsapp}
            </button>
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="text-[13.5px] font-semibold text-[#1A1A1A]">{d.language}</legend>
          <div className="mt-1.5 flex gap-2">
            {(
              [
                ["both", d.both],
                ["en", d.english],
                ["hi", d.hindi],
              ] as const
            ).map(([v, label]) => (
              <button key={v} type="button" className={seg(language === v)} onClick={() => setLanguage(v)} aria-pressed={language === v}>
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        {error && (
          <p role="alert" className="mt-3 text-[13.5px] font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="mt-5 flex gap-2.5 pb-5 md:pb-0">
          <button type="button" onClick={onClose} className="hidden h-12 flex-1 rounded-xl border border-black/10 text-[15px] font-semibold text-[#1A1A1A] md:block">
            {d.cancel}
          </button>
          <button
            type="submit"
            disabled={sending}
            className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-xl bg-red-600 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(220,38,38,0.25)] transition-all active:scale-[0.99] disabled:opacity-60"
          >
            {sending && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            )}
            {sending ? d.sending : d.send}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
