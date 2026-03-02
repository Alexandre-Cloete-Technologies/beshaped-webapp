import Link from "next/link";
import { AuthGuard } from "../components/AuthGuard";

const exercises = [
  { id: "push-up", name: "Push-up", focus: "Upper body strength" },
  { id: "squat", name: "Squat", focus: "Lower body strength" },
  { id: "plank", name: "Plank", focus: "Core stability" },
  { id: "deadlift", name: "Deadlift", focus: "Posterior chain power" },
];

export default function ExercisesPage() {
  return (
    <AuthGuard>
      <main className="min-h-screen bg-stone-100 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-zinc-900">Exercises</h1>
            <Link href="/dashboard" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Back to dashboard
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {exercises.map((exercise) => (
              <article key={exercise.id} className="rounded-xl border border-stone-200 bg-stone-50 p-5 shadow-sm">
                <h2 className="text-xl font-semibold text-zinc-900">{exercise.name}</h2>
                <p className="mt-2 text-zinc-600">{exercise.focus}</p>
                <Link
                  href={`/exercises/${exercise.id}`}
                  className="mt-4 inline-block rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  View Exercise
                </Link>
              </article>
            ))}
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
