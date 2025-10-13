"use client";

import React, { createContext, useContext, type PropsWithChildren } from 'react';
import type { User } from 'firebase/auth';

type AuthContextType = User | null;

const AuthContext = createContext<AuthContextType>(null);

export const AuthProvider = ({ children, user }: PropsWithChildren<{ user: User | null }>) => {
  return (
    <AuthContext.Provider value={user}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
