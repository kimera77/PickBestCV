import "server-only";
import { initializeApp, getApps, getApp, App, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { logError } from "@/lib/errors";

let _app: App | null = null;
let _firestore: Firestore | null = null;

export async function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  // Build service account from individual environment variables
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    const serviceAccount: ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    };

    _app = initializeApp({
      credential: cert(serviceAccount),
    });
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Fallback: support JSON string format
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) as ServiceAccount;
      _app = initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (e) {
      logError(e, { context: 'Failed to parse FIREBASE_SERVICE_ACCOUNT' });
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
    logError(error, { context: 'verifySessionCookie' });
    return null;
  }
}
