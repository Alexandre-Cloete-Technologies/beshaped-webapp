"use client";

import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "../components/AuthGuard";
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
    <AuthGuard>
      <div className="min-h-screen bg-stone-100">
        <ProtectedNavbar />
        <main className="px-6 py-10">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex items-center justify-between gap-4">
              <h1 className="text-3xl font-bold text-zinc-900">Programs</h1>
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
