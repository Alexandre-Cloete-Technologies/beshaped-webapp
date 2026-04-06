"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { PiArrowLeft } from "react-icons/pi";
import { type FormEvent, useState } from "react";
import { Navbar } from "../components/Navbar";
import { auth } from "../../lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/dashboard");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900">
      <Navbar />

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

          <form className="mt-8 flex flex-col gap-6" onSubmit={handleSignIn}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="emailAddress" className="text-sm font-medium text-zinc-700">
                  Email Address
                </label>
                <input
                  id="emailAddress"
                  name="emailAddress"
                  type="email"
                  autoComplete="email"
                  placeholder="your@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className={inputClass}
                />
              </div>

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
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-beshaped-green px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {isLoading ? "Signing in..." : "Log In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
