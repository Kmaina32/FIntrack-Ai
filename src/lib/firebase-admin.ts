
import * as admin from 'firebase-admin';
import {config} from 'firebase-functions';

// Initialize the app only if it hasn't been initialized yet.
// This is the standard pattern for server-side Firebase modules.
if (!admin.apps.length) {
  try {
    // This is the standard way to initialize in a Firebase/Google Cloud environment.
    admin.initializeApp(config().firebase);
  } catch (e) {
    console.error('Failed to initialize Firebase Admin SDK automatically. Error: ' + e);
    // Fallback for local development if FIREBASE_CONFIG is set.
    if (process.env.FIREBASE_CONFIG) {
        try {
            const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
            admin.initializeApp({
                credential: admin.credential.cert(firebaseConfig),
            });
        } catch(jsonError) {
            console.error("Error parsing FIREBASE_CONFIG:", jsonError);
        }
    } else {
        console.warn("Firebase Admin SDK not initialized. Set FIREBASE_CONFIG for local dev or ensure you're in a compatible cloud environment.");
    }
  }
}

// Export the initialized services directly.
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
