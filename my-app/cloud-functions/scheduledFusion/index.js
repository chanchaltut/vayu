// cloud-functions/scheduledFusion/index.js
// Google Cloud Function — runs hotspot detection every 15 minutes automatically
// Triggered by Cloud Scheduler → Pub/Sub → this function
//
// Deploy command:
// gcloud functions deploy vayu-scheduled-fusion \
//   --gen2 \
//   --runtime=nodejs20 \
//   --trigger-topic=vayu-fusion-trigger \
//   --entry-point=scheduledFusion \
//   --region=asia-south1 \
//   --set-env-vars GOOGLE_CLOUD_PROJECT=your-project,BIGQUERY_DATASET=vayu,...

import { detectAndSaveHotspots } from '../../bigquery-gemini-fusion/hotspotDetector.js'

export const scheduledFusion = async (message, context) => {
  console.log('[CLOUD-FN] Scheduled hotspot detection triggered')
  console.log('[CLOUD-FN] Pub/Sub message:', message?.data
    ? Buffer.from(message.data, 'base64').toString()
    : 'no data')

  try {
    const result = await detectAndSaveHotspots()
    console.log(`[CLOUD-FN] Done: ${result.hotspotsSaved} hotspots saved`)
  } catch (err) {
    console.error('[CLOUD-FN] Detection error:', err.message)
    throw err  // re-throw so Cloud Functions marks the invocation as failed
  }
}
