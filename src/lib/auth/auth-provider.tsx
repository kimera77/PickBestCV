"use client";

import React, { createContext, useContext, type PropsWithChildren, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, type User, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, type Auth } from 'firebase/auth';
import { initializeFirebase } from '@/firebase/client';

// Lazy initialization of Firebase
let authInstance: Auth | null = null;

function getAuthInstance(): Auth {
  if (!authInstance) {
    const { auth } = initializeFirebase();
    authInstance = auth;
  }
  return authInstance;
}

// The context can hold User, null (logged out), or undefined (initial loading state)
type AuthContextType = User | null | undefined;

const AuthContext = createContext<AuthContextType>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AuthContextType>(undefined);
  const [auth, setAuth] = useState<Auth | null>(null);

  useEffect(() => {
    // Initialize auth only on client side
    try {
      const authInstance = getAuthInstance();
      console.log('Auth instance inicializada');
      setAuth(authInstance);
    } catch (error) {
      console.error('Error initializing auth:', error);
      setUser(null);
      return;
    }
  }, []);

  useEffect(() => {
    if (!auth) return;

    console.log('Configurando listener de auth...');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
       console.log('Auth state changed:', firebaseUser ? `Usuario: ${firebaseUser.uid}` : 'Sin usuario');
       // When using emulators, onAuthStateChanged can fire before the token is propagated to the server,
       // causing server-side checks to fail. We force a token refresh to mitigate this.
       if (firebaseUser) {
           await firebaseUser.getIdToken(true);
       }
       setUser(firebaseUser);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  return (
    <AuthContext.Provider value={user}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  // We don't throw an error if context is undefined, because it's a valid loading state.
  // Components using this hook should handle the `undefined` case.
  return context;
};

// Client-side auth actions that components can call
export const clientHandleSignIn = (email: string, password: string) => signInWithEmailAndPassword(getAuthInstance(), email, password);
export const clientHandleSignUp = (email: string, password: string) => createUserWithEmailAndPassword(getAuthInstance(), email, password);
export const clientHandleAnonymousSignIn = () => signInAnonymously(getAuthInstance());
export const clientHandleSignOut = () => getAuthInstance().signOut();
