// app/api/photos/route.ts
// POST /api/photos — citizen photo upload with Gemini Vision analysis

import { NextRequest } from "next/server";
import { uploadPhoto } from "./handlers/uploadPhoto";
import { apiError } from "@/lib/apiError";

export async function POST(req: NextRequest) {
  try {
    return await uploadPhoto(req);
  } catch (err) {
    console.error("[API/photos POST]", err);
    return apiError("Failed to process photo upload", 500);
  }
}
