"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../../lib/hooks/useAuth";

type AuthGuardProps = {
  children: ReactNode;
};

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter();
  const [user, loading] = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100 text-zinc-700">
        Checking your session...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};
