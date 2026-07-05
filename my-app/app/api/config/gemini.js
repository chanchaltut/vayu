// api/config/gemini.js
// Gemini API client — powers all AI features in VAYU
// Two models: Pro (text/fusion) and Vision (photo analysis)

import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in .env file')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// For hotspot fusion — takes sensor readings text + photo analysis text → JSON decision
export const geminiPro = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  generationConfig: {
    temperature: 0.2,      // low temp = consistent, factual outputs (not creative)
    responseMimeType: 'application/json',
  },
})

// For citizen photo analysis — multimodal (image + text)
export const geminiVision = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  generationConfig: {
    temperature: 0.1,
    responseMimeType: 'application/json',
  },
})

export default genAI
