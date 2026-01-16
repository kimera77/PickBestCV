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
  } else if (process.env.SERVICE_ACCOUNT_JSON) {
    // Fallback: support JSON string format
    try {
      let serviceAccountData = process.env.SERVICE_ACCOUNT_JSON;
      
      // If it's already an object (shouldn't happen), use it directly
      // Otherwise, parse the JSON string
      const serviceAccount = typeof serviceAccountData === 'string' 
        ? JSON.parse(serviceAccountData) 
        : serviceAccountData;
      
      _app = initializeApp({
        credential: cert(serviceAccount as ServiceAccount),
      });
      
      console.log('✅ Firebase Admin initialized with SERVICE_ACCOUNT_JSON');
    } catch (e) {
      console.error('❌ Failed to parse SERVICE_ACCOUNT_JSON:', e);
      logError(e, { context: 'Failed to parse SERVICE_ACCOUNT_JSON' });
      throw new Error("Could not initialize Firebase Admin SDK with service account.");
    }
  } else {
    // Firebase App Hosting auto-configures credentials
    // Use application default credentials (works in Firebase App Hosting)
    try {
      console.log('🔄 Attempting to use default credentials...');
      _app = initializeApp({
        projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'studio-2697715951-c0e8e',
      });
      console.log('✅ Firebase Admin initialized with default credentials');
    } catch (e) {
      console.error('❌ Failed with default credentials:', e);
      logError(e, { context: 'Failed to initialize Firebase Admin SDK with default credentials' });
      throw new Error("Could not initialize Firebase Admin SDK. Missing credentials.");
    }
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
