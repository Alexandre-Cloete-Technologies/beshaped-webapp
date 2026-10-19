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
import { subscribeToUserProfile } from "./api/subscribeToUserProfile";


export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState<Error | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [authUser, loading] = useAuthState(auth);
  const router = useRouter();
  const uid = authUser?.uid;
  // Only the signed-in user's own profile; null while signed out or before the doc exists.
  const user = profile && profile.uid === uid ? profile : null;

  useEffect(() => {
    const syncSession = async () => {
      if (authUser) {
        try {
          const token = await authUser.getIdToken();
          await createSession(token);
          router.refresh();
        } catch (err) {
          console.error("Failed to sync session:", err);
        }
      } else {
        await deleteSession();
        router.refresh();
      }
    }

    if (!loading) syncSession();
  }, [authUser, loading, router]);

  useEffect(() => {
    if (!uid) return;
    // Sign-out can end the listener with a permission error before cleanup runs; show no profile then.
    return subscribeToUserProfile(uid, setProfile, () => setProfile(null));
  }, [uid]);

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