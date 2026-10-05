import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { env } from '@/config/env';

export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

let app = null;
let auth = null;
let db = null;

try {
  if (getApps().length === 0) {
    app = initializeApp(env.FIREBASE);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn('[Firebase] Initialized in simulated/offline mode:', error.message);
}

export { app, auth, db };
export default app;
