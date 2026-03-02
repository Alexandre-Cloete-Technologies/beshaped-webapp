"use client";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";

export default function DashboardPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      setUserEmail(user.email ?? "");
      setIsCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await signOut(auth);
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100 text-zinc-700">
        Checking your session...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-6 py-10">
      <div className="w-full max-w-2xl rounded-2xl border border-stone-200 bg-stone-50 p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-zinc-900">Welcome to your dashboard</h1>
        <p className="mt-3 text-zinc-600">
          You are logged in{userEmail ? ` as ${userEmail}` : ""}.
        </p>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="mt-8 rounded-lg bg-zinc-900 px-5 py-2.5 font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isLoggingOut ? "Logging out..." : "Log out"}
        </button>
      </div>
    </div>
  );
}
