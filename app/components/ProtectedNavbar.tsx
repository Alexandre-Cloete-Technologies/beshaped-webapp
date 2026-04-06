"use client";

import { signOut } from "firebase/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "../../lib/firebase";
import Image from "next/image";

const navItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/programs", label: "Programs" },
  { href: "/exercises", label: "Exercises" },
];

export const ProtectedNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await signOut(auth);
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="border-b border-zinc-900 bg-stone-50">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-14">
        <Image
              src={"/logotwo.png"}
              alt="Company Logo"
              width={40}
              height={50}
              className="h-auto w-full object-contain"
            />
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition ${
                  isActive ? "text-emerald-700" : "text-zinc-700 hover:text-zinc-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="bg-beshaped-dark-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </nav>
    </header>
  );
};
