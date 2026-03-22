import { Space_Grotesk } from "next/font/google";
import type { IconType } from "react-icons";
import {
  TbBarbell,
  TbCheck,
  TbDeviceMobile,
  TbMessages,
  TbMicroscope,
  TbToolsKitchen2,
  TbTrendingUp,
} from "react-icons/tb";
import { Banner } from "./components/Banner";
import { MeetTheTrainer } from "./components/MeetTheTrainer";
import { Navbar } from "./components/Navbar";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
});

const memberFeatures: {
  id: string;
  Icon: IconType;
  title: string;
  desc: string;
}[] = [
  {
    id: "purpose",
    Icon: TbBarbell,
    title: "Move with purpose",
    desc: "Custom training program built specifically for your body and your schedule so every rep moves the needle.",
  },
  {
    id: "eat",
    Icon: TbToolsKitchen2,
    title: "Eat without guessing",
    desc: "Tailored meal planning with flexible dieting protocols for sustainable results.",
  },
  {
    id: "pocket",
    Icon: TbDeviceMobile,
    title: "Your journey in your pocket",
    desc: "Ditch the messy spreadsheets and PDFs. Access your entire transformation, from workouts to meal plans, in one seamless place so you can stay on track whether you're at home, in the gym, or traveling.",
  },
  {
    id: "proof",
    Icon: TbTrendingUp,
    title: "See the proof",
    desc: "Progress tracking on the metrics that actually matter. From strength gains to body composition, so you can watch your transformation happen in real-time.",
  },
  {
    id: "coach",
    Icon: TbMessages,
    title: "Direct coach access",
    desc: "Priority communication channel for real-time adjustments and psychological support.",
  },
  {
    id: "technique",
    Icon: TbMicroscope,
    title: "Perfect your technique",
    desc: 'Eliminate the "am I doing this right?" anxiety. Every exercise comes with HD video tutorials and step-by-step cues so you can lift with perfect technique, stay injury-free, and maximize your results.',
  },
];

const transformationImageUrls = [
  "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop",
] as const;

/** Four before/after cards; pairs reuse the same four source images until real pairs are added. */
const transformationPairs: [string, string][] = [
  [transformationImageUrls[0], transformationImageUrls[1]],
  [transformationImageUrls[2], transformationImageUrls[3]],
  [transformationImageUrls[0], transformationImageUrls[2]],
  [transformationImageUrls[1], transformationImageUrls[3]],
];

const silverFeatures = [
  "Custom Training Program",
  "Access to the members platform",
  "Bi-Weekly Check-ins",
  "App Access",
];

const goldTierFeatures = [
  "All Standard Features",
  "Weekly Video Check-ins",
  "Meal Planning Adjustment",
  "24hr Support Response",
  "Form Video Analysis",
];

