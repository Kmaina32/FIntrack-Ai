import * as admin from 'firebase-admin';
import {config} from 'firebase-functions';

// In this environment, we use firebase-functions.config() to initialize.
if (!admin.apps.length) {
  try {
    admin.initializeApp(config().firebase);
  } catch (e) {
    console.error('Failed to initialize Firebase Admin SDK automatically. Error: ' + e);
    // As a fallback for local testing, you might use a service account key
    // but this is not recommended for production environments.
    // Ensure FIREBASE_CONFIG is set in your local environment if this fails.
     if (process.env.FIREBASE_CONFIG) {
        const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
        admin.initializeApp({
            credential: admin.credential.cert(firebaseConfig),
        });
     } else {
        console.error("Firebase Admin SDK initialization failed. Set FIREBASE_CONFIG env variable for local development.");
     }
  }
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

export const getFirebaseAdmin = () => ({
  db,
  auth,
  storage,
});
