import Link from "next/link";
import Image from "next/image";

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
        <Image
              src={"/logotwo.png"}
              alt="Company Logo"
              width={40}
              height={50}
              className="h-auto w-full object-contain"
            />

        </Link>

        {/* Centre nav links */}
        <div className="hidden items-center gap-8 md:flex">
          {[
            { label: "Programs", href: "#programs" },
            { label: "FAQ", href: "#faq" },
            { label: "Contact", href: "#contact" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xs font-semibold uppercase tracking-widest text-zinc-600 transition hover:text-zinc-900"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="#start"
            className="hidden rounded-full border border-zinc-300 px-5 py-2 text-xs font-bold uppercase tracking-widest text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900 md:inline-flex"
          >
            Start now
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-[#7ec225] px-5 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#6aaa1e]"
          >
            Members login
          </Link>
        </div>
      </nav>
    </header>
  );
};
