'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { Auth, getAuth, connectAuthEmulator } from 'firebase/auth';
import { Firestore, getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  const isConfigAvailable = firebaseConfig && Object.values(firebaseConfig).every(v => !!v);

  if (!getApps().length) {
    if (!isConfigAvailable && process.env.NEXT_PUBLIC_USE_EMULATORS) {
      console.warn("Firebase config is not available. App will be initialized with emulators if NEXT_PUBLIC_USE_EMULATORS is true.");
    }
    
    // Initialize app, falling back to config if auto-init is not available (e.g., local dev without App Hosting).
    const app = initializeApp(isConfigAvailable ? firebaseConfig : {});
    return getSdks(app);
  }
  
  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  if (process.env.NEXT_PUBLIC_USE_EMULATORS) {
    const host = process.env.NEXT_PUBLIC_EMULATOR_HOST || 'localhost';
    console.log(`Connecting to Firebase Emulators at ${host}`);
    
    // Check if not already connected
    if (!(auth as any).emulatorConfig) {
      connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    }
    if (!(firestore as any).emulatorConfig) {
      connectFirestoreEmulator(firestore, host, 8080);
    }
  }

  return {
    firebaseApp,
    auth,
    firestore,
  };
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
