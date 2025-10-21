import * as admin from 'firebase-admin';

// In this environment, the Admin SDK can automatically discover the credentials.
// We don't need to manually parse the FIREBASE_SERVICE_ACCOUNT environment variable.
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

export const getFirebaseAdmin = () => ({
  db,
  auth,
  storage,
});
