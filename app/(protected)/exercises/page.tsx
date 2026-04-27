"use client";

import { Suspense, useMemo, useState } from "react";
import { Categories } from "@/features/exercises/constants/exerciseConstants";
import { getAllExercises } from "@/features/exercises/api/getExercises";
import { ExerciseStats } from "@/features/exercises/components/ExerciseStats";
import { ExerciseList } from "@/features/exercises/components/ExerciseList";
import { ErrorBoundary } from "react-error-boundary";
import { ListErrorFallback } from "@/components/ListErrorFallback";


export default function ExercisesPage() {
  const [selectedCategory, setSelectedCategory] = useState<Categories>(Categories.All);
  const [searchTerm, setSearchTerm] = useState("");


  const exercisesPromise = getAllExercises();


  const filteredPromise = useMemo(() => {
    return (async () => {

      const allExercises = await exercisesPromise;
      const normalizedSearch = searchTerm.toLowerCase().trim();

      return allExercises.filter((ex) => {
        const matchesSearch = !normalizedSearch ||
          `${ex.name} ${ex.primaryMuscles}`.toLowerCase().includes(normalizedSearch);
        const matchesCategory = selectedCategory === Categories.All ||
          (ex.primaryMuscles?.toString() ?? "N/A").toLowerCase() === selectedCategory.toLowerCase();

        return matchesSearch && matchesCategory;
      }
      )
    })();
  }, [exercisesPromise, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-stone-100">
      <main className="px-6 py-10 ">
        <div className="mx-auto max-w-7xl space-y-8">
          <section className="rounded-2xl border border-stone-200 bg-gradient-to-r from-stone-50 to-emerald-50 p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-zinc-900 md:text-4xl">
              Exercise Library
            </h1>
            <p className="mt-3 max-w-2xl text-zinc-600">
              Browse exercises by focus and difficulty, then open any exercise
              for details, cues, and progression guidance.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Suspense fallback={<p>Loading...</p>}>
                <ExerciseStats promise={exercisesPromise} />
              </Suspense>
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-stone-50 p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                {Object.values(Categories).map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${category === selectedCategory
                      ? "bg-beshaped-dark-green text-white"
                      : "bg-white text-zinc-700 hover:bg-stone-100"
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 md:max-w-xs"
              />
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-zinc-900">Exercise List</h2>
            <ErrorBoundary FallbackComponent={ListErrorFallback}>
              <Suspense fallback={<p>Loading exercises...</p>}>
                <ExerciseList exercisesPromise={filteredPromise} />
              </Suspense>
            </ErrorBoundary>
          </section>
        </div>
      </main>
    </div>
  );
}
