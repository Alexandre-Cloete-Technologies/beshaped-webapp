import { Banner } from "./components/Banner";
import { MeetTheTrainer } from "./components/MeetTheTrainer";
import { Navbar } from "./components/Navbar";

const memberFeatures = [
  {
    icon: "🏋️",
    title: "Custom training program",
    desc: "Built specifically for your body and your schedule so every rep moves the needle.",
  },
  {
    icon: "🥗",
    title: "Eat without guessing",
    desc: "Tailored meal planning with flexible dieting protocols for sustainable results.",
  },
  {
    icon: "📱",
    title: "Your journey in your pocket",
    desc: "Ditch the messy spreadsheets and PDFs. Access your entire transformation in one seamless place.",
  },
  {
    icon: "📈",
    title: "See the proof",
    desc: "Progress tracking on the metrics that actually matter — strength gains to body composition.",
  },
  {
    icon: "💬",
    title: "Direct coach access",
    desc: "Priority communication channel for real-time adjustments and psychological support.",
  },
  {
    icon: "🎬",
    title: "Perfect your technique",
    desc: "HD video tutorials and step-by-step cues so you can lift with confidence and stay injury-free.",
  },
];

const transformations = [
  "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop",
];

export default function Home() {
  return (
    <div className="w-full bg-white text-zinc-900">
      <Navbar />
      <Banner />

      {/* Meet your trainer */}
      <MeetTheTrainer />

      {/* How it works */}
      <section id="how-it-works" className="bg-zinc-100 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
            how it works
          </p>
          <div className="mt-8 grid gap-8 md:grid-cols-4">
            {[
              {
                num: "01",
                label: "Register",
                desc: "Select and register for one of the coaching packages.",
              },
              {
                num: "02",
                label: "Profile setup",
                desc: "Your profile will be set up and you'll have access to our members area.",
              },
              {
                num: "03",
                label: "Access your members area",
                desc: "Follow your custom training program, exercise library and step-by-step form guides.",
              },
              {
                num: "04",
                label: "Your path is set",
                desc: "The groundwork is laid. Start building.",
              },
            ].map((step) => (
              <article key={step.num}>
                <span className="text-5xl font-black text-[#7ec225] md:text-6xl">{step.num}</span>
                <h3 className="mt-3 text-sm font-black uppercase tracking-widest text-zinc-900">
                  {step.label}
                </h3>
                <p className="mt-2 text-sm text-zinc-500">{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* What you have as a member */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
            What you have as a member
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {memberFeatures.map((f) => (
              <article key={f.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[#7ec22520] text-xl">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wide text-zinc-900">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">{f.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Our Transformations */}
      <section className="bg-zinc-100 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
            Our Transformations
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {transformations.map((src, i) => (
              <div key={i} className="overflow-hidden rounded-lg">
                <img
                  src={src}
                  alt={`Transformation ${i + 1}`}
                  className="h-56 w-full object-cover transition duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Become a member – pricing */}
      <section id="pricing" className="bg-zinc-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
            Become a member
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">

            {/* Silver */}
            <article className="flex flex-col rounded-2xl border border-zinc-700 bg-zinc-900 p-7">
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">Silver</h3>
              <p className="mt-3 text-3xl font-black">N$1500 <span className="text-base font-normal text-zinc-400">/mo</span></p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-zinc-300">
                <li>Custom training program</li>
                <li>Access to the members platform</li>
                <li>Bi-weekly check-ins</li>
                <li>App access</li>
              </ul>
              <button className="mt-6 rounded-full border border-zinc-600 py-2.5 text-sm font-bold uppercase tracking-widest transition hover:border-white hover:text-white">
                Sign up
              </button>
            </article>

            {/* Gold – most popular */}
            <article className="relative flex flex-col rounded-2xl border-2 border-[#7ec225] bg-zinc-900 p-7">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#7ec225] px-4 py-1 text-xs font-bold uppercase tracking-widest text-zinc-900">
                Most Popular
              </div>
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-[#7ec225]">Gold</h3>
              <p className="mt-3 text-3xl font-black">N$2000 <span className="text-base font-normal text-zinc-400">/mo</span></p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-zinc-300">
                {["All standard features", "Weekly video check-ins", "Meal planning adjustment", "24hr support response", "Form video analysis"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-[#7ec225]">✓</span> {item}
                    </li>
                  )
                )}
              </ul>
              <button className="mt-6 rounded-full bg-[#7ec225] py-2.5 text-sm font-bold uppercase tracking-widest text-zinc-900 transition hover:bg-[#6aaa1e]">
                Sign up
              </button>
            </article>

            {/* Platinum */}
            <article className="flex flex-col rounded-2xl border border-zinc-700 bg-zinc-900 p-7">
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">Platinum</h3>
              <p className="mt-3 text-3xl font-black">N$3000 <span className="text-base font-normal text-zinc-400">/mo</span></p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-zinc-300">
                <li>Everything in Gold plus:</li>
                <li>All standard features</li>
                <li>Weekly video check-ins</li>
                <li>Meal planning adjustment</li>
                <li>24hr support response</li>
                <li>Form video analysis</li>
              </ul>
              <button className="mt-6 rounded-full border border-zinc-600 py-2.5 text-sm font-bold uppercase tracking-widest transition hover:border-white hover:text-white">
                Sign up
              </button>
            </article>
          </div>
        </div>
      </section>

      {/* Workout programs */}
      <section id="programs" className="bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
            Workout Programs
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                weeks: "6 Weeks",
                title: "bEshaped Hypertrophy & strength training program",
                price: "N$799.00",
                img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
              },
              {
                weeks: "12 Weeks",
                title: "bEshaped Weight-loss program",
                price: "N$599.00",
                img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop",
              },
              {
                weeks: "12 Weeks",
                title: "bEshaped muscle building program",
                price: "N$499.00",
                img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600&auto=format&fit=crop",
              },
            ].map((program) => (
              <article key={program.title} className="overflow-hidden rounded-2xl border border-zinc-200">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={program.img}
                    alt={program.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-[#7ec225] px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
                    {program.weeks}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-black uppercase leading-snug tracking-wide text-zinc-900">
                    {program.title}
                  </h3>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xl font-black text-zinc-900">{program.price}</p>
                    <button className="rounded-full bg-zinc-900 px-5 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-zinc-700">
                      Buy now
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-zinc-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-black uppercase leading-tight tracking-tight md:text-5xl">
            Ready to start your transformation?
          </h2>
          <a
            href="#pricing"
            className="mt-10 inline-flex rounded-full bg-[#7ec225] px-12 py-4 text-sm font-bold uppercase tracking-widest text-zinc-900 transition hover:bg-[#6aaa1e]"
          >
            Apply for coaching now
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <nav className="flex gap-8 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">
            <a href="#programs" className="transition hover:text-white">Programs</a>
            <a href="#faq" className="transition hover:text-white">FAQs</a>
            <a href="#contact" className="transition hover:text-white">Contact</a>
          </nav>
          <p className="text-xs text-zinc-500">©2026 - bEshaped Fitness</p>
        </div>
      </footer>
    </div>
  );
}
