import { Banner } from "./components/Banner";
import { BecomeMember } from "./components/BecomeMember";
import { MeetTheTrainer } from "./components/MeetTheTrainer";
import { Testimonials } from "./components/Testimonials";

const featureCards = [
  "Personalized Plan",
  "Nutrition Guidance",
  "Weekly Check-ins",
  "Progress Tracking",
];

const programs = [
  {
    title: "Strength Foundation",
    description: "Build strength and improve movement quality.",
  },
  {
    title: "Lean & Tone",
    description: "Lose fat while maintaining muscle and energy.",
  },
  {
    title: "Performance Boost",
    description: "Increase endurance, speed, and confidence.",
  },
  {
    title: "Lifestyle Reset",
    description: "Create simple, sustainable fitness habits.",
  },
];

const PersonIcon = () => {
  return (
    <div className="mb-4 flex size-24 items-center justify-center rounded-full border-2 border-white">
      <div className="size-10 rounded-full border-2 border-white" />
    </div>
  );
};

export default function Home() {
  return (
    <div className="h-full w-full">
      <Banner />
      <BecomeMember />

      <section className="bg-zinc-900 px-6 py-16 text-center text-white md:py-24">
        <h2 className="text-4xl font-bold">WHAT YOU GET</h2>
        <div className="mx-auto mt-10 grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((item) => (
            <article key={item} className="flex flex-col items-center">
              <PersonIcon />
              <h3 className="text-xl font-bold">{item}</h3>
              <p className="mt-2 text-zinc-300">Get a plan that works for you</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white px-6 py-16 md:py-24">
        <h2 className="text-center text-4xl font-bold text-green-600">The Programs</h2>
        <p className="mt-2 text-center text-lg font-light text-zinc-700">
          Choose from a variety of programs
        </p>
        <div className="mx-auto mt-10 grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {programs.map((program) => (
            <article key={program.title} className="text-center text-zinc-900">
              <img
                className="h-56 w-full rounded-lg object-cover"
                src="https://images.unsplash.com/photo-1532635246-4b1f7a2f8d2e?q=80&w=1500&auto=format&fit=max"
                alt={program.title}
              />
              <h3 className="mt-4 text-xl font-bold">{program.title}</h3>
              <p className="mt-1 text-zinc-600">{program.description}</p>
            </article>
          ))}
        </div>
      </section>

      <Testimonials />
      <MeetTheTrainer />
    </div>
  );
}
