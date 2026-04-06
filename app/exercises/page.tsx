"use client";

import { collection, getDocs } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { ExerciseCard } from "../components/ExerciseCard";
import type { ExerciseCardProps } from "../components/ExerciseCard";
import { ProtectedNavbar } from "../components/ProtectedNavbar";
import { db } from "../../lib/firebase";

const categories = [
  "All",
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Core",
  "Quadriceps",
  "Hamstrings",
  "Glutes",
  "Calves",
];

type ExerciseListItem = ExerciseCardProps;

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<ExerciseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const snapshot = await getDocs(collection(db, "exercises"));
        const mappedExercises: ExerciseListItem[] = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data() as {
            name?: string;
            primaryMuscles?: string | string[];
            secondaryMuscles?: string | string[];
          };

          const readPrimaryMuscle = (value: string | string[] | undefined) => {
            if (Array.isArray(value) && value.length > 0) {
              return value[0] ?? "N/A";
            }
            if (typeof value === "string" && value.trim().length > 0) {
              return value;
            }
            return "N/A";
          };

          const readSecondaryMuscles = (value: string | string[] | undefined) => {
            if (Array.isArray(value)) {
              const filtered = value
                .filter((muscle) => typeof muscle === "string")
                .map((muscle) => muscle.trim())
                .filter((muscle) => muscle.length > 0);
              return filtered.length > 0 ? filtered : ["N/A"];
            }
            if (typeof value === "string" && value.trim().length > 0) {
              return [value];
            }
            return ["N/A"];
          };

          return {
            id: docSnapshot.id,
            name: data.name?.trim() ? data.name : docSnapshot.id,
            primaryMuscles: readPrimaryMuscle(data.primaryMuscles),
            secondaryMuscles: readSecondaryMuscles(data.secondaryMuscles),
          };
        });

        setExercises(mappedExercises);
      } catch {
        setErrorMessage("We couldn't load exercises right now. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchExercises();
  }, []);

  const filteredExercises = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return exercises.filter((exercise) => {
      const searchableText =
        `${exercise.name} ${exercise.primaryMuscles} ${exercise.secondaryMuscles.join(" ")}`.toLowerCase();

      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
      const matchesCategory =
        selectedCategory === "All" ||
        exercise.primaryMuscles.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [exercises, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-stone-100">
        <ProtectedNavbar />
        <main className="px-6 py-10 ">
          <div className="mx-auto max-w-7xl space-y-8">
            <section className="rounded-2xl border border-stone-200 bg-gradient-to-r from-stone-50 to-emerald-50 p-8 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Exercise Library
              </p>
              <h1 className="mt-3 text-3xl font-bold text-zinc-900 md:text-4xl">
                Build your training sessions faster
              </h1>
              <p className="mt-3 max-w-2xl text-zinc-600">
                Browse exercises by focus and difficulty, then open any exercise
                for details, cues, and progression guidance.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-lg border border-stone-200 bg-white px-4 py-2">
                  <p className="text-xs text-zinc-500">Total Exercises</p>
                  <p className="text-lg font-bold text-zinc-900">{exercises.length}</p>
                </div>
                {/* <div className="rounded-lg border border-stone-200 bg-white px-4 py-2">
                  <p className="text-xs text-zinc-500">Most Popular Focus</p>
                  <p className="text-lg font-bold text-zinc-900">Strength</p>
                </div>
                <div className="rounded-lg border border-stone-200 bg-white px-4 py-2">
                  <p className="text-xs text-zinc-500">Quick Sessions</p>
                  <p className="text-lg font-bold text-zinc-900">8-20 min</p>
                </div> */}
              </div>
            </section>

            <section className="rounded-2xl border border-stone-200 bg-stone-50 p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                        category === selectedCategory
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
              {isLoading ? (
                <p className="rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-zinc-600">
                  Loading exercises...
                </p>
              ) : null}
              {!isLoading && errorMessage ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </p>
              ) : null}
              {!isLoading && !errorMessage && filteredExercises.length === 0 ? (
                <p className="rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-zinc-600">
                  No exercises match your current filters.
                </p>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredExercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    id={exercise.id}
                    name={exercise.name}
                    primaryMuscles={exercise.primaryMuscles}
                    secondaryMuscles={exercise.secondaryMuscles}
                  />
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
  );
}
