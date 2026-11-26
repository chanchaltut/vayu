"use client";
// Built-in translations. All 12 languages ship pre-translated; English is bundled,
// the others are code-split and fetched only when a visitor picks them.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import en, { type Dict } from "./locales/en";

export type LangCode = "en" | "hi" | "bn" | "or" | "gu" | "mr" | "ta" | "te" | "ml" | "kn" | "pa" | "as";

export interface Language {
  code: LangCode;
  label: string;
  native: string;
  /** BCP-47 tag used for Intl formatting and speech recognition. */
  locale: string;
}

export const LANGUAGES: Language[] = [
  { code: "en", label: "English", native: "English", locale: "en-IN" },
  { code: "hi", label: "Hindi", native: "हिन्दी", locale: "hi-IN" },
  { code: "bn", label: "Bengali", native: "বাংলা", locale: "bn-IN" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ", locale: "or-IN" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી", locale: "gu-IN" },
  { code: "mr", label: "Marathi", native: "मराठी", locale: "mr-IN" },
  { code: "ta", label: "Tamil", native: "தமிழ்", locale: "ta-IN" },
  { code: "te", label: "Telugu", native: "తెలుగు", locale: "te-IN" },
  { code: "ml", label: "Malayalam", native: "മലയാളം", locale: "ml-IN" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", locale: "kn-IN" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ", locale: "pa-IN" },
  { code: "as", label: "Assamese", native: "অসমীয়া", locale: "as-IN" },
];

const loaders: Record<Exclude<LangCode, "en">, () => Promise<{ default: Dict }>> = {
  hi: () => import("./locales/hi"),
  bn: () => import("./locales/bn"),
  or: () => import("./locales/or"),
  gu: () => import("./locales/gu"),
  mr: () => import("./locales/mr"),
  ta: () => import("./locales/ta"),
  te: () => import("./locales/te"),
  ml: () => import("./locales/ml"),
  kn: () => import("./locales/kn"),
  pa: () => import("./locales/pa"),
  as: () => import("./locales/as"),
};

const STORAGE_KEY = "vayu_preferred_language";

interface I18nValue {
  lang: Language;
  t: Dict;
  setLang: (code: LangCode) => void;
  /** Replace `{name}` placeholders in a translated string. */
  fmt: (s: string, vars: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<LangCode>("en");
  const [dict, setDict] = useState<Dict>(en);

  const apply = useCallback(async (next: LangCode) => {
    const d = next === "en" ? en : (await loaders[next]()).default;
    setDict(d);
    setCode(next);
    document.documentElement.lang = next;
  }, []);

  // Restore the saved choice after hydration (server always renders English).
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as LangCode | null;
    if (!saved || saved === "en" || !(saved in loaders)) return;
    loaders[saved as Exclude<LangCode, "en">]()
      .then((m) => {
        setDict(m.default);
        setCode(saved);
        document.documentElement.lang = saved;
      })
      .catch(() => {});
  }, []);

  const setLang = useCallback(
    (next: LangCode) => {
      localStorage.setItem(STORAGE_KEY, next);
      apply(next).catch((err) => console.error("[i18n] failed to load", next, err));
    },
    [apply]
  );

  const value = useMemo<I18nValue>(
    () => ({
      lang: LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0],
      t: dict,
      setLang,
      fmt: (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? "")),
    }),
    [code, dict, setLang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <LanguageProvider>");
  return ctx;
}
