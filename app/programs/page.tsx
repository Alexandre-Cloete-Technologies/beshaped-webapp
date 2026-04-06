"use client";

import { collection, getDocs } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import { ProtectedNavbar } from "../components/ProtectedNavbar";
import { db } from "../../lib/firebase";

type ProgramListItem = {
  id: string;
  name: string;
  description: string;
};

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ProgramListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPrograms = useMemo(() => {
    if (!searchQuery.trim()) return programs;
    const query = searchQuery.trim().toLowerCase();
    return programs.filter(
      (program) =>
        program.name.toLowerCase().includes(query) ||
        program.description.toLowerCase().includes(query)
    );
  }, [programs, searchQuery]);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const snapshot = await getDocs(collection(db, "programs"));
        const mappedPrograms: ProgramListItem[] = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data() as {
            name?: string;
            description?: string;
          };

          return {
            id: docSnapshot.id,
            name: data.name?.trim() ? data.name : docSnapshot.id,
            description:
              data.description?.trim() ??
              "Program details will be available soon.",
          };
        });

        setPrograms(mappedPrograms);
      } catch {
        setErrorMessage("We couldn't load programs right now. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPrograms();
  }, []);

  return (
    <div className="min-h-screen bg-stone-100">
        <ProtectedNavbar />
        <main className="px-6 py-10">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-bold text-zinc-900">Programs</h1>
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search programs..."
                  className="w-full min-w-64 rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-beshaped-green focus:outline-none focus:ring-2 focus:ring-beshaped-green/20 sm:w-72"
                  aria-label="Search programs"
                />
              </div>
            </div>

            {isLoading ? (
              <p className="mb-4 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-zinc-600">
                Loading programs...
              </p>
            ) : null}
            {!isLoading && errorMessage ? (
              <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </p>
            ) : null}

            {filteredPrograms.length === 0 && !isLoading ? (
              <p className="rounded-xl border border-stone-200 bg-white px-4 py-8 text-center text-zinc-600">
                {searchQuery.trim()
                  ? "No programs match your search."
                  : "No programs available yet."}
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredPrograms.map((program) => (
                  <article key={program.id} className="rounded-xl border border-stone-200 bg-stone-50 p-5 shadow-sm">
                    <h2 className="text-xl font-semibold text-zinc-900">{program.name}</h2>
                    <p className="mt-2 text-zinc-600">{program.description}</p>
                    <Link
                      href={`/programs/${program.id}`}
                      className="mt-4 inline-block rounded-md bg-beshaped-dark-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-beshaped-green"
                    >
                      View Program
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
  );
}
