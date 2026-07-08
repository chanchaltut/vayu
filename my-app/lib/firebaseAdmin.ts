// lib/firebaseAdmin.ts
// Firebase ADMIN SDK — server-side only (Route Handlers, lib functions).
// NEVER import this in client components — it will break the build.

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

function getAdminApp(): App | undefined {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("⚠️ Firebase Admin environment variables not set. Deferring initialization.");
    return undefined;
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const app = getAdminApp();
const adminApp = (app || {}) as App;
const adminDb = (app ? getFirestore(app) : {}) as Firestore;
const adminStorage = (app ? getStorage(app) : {}) as Storage;

export { adminApp, adminDb, adminStorage };
