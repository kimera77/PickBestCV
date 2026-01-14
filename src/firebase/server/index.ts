import "server-only";
import { initializeApp, getApps, getApp, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let _app: App | null = null;
let _firestore: Firestore | null = null;

export async function getAdminApp() {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0]!;
  }

  if (!_app) {
    // Inicialización limpia para entornos de servidor
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