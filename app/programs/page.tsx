import Link from "next/link";
import { AuthGuard } from "../components/AuthGuard";
import { ProtectedNavbar } from "../components/ProtectedNavbar";

const programs = [
  {
    id: "strength-foundation",
    name: "Strength Foundation",
    description: "Build core strength with structured weekly sessions.",
  },
  {
    id: "lean-tone",
    name: "Lean & Tone",
    description: "Improve body composition with smart training blocks.",
  },
  {
    id: "performance-boost",
    name: "Performance Boost",
    description: "Increase power, conditioning, and movement quality.",
  },
];

export default function ProgramsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-stone-100">
        <ProtectedNavbar />
        <main className="px-6 py-10">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex items-center justify-between gap-4">
              <h1 className="text-3xl font-bold text-zinc-900">Programs</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {programs.map((program) => (
                <article key={program.id} className="rounded-xl border border-stone-200 bg-stone-50 p-5 shadow-sm">
                  <h2 className="text-xl font-semibold text-zinc-900">{program.name}</h2>
                  <p className="mt-2 text-zinc-600">{program.description}</p>
                  <Link
                    href={`/programs/${program.id}`}
                    className="mt-4 inline-block rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                  >
                    View Program
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
