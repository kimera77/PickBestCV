"use client";

import React, { createContext, useContext, type PropsWithChildren, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

// Initialize firebase and auth
const { auth } = initializeFirebase();

// The context can hold User, null (logged out), or undefined (initial loading state)
type AuthContextType = User | null | undefined;

const AuthContext = createContext<AuthContextType>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AuthContextType>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
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
