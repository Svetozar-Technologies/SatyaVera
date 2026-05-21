import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

function publicEnv(value: string | undefined, fallback: string): string {
  return value && value !== "ci-placeholder" ? value : fallback;
}

const firebaseConfig = {
  apiKey: publicEnv(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    "AIzaSyDUMMYDUMMYDUMMYDUMMYDUMMYDUMMYDUM"
  ),
  authDomain: publicEnv(
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    "satyavera-local.firebaseapp.com"
  ),
  projectId: publicEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, "satyavera-local"),
  storageBucket: publicEnv(
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    "satyavera-local.appspot.com"
  ),
  messagingSenderId: publicEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, "0"),
  appId: publicEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID, "1:0:web:0000000000000000000000"),
  measurementId: publicEnv(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, "G-0000000"),
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
