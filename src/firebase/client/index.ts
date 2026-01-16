'use client';

import { firebaseConfig } from '@/firebase/client/config-hardcoded';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    // Important! initializeApp() is called without any arguments because Firebase App Hosting
    // integrates with the initializeApp() function to provide the environment variables needed to
    // populate the FirebaseOptions in production. It is critical that we attempt to call initializeApp()
    // without arguments.
    let firebaseApp;
    try {
      // Attempt to initialize via Firebase App Hosting environment variables
      firebaseApp = initializeApp();
    } catch (e) {
      // Only warn in production because it's normal to use the firebaseConfig to initialize
      // during development
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      
      // Inicializar con la configuración hardcoded
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  // Conectar a emuladores en desarrollo
  if (process.env.NODE_ENV === 'development') {
    // Solo conectar una vez
    if (!(auth as any)._canInitEmulator) {
      try {
        connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      } catch (e) {
        // Ya está conectado
      }
    }
    
    if (!(firestore as any)._settingsFrozen) {
      try {
        connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
      } catch (e) {
        // Ya está conectado
      }
    }
  }

  return {
    firebaseApp,
    auth,
    firestore
  };
}
