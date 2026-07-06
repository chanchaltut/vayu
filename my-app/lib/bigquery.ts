// lib/bigquery.ts
// BigQuery client singleton — server-side only (Route Handlers)
// Usage: import { runQuery, bq, DATASET } from '@/lib/bigquery'

import { BigQuery } from "@google-cloud/bigquery";

const bq = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

export const DATASET = process.env.BIGQUERY_DATASET || "vayu";

/**
 * Run a parameterised BigQuery SQL query.
 * @param sql  - The SQL string with @param placeholders
 * @param params - Key-value map of query parameters
 */
export async function runQuery<T = Record<string, unknown>>(
  sql: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const [rows] = await bq.query({
    query: sql,
    params,
    location: "US",
  });
  return rows as T[];
}

export { bq };
