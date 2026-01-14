"use client";

import React, { createContext, useContext, type PropsWithChildren, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, type User, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeFirebase } from '@/firebase/client';

// Initialize firebase and auth
const { auth } = initializeFirebase();

// The context can hold User, null (logged out), or undefined (initial loading state)
type AuthContextType = User | null | undefined;

const AuthContext = createContext<AuthContextType>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AuthContextType>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
       // When using emulators, onAuthStateChanged can fire before the token is propagated to the server,
       // causing server-side checks to fail. We force a token refresh to mitigate this.
       if (firebaseUser) {
           await firebaseUser.getIdToken(true);
       }
       setUser(firebaseUser);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

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
export const clientHandleSignIn = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);
export const clientHandleSignUp = (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password);
export const clientHandleAnonymousSignIn = () => signInAnonymously(auth);
export const clientHandleSignOut = () => auth.signOut();
