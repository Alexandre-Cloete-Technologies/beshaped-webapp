export const Banner = () => {
  return (
    <section id="start" className="w-full bg-white">
      <div className="mx-auto flex min-h-[88vh] max-w-7xl flex-col items-stretch md:flex-row">
        {/* Left: text */}
        <div className="flex flex-1 flex-col justify-center px-8 py-16 md:px-16 md:py-24">
          <div className="-translate-y-6 md:-translate-y-10 lg:-translate-y-12">
            <h1 className="mt-4 font-black uppercase leading-none tracking-tight">
              <span className="block text-5xl text-zinc-900 md:text-7xl">Get</span>
              <span className="block text-6xl text-[#00a62c] md:text-8xl">BESHAPED</span>
              <span className="block text-5xl text-zinc-900 md:text-7xl">strong</span>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-zinc-500 md:text-base">
              Science-based coaching, personalised programming and results you can see and feel.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#pricing"
                className="bg-[#00a62c] px-8 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-[#6aaa1e]"
              >
                Start now
              </a>
              <a
                href="#programs"
                className="border-2 border-zinc-300 px-8 py-3 text-sm font-bold uppercase tracking-widest text-zinc-700 transition hover:border-zinc-700"
              >
                Browse programs
              </a>
            </div>
          </div>
        </div>

        {/* Right: athlete image */}
        <div className="relative min-h-[50vh] flex-1 overflow-hidden md:min-h-0">
          <img
            src="/hero_image.jpg"
            alt="Athlete"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
};
