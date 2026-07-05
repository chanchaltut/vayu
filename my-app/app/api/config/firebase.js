// api/config/firebase.js
// Firebase Admin SDK — initialised once, imported everywhere
// Think of this like mongoose.connect() in your MERN projects

import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import dotenv from 'dotenv'
dotenv.config()

let firebaseApp

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
  )

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  })
} else {
  firebaseApp = admin.app()
}

// Realtime Database — for live sensor stream (Ankit's map reads this in real-time)
export const db = admin.database()

// Firestore — for structured collections (optional, alongside RTDB)
export const firestore = admin.firestore()

// Storage — for citizen photo uploads
export const storage = admin.storage()

export default firebaseApp
