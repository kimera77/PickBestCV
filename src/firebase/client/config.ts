// Configuración de Firebase - Las variables deben ser referenciadas directamente
// para que Next.js las inyecte correctamente en tiempo de compilación
export const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
};

// Validar configuración solo cuando se solicite
export function validateFirebaseConfig() {
  // Solo validar en el cliente
  if (typeof window === 'undefined') {
    return;
  }

  // Validar directamente los valores del objeto config
  const requiredFields = ['projectId', 'appId', 'apiKey', 'authDomain', 'messagingSenderId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);

  if (missingFields.length > 0) {
    const errorMessage = `Configuración de Firebase incompleta. Campos vacíos: ${missingFields.join(', ')}`;
    console.error(errorMessage);
    console.error('Valores actuales:', {
      projectId: firebaseConfig.projectId || 'VACÍO',
      appId: firebaseConfig.appId || 'VACÍO',
      apiKey: firebaseConfig.apiKey ? '***configurado***' : 'VACÍO',
      authDomain: firebaseConfig.authDomain || 'VACÍO',
      messagingSenderId: firebaseConfig.messagingSenderId || 'VACÍO',
    });
    throw new Error(errorMessage);
  }
}
