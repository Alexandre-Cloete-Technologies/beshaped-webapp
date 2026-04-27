"use client";

import Link from "next/link";
import { PiArrowLeft } from "react-icons/pi";
import { useState } from "react";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth"
import { FirebaseError } from "firebase/app";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.email("Invalid email address").trim(),
  password: z.string().min(6, "Password must be at least 6 characters long").trim(),
});

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<z.core.$ZodFormattedError<z.infer<typeof loginSchema>> | null>(null);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      setFieldErrors(result.error.format());
      return;
    }
    setLoading(true);

    try {
      await signIn(result.data.email, result.data.password);
      router.push("/dashboard");
    } catch (err) {
      const firebaseError = err as FirebaseError;

      // Map Firebase errors to user-friendly messages
      switch (firebaseError.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          setError("Invalid email or password. Please try again.");
          break;
        case "auth/too-many-requests":
          setError("Too many failed attempts. Please try again later.");
          break;
        case "auth/user-disabled":
          setError("This account has been disabled. Contact support.");
          break;
        default:
          setError("An error occurred. Please try again.");
          console.error("Login error:", firebaseError);
      }
    } finally {
      setLoading(false);
    }

  }

  const inputClass =
    "w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20 pt-4 md:px-8">
      <div className="w-full max-w-[400px] rounded-2xl border border-zinc-200/90 bg-white p-8 shadow-[0_4px_24px_rgba(15,23,42,0.06)] md:p-10">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold text-zinc-900">Welcome back</h1>
          <p className="text-sm leading-relaxed text-zinc-500">
            Sign in to continue your fitness journey.
          </p>
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-1 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-stone-400 hover:text-zinc-900"
          >
            <PiArrowLeft className="size-4" aria-hidden />
            <span>Back to landing page</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-zinc-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="your@example.com"
                required
                className={inputClass}
              />
            </div>
            {fieldErrors?.email?._errors[0] && (
              <p className="text-xs text-red-600">{fieldErrors.email._errors[0]}</p>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-zinc-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="********"
                required
                className={inputClass}
              />
            </div>
            {fieldErrors?.password?._errors[0] && (
              <p className="text-xs text-red-600">{fieldErrors.password._errors[0]}</p>
            )}

            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-beshaped-green px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {loading ? "Signing in..." : "Log In"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
