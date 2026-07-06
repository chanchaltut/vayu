// app/api/alerts/route.ts
// GET  /api/alerts → list recent alerts
// POST /api/alerts → trigger a new alert

import { NextRequest } from "next/server";
import { triggerAlert } from "./handlers/triggerAlert";
import { getAlerts } from "./handlers/getAlerts";
import { apiError } from "@/lib/apiError";

export async function GET() {
  try {
    return await getAlerts();
  } catch (err) {
    console.error("[API/alerts GET]", err);
    return apiError("Failed to fetch alerts", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    return await triggerAlert(req);
  } catch (err) {
    console.error("[API/alerts POST]", err);
    return apiError("Failed to trigger alert", 500);
  }
}
