// ELIMINA "use server" de la primera línea.
import "server-only";
import * as admin from "firebase-admin";

let _app: admin.app.App | null = null;

export async function getAdminApp() {
  // Comprobamos si ya existe una app para evitar re-inicializar en cada recarga (HMR)
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  if (!_app) {
    _app = admin.initializeApp({
      // Si estás en local, asegúrate de tener las credenciales configuradas
      // o añade aquí explícitamente el credential: admin.credential.cert(...)
    });
  }
  
  return _app;
}

export async function getAdminFirestore() {
  const app = await getAdminApp();
  return admin.firestore(app);
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