export default function Home() {
  return (
    <div className={`${spaceGrotesk.className} w-full bg-white text-zinc-900`}>
      <Navbar />
      <Banner />

      {/* Meet your trainer */}
      <MeetTheTrainer />

      {/* How it works */}
      <section id="how-it-works" className="bg-white px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold uppercase tracking-[0.08em] text-[#0a1a32] md:text-3xl lg:text-[2rem] lg:leading-tight">
            How it works
          </h2>
          <div className="mt-12 grid gap-12 md:grid-cols-4 md:gap-10 lg:gap-14">
            {[
              {
                num: "01",
                label: "Register",
                desc: "Select and register for one of the coaching packages.",
              },
              {
                num: "02",
                label: "Profile setup",
                desc: "Your profile will be setup and you will have access to our members area.",
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
              <article key={step.num} className="text-left">
                <span className="block text-5xl font-black leading-none tracking-tight text-[#00a62c] md:text-6xl lg:text-7xl">
                  {step.num}
                </span>
                <h3 className="mt-5 text-sm font-bold uppercase tracking-wide text-zinc-900 md:text-[15px]">
                  {step.label}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#4A5568] md:text-[15px]">
                  {step.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* What you have as a member */}
      <section className="bg-white px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold uppercase tracking-[0.08em] text-zinc-900 md:text-3xl lg:text-[2rem] lg:leading-tight">
            What you have as a member
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-px border border-zinc-900 bg-zinc-900 sm:grid-cols-2 lg:grid-cols-3">
            {memberFeatures.map(({ id, Icon, title, desc }) => (
              <article key={id} className="bg-white p-8 text-left md:p-10">
                <Icon
                  className="h-9 w-9 shrink-0 text-[#00a62c] md:h-10 md:w-10"
                  strokeWidth={1.25}
                  aria-hidden
                />
                <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-zinc-900 md:text-[15px]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600 md:text-[15px] md:leading-relaxed">
                  {desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Our Transformations */}
      <section className="bg-white px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold uppercase tracking-[0.08em] text-[#0a1a32] md:text-3xl lg:text-[2rem] lg:leading-tight">
            Our transformations
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {transformationPairs.map(([beforeSrc, afterSrc], i) => (
              <article
                key={i}
                className="flex min-w-0 border border-black"
              >
                <img
                  src={beforeSrc}
                  alt={`Transformation ${i + 1}, before`}
                  className="h-52 w-1/2 min-w-0 object-cover sm:h-56 lg:h-64"
                />
                <img
                  src={afterSrc}
                  alt={`Transformation ${i + 1}, after`}
                  className="h-52 w-1/2 min-w-0 object-cover sm:h-56 lg:h-64"
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Become a member – pricing */}
      <section id="pricing" className="bg-white px-6 py-16 text-zinc-900 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold uppercase tracking-[0.08em] text-zinc-900 md:text-3xl lg:text-[2rem]">
            Become a member
          </h2>
          <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:items-stretch">
            {/* Silver */}
            <article className="flex h-full flex-col border border-black bg-white p-8 md:p-9">
              <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-900">Silver</h3>
              <p className="mt-4 text-3xl font-black tracking-tight text-zinc-900 md:text-4xl">
                N$1500{" "}
                <span className="text-base font-normal text-zinc-500 md:text-lg">/mo</span>
              </p>
              <ul className="mt-8 flex-1 space-y-4 text-sm text-zinc-900 md:text-[15px]">
                {silverFeatures.map((item) => (
                  <li key={item} className="flex gap-3">
                    <TbCheck
                      className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 text-zinc-400"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-10 w-full border border-black bg-transparent py-3.5 text-sm font-bold uppercase tracking-wider text-zinc-900 transition hover:bg-zinc-50"
              >
                Sign up
              </button>
            </article>

            {/* Gold – most popular */}
            <article className="relative flex h-full flex-col border-[3px] border-[#00a62c] bg-white p-8 md:p-9">
              <div className="absolute right-4 top-4 bg-[#00a62c] px-3 py-1.5 text-[10px] font-bold uppercase leading-none tracking-wider text-white md:text-xs">
                Most popular
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-900">Gold</h3>
              <p className="mt-4 text-3xl font-black tracking-tight text-zinc-900 md:text-4xl">
                N$2000{" "}
                <span className="text-base font-normal text-zinc-500 md:text-lg">/mo</span>
              </p>
              <p className="mt-6 text-sm font-bold text-zinc-900 md:text-[15px]">
                Everything in Silver plus:
              </p>
              <ul className="mt-4 flex-1 space-y-4 text-sm text-zinc-900 md:text-[15px]">
                {goldTierFeatures.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00a62c] text-white"
                      aria-hidden
                    >
                      <TbCheck className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-10 w-full bg-[#00a62c] py-3.5 text-sm font-bold uppercase tracking-wider text-white transition hover:opacity-90"
              >
                Sign up
              </button>
            </article>

            {/* Platinum */}
            <article className="flex h-full flex-col border border-black bg-white p-8 md:p-9">
              <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-900">Platinum</h3>
              <p className="mt-4 text-3xl font-black tracking-tight text-zinc-900 md:text-4xl">
                N$3000{" "}
                <span className="text-base font-normal text-zinc-500 md:text-lg">/mo</span>
              </p>
              <p className="mt-6 text-sm font-bold text-zinc-900 md:text-[15px]">
                Everything in Gold plus:
              </p>
              <ul className="mt-4 flex-1 space-y-4 text-sm text-zinc-900 md:text-[15px]">
                {goldTierFeatures.map((item) => (
                  <li key={`platinum-${item}`} className="flex gap-3">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00a62c] text-white"
                      aria-hidden
                    >
                      <TbCheck className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-10 w-full border border-black bg-transparent py-3.5 text-sm font-bold uppercase tracking-wider text-zinc-900 transition hover:bg-zinc-50"
              >
                Sign up
              </button>
            </article>
          </div>
        </div>
      </section>

      {/* Workout programs */}
      <section id="programs" className="bg-white px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold uppercase tracking-[0.08em] text-[#0a1a32] md:text-3xl lg:text-[2rem] lg:leading-tight">
            Workout programs
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3 md:items-stretch">
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
              <article
                key={program.title}
                className="flex h-full flex-col overflow-hidden border border-black bg-white"
              >
                <div className="relative aspect-[5/4] w-full shrink-0 overflow-hidden bg-zinc-100">
                  <img
                    src={program.img}
                    alt={program.title}
                    className="h-full w-full object-cover grayscale"
                  />
                  <span className="absolute left-0 top-0 bg-[#00a62c] px-3 py-1.5 text-[10px] font-bold uppercase leading-none tracking-wider text-white md:text-xs">
                    {program.weeks}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6 md:p-7">
                  <h3 className="text-sm font-bold uppercase leading-snug tracking-wide text-zinc-900 md:text-[15px]">
                    {program.title}
                  </h3>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-8">
                    <p className="text-xl font-black tracking-tight text-zinc-900 md:text-2xl">
                      {program.price}
                    </p>
                    <button
                      type="button"
                      className="bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-zinc-800"
                    >
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
      <section className="flex min-h-[min(70vh,520px)] flex-col items-center justify-center bg-black px-6 py-24 text-center text-white md:py-32">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-black uppercase leading-[1.12] tracking-tight text-white md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            <span className="block">Ready to start your</span>
            <span className="mt-2 block md:mt-3">Transformation?</span>
          </h2>
          <a
            href="#pricing"
            className="mt-12 inline-block rounded-none bg-white px-10 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-zinc-200 md:mt-14 md:px-14 md:py-5 md:text-sm"
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
