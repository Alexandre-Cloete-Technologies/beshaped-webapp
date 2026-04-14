"use client";

import { signOut } from "firebase/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "../../lib/firebase";
import Image from "next/image";
import { FiMenu, FiX } from "react-icons/fi";

const navItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/programs", label: "Programs" },
  { href: "/exercises", label: "Exercises" },
];

export const ProtectedNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await signOut(auth);
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="border-b border-zinc-900 bg-stone-50 relative z-50">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-14">
          <Image
            src={"/logotwo.png"}
            alt="Company Logo"
            width={40}
            height={50}
            className="h-auto w-10 object-contain"
          />
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-14">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition ${
                    isActive ? "text-beshaped-dark-green" : "text-zinc-700 hover:text-zinc-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Desktop Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="hidden md:block bg-beshaped-dark-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={toggleMenu}
          className="md:hidden p-2 text-zinc-900"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-stone-50 border-b border-zinc-900 shadow-xl py-4 px-6 flex flex-col gap-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`text-base font-medium transition ${
                  isActive ? "text-beshaped-dark-green" : "text-zinc-700 hover:text-zinc-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <hr className="border-zinc-200 my-2" />
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              handleLogout();
            }}
            disabled={isLoggingOut}
            className="w-full bg-beshaped-dark-green px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400 text-center"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      )}
    </header>
  );
};
