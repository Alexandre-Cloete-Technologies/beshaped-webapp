
import { getAllPrograms } from "@/features/programs/api/getPrograms";
import { ListErrorFallback } from "@/components/ListErrorFallback";
import ProgramsList from "@/features/programs/components/ProgramsList";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export default function ProgramsPage() {
  const programsPromise = getAllPrograms();


  return (
    <div className="min-h-screen bg-stone-100">
      <main className="px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold text-zinc-900">Programs</h1>
          </div>

          <ErrorBoundary FallbackComponent={ListErrorFallback}>
            <Suspense fallback={<div className="text-2xl text-black">Loading...</div>}>
              <ProgramsList programsPromise={programsPromise} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
