import { notFound } from "next/navigation";
import { requireAuth } from "@/features/auth/api/getServerAuth";
import { getProgramForUser } from "@/features/programs/api/getPrograms";
import { ProgramHeader } from "@/features/programs/components/ProgramHeader";
import { ProgramWorkout } from "@/features/workouts/components/ProgramWorkout";

interface ProgramDetailPageProps {
  params: Promise<{ programId: string }>;
}

export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const { uid } = await requireAuth();
  const { programId } = await params;
  // Null for a missing program and for one the member isn't entitled to: both are a 404.
  const program = await getProgramForUser(programId, uid);

  if (!program) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <main className="px-4 py-2 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-4 pb-16">
          <ProgramHeader name={program.name} description={program.description} />
          <ProgramWorkout key={program.id} program={program} />
        </div>
      </main>
    </div>
  );
}
