"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import type { ProfileData, AuthContextType } from "./types/authTypes";
import { useRouter } from "next/navigation";
import { createSession, deleteSession } from "./api/actions";
import { getUserProfile } from "./api/getUserProfile";


export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<ProfileData | null>(null);
  const [authUser, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    const syncSession = async () => {
      if (authUser) {
        try {
          const token = await authUser.getIdToken();
          await createSession(token);

          const profileData = await getUserProfile(authUser.uid);
          setUser(profileData);

          router.refresh();
        } catch (err) {
          console.error("Failed to sync session:", err);
        }
      } else {
        await deleteSession();
        setUser(null);
        router.refresh();
      }
    }

    if (!loading) syncSession();
  }, [authUser, loading, router]);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error as Error);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error as Error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      setError(error as Error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};