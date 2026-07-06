// app/api/hotspots/route.ts
// GET /api/hotspots → list hotspots (with ?hours=2&severity=1 filters)

import { NextRequest } from "next/server";
import { getHotspots } from "./handlers/getHotspots";
import { apiError } from "@/lib/apiError";

export async function GET(req: NextRequest) {
  try {
    return await getHotspots(req);
  } catch (err) {
    console.error("[API/hotspots GET]", err);
    return apiError("Failed to fetch hotspots", 500);
  }
}
