import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

// ── Firebase configuration ───────────────────────────────────────────────────
// Credentials are read from Vite env vars at build time (via vite.config.ts
// define + .env file).  Hard-coded fallbacks are included so the production
// Electron EXE never fails to initialise even when no .env file is present
// on the build machine.  The Firebase client API key is NOT a secret
// (Firebase Security Rules + Auth protect the data); committing it here is
// the recommended pattern for packaged desktop apps.

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyA7Hz87to4eiRUjSraKgEupaFZ1TW02Mjs",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "rssb-sne-rdp.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || "rssb-sne-rdp",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "rssb-sne-rdp.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1098224443428",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:1098224443428:web:83239fc5d5a46a980b38b1",
};

// Always configured — fallbacks guarantee this is never null
export const isFirebaseConfigured = true;

const _app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const app: FirebaseApp = _app;
export const auth: Auth = getAuth(_app);
export const db: Firestore = getFirestore(_app);
