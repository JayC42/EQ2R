/**
 * E2R — Firebase Client Configuration
 * Initialize Firebase app + Auth for the frontend.
 * Set PUBLIC_FIREBASE_* env vars in .env or Astro config.
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.firebasestorage.app",
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000",
};

let app: FirebaseApp;
let auth: Auth;

// Avoid re-initializing in HMR / SSR
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);

export { app, auth };
