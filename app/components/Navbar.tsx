import Link from "next/link";
import { PiBarbell } from "react-icons/pi";

const navItems = [
  { label: "Pricing", href: "#" },
  { label: "Plans", href: "#" },
  { label: "VIP Coaching", href: "#" },
];

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-zinc-900">
          <PiBarbell className="size-6 text-green-600" />
          <span className="text-lg font-bold">BeShaped</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-zinc-700 transition hover:text-green-600"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Link
          href="/login"
          className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          Login
        </Link>
      </nav>
    </header>
  );
};
