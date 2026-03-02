"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { auth } from "../../lib/firebase";

type AuthGuardProps = {
  children: ReactNode;
};

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsCheckingAuth(false);

      if (!user) {
        setIsAuthenticated(false);
        router.replace("/login");
        return;
      }

      setIsAuthenticated(true);
    });

    return () => unsubscribe();
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100 text-zinc-700">
        Checking your session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
