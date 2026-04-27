

import { getProgramById } from "@/features/programs/api/getPrograms";
import { ProgramHeader } from "@/features/programs/components/ProgramHeader";
import { ProgramWorkoutViewer } from "@/features/programs/components/ProgramWorkoutViewer";


interface ProgramDetailPageProps {
  params: Promise<{ programId: string }>;
}


export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const { programId } = await params;
  const program = await getProgramById(programId);

  return (
    <div className="min-h-screen bg-stone-100">
      <main className="px-6 py-2">
        <div className="mx-auto max-w-7xl space-y-4">
          <ProgramHeader name={program.name} description={program.description} />
          <ProgramWorkoutViewer program={program} />
        </div>
      </main>
    </div>
  );
}
