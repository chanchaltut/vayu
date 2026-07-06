// app/api/alerts/handlers/getAlerts.ts
// GET /api/alerts — returns last 50 alerts from BigQuery

import { NextResponse } from "next/server";
import { runQuery, DATASET } from "@/lib/bigquery";
import { apiSuccess } from "@/lib/apiError";

interface AlertRow {
  id: string;
  triggered_at: string;
  hotspot_id: string;
  message: string;
  channel: string;
  status: string;
}

export async function getAlerts(): Promise<NextResponse> {
  const sql = `
    SELECT id, triggered_at, hotspot_id, message, channel, status
    FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${DATASET}.alerts\`
    ORDER BY triggered_at DESC
    LIMIT 50
  `;
  const alerts = await runQuery<AlertRow>(sql);
  return apiSuccess({ count: alerts.length, alerts });
}
