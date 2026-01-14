import "server-only";
import { initializeApp, getApps, getApp, App, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let _app: App | null = null;
let _firestore: Firestore | null = null;

export async function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  // Check if the service account key is available in environment variables
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) as ServiceAccount;
      _app = initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", e);
      throw new Error("Could not initialize Firebase Admin SDK with service account.");
    }
  } else {
    // Otherwise, use application default credentials in production
    _app = initializeApp();
  }

  return _app;
}
 
export async function getAdminFirestore() {
  if (_firestore) return _firestore;
  
  const app = await getAdminApp();
  _firestore = getFirestore(app);
  return _firestore;
}

export async function verifySessionCookie(sessionCookie: string) {
  try {
    const app = await getAdminApp();
    const auth = getAuth(app);
    return await auth.verifySessionCookie(sessionCookie, true);
  } catch (error) {
    console.error("Error verifying session cookie", error);
    return null;
  }
}
