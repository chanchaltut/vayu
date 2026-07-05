// api/config/bigquery.js
// BigQuery client — Google's data warehouse (like MongoDB Atlas but for analytics + Gemini fusion)

import { BigQuery } from '@google-cloud/bigquery'
import dotenv from 'dotenv'
dotenv.config()

export const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.FIREBASE_SERVICE_ACCOUNT_PATH, // reuse same service account key
})

export const DATASET = process.env.BIGQUERY_DATASET || 'vayu'

// Helper: run any BigQuery SQL query and return rows
export const runQuery = async (query, params = []) => {
  const options = {
    query,
    params,
    location: 'US',
  }
  const [rows] = await bigquery.query(options)
  return rows
}
