import Link from "next/link";
import { AuthGuard } from "../../components/AuthGuard";

type ProgramDetailPageProps = {
  params: Promise<{
    programId: string;
  }>;
};

const titleFromSlug = (slug: string | undefined) =>
  (slug ?? "program")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const { programId } = await params;
  const programTitle = titleFromSlug(programId);

  return (
    <AuthGuard>
      <main className="min-h-screen bg-stone-100 px-6 py-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-stone-200 bg-stone-50 p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-zinc-900">{programTitle}</h1>
          <p className="mt-4 text-zinc-600">
            This is the detailed program page for <span className="font-semibold">{programTitle}</span>.
            You can add weekly schedules, nutrition goals, and milestones here.
          </p>

          <div className="mt-8 flex gap-3">
            <Link
              href="/programs"
              className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-stone-100"
            >
              Back to Programs
            </Link>
            <Link
              href="/exercises"
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              Browse Exercises
            </Link>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
