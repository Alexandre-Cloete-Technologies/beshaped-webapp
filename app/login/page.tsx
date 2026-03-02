"use client";
import Image from "next/image";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { PiArrowLeft } from "react-icons/pi";
import { useState } from "react";
import { auth } from "../../lib/firebase";
const COMPANY_LOGO = "/vercel.svg";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/dashboard";
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-stone-100 px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-stone-50 p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="relative w-full max-w-[220px]">
            <Image
              src={"/logo.jpg"}
              alt="Company Logo"
              width={320}
              height={120}
              className="h-auto w-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Welcome back</h1>
          <p className="text-center text-sm text-zinc-500">
            Sign in to continue your fitness journey.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-stone-400 hover:text-zinc-900"
          >
            <PiArrowLeft className="size-4" />
            <span>Back to landing page</span>
          </Link>
        </div>

        <div className="flex h-fit w-full flex-col items-center justify-center">
          <form className="flex w-full flex-col gap-6" onSubmit={handleSignIn}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="emailAddress" className="text-sm font-medium text-zinc-700">
                  Email Address
                </label>
                <input
                  id="emailAddress"
                  name="emailAddress"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500"
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
                  placeholder="********"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500"
                />
              </div>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {isLoading ? "Signing in..." : "Log In"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
