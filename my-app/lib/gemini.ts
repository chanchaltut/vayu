// lib/gemini.ts
// Gemini AI client — server-side only (Route Handlers)
// Usage: import { geminiPro, geminiVision } from '@/lib/gemini'

import {
  GoogleGenerativeAI,
  GenerativeModel,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("[GEMINI] GEMINI_API_KEY is not set — AI features will fail");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

// ── Text-only model (for forecast, fusion reasoning) ─────────────────────────
export const geminiPro: GenerativeModel = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  safetySettings,
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.2,
  },
});

// ── Vision model (for citizen photo smoke detection) ─────────────────────────
export const geminiVision: GenerativeModel = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  safetySettings,
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.1,
  },
});
