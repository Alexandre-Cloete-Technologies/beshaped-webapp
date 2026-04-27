import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
      <Image
              src={"/logotwo.png"}
              alt="Company Logo"
              width={30}
              height={40}
        />
        <nav className="flex gap-8 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">
          <a href="#programs" className="transition hover:text-white">
            Programs
          </a>
          <a href="#faq" className="transition hover:text-white">
            FAQs
          </a>
          <a href="#contact" className="transition hover:text-white">
            Contact
          </a>
        </nav>
        <p className="text-xs text-zinc-500">Designed and Developed by Alexandre Cloete Technologies</p>
      </div>
    </footer>
  );
};
