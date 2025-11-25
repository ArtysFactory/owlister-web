import "server-only";
import { initializeApp, getApps, getApp, cert, ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Helper to parse service account from env
function getServiceAccount(): ServiceAccount | undefined {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
            return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        } catch (e) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY", e);
        }
    }
    return undefined;
}

const serviceAccount = getServiceAccount();

const firebaseAdminConfig = {
    credential: serviceAccount ? cert(serviceAccount) : undefined,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

const app = !getApps().length
    ? initializeApp(firebaseAdminConfig)
    : getApp();

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export const adminStorage = getStorage(app);
