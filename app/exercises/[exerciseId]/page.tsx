import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { ProtectedNavbar } from "../../components/ProtectedNavbar";
import { db } from "../../../lib/firebase";

type ExerciseDetailPageProps = {
  params: Promise<{
    exerciseId: string;
  }>;
};

const readPrimaryMuscle = (value: string | string[] | undefined) => {
  if (Array.isArray(value) && value.length > 0) return value[0] ?? "N/A";
  if (typeof value === "string" && value.trim().length > 0) return value;
  return "N/A";
};

const readSecondaryMuscles = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    const filtered = value
      .filter((muscle) => typeof muscle === "string")
      .map((muscle) => String(muscle).trim())
      .filter((muscle) => muscle.length > 0);
    return filtered.length > 0 ? filtered : ["N/A"];
  }
  if (typeof value === "string" && value.trim().length > 0) return [value];
  return ["N/A"];
};

export default async function ExerciseDetailPage({ params }: ExerciseDetailPageProps) {
  const { exerciseId } = await params;

  const docRef = doc(db, "exercises", exerciseId);
  const docSnap = await getDoc(docRef);

  const name = docSnap.exists()
    ? (docSnap.data().name?.trim() ? docSnap.data().name : exerciseId)
    : exerciseId;
  const primaryMuscles = docSnap.exists()
    ? readPrimaryMuscle(docSnap.data().primaryMuscles)
    : "N/A";
  const secondaryMuscles = docSnap.exists()
    ? readSecondaryMuscles(docSnap.data().secondaryMuscles)
    : ["N/A"];

  return (
    <div className="min-h-screen bg-stone-100">
        <ProtectedNavbar />
        <main className="px-6 py-10">
          <div className="mx-auto max-w-4xl rounded-2xl border border-stone-200 bg-stone-50 p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-zinc-900">{name}</h1>

            <div className="mt-4 flex flex-col gap-1">
              <p className="text-zinc-600">
                <span className="font-medium">Primary muscle:</span> {primaryMuscles}
              </p>
              <p className="text-zinc-600">
                <span className="font-medium">Secondary muscles:</span>{" "}
                {secondaryMuscles.join(", ")}
              </p>
            </div>

            <p className="mt-4 text-zinc-600">
              Add form tips, reps, sets, and progression rules here.
            </p>

            <div className="mt-8 flex gap-3">
              <Link
                href="/exercises"
                className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-stone-100"
              >
                Back to Exercises
              </Link>
              <Link
                href="/programs"
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                View Programs
              </Link>
            </div>
          </div>
        </main>
      </div>
  );
}
