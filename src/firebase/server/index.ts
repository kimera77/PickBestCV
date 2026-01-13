"use server";
import "server-only";
import * as admin from "firebase-admin";

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

  // Use application default credentials which are automatically available
  // in Google Cloud environments like App Hosting by calling initializeApp()
  // without arguments.
  _app = admin.initializeApp();

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
