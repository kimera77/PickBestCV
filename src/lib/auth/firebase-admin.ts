"use server";
import "server-only";
import * as admin from "firebase-admin";

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_B64
  ? JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, "base64").toString()
    )
  : undefined;

let _app: admin.app.App | null = null;
let _firestore: admin.firestore.Firestore | null = null;

export async function getAdminApp() {
  if (_app) {
    return _app;
  }

  if (admin.apps.length > 0) {
    _app = admin.apps[0]!;
    return _app;
  }

  if (!serviceAccount) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_B64 environment variable.");
  }

  _app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return _app;
}

export async function getAdminFirestore() {
    if (_firestore) {
        return _firestore;
    }
    await getAdminApp(); // Ensure app is initialized
    _firestore = admin.firestore();
    return _firestore;
}


export async function verifySessionCookie(sessionCookie: string) {
    try {
        const adminAuth = (await getAdminApp()).auth();
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
        return decodedClaims;
    } catch (error) {
        console.error("Error verifying session cookie", error);
        return null;
    }
}
