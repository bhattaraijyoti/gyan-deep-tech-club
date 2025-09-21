"use client";

import React, { createContext, useContext, useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase";
import { createUserIfNotExist } from "@/lib/firestore";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  provider: "firebase";
}

interface AuthContextProps {
  user: UserProfile | null;
  loading: boolean;
  signupWithEmail: (name: string, email: string, password: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Email/password signup
  const signupWithEmail = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const uid = cred.user.uid;

      await createUserIfNotExist(uid);

      setUser({ uid, email, displayName: name, provider: "firebase" });
    } finally {
      setLoading(false);
    }
  };

  // Email/password login
  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const uid = cred.user.uid;

      await createUserIfNotExist(uid);

      setUser({
        uid,
        email,
        displayName: cred.user.displayName ?? null,
        provider: "firebase",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signupWithEmail, loginWithEmail }}>
      {children}
    </AuthContext.Provider>
  );
};