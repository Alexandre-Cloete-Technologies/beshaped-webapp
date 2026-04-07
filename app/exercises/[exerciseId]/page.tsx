import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { ProtectedNavbar } from "../../components/ProtectedNavbar";
import { db } from "../../../lib/firebase";
import { resolveGifUrl } from "../../../lib/exercise-utils";

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

const readYoutubeUrl = (data: Record<string, unknown> | undefined) => {
  if (!data || typeof data !== "object") return null;
  const url =
    data.videoUrl ?? data.youtubeUrl ?? data.youtubeLink ?? data.video ?? data.youtube;
  if (typeof url === "string" && url.trim().length > 0) return url.trim();
  return null;
};

const getYoutubeEmbedUrl = (url: string): string | null => {
  try {
    // youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
    // youtu.be/VIDEO_ID
    const shortMatch = url.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    return null;
  } catch {
    return null;
  }
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
  const youtubeUrl = docSnap.exists()
    ? readYoutubeUrl(docSnap.data() as Record<string, unknown>)
    : null;
  const embedUrl = youtubeUrl ? getYoutubeEmbedUrl(youtubeUrl) : null;
  const anatomyGifUrl = docSnap.exists()
    ? await resolveGifUrl(docSnap.data().anatomyExerciseWalkthrough)
    : null;

  return (
    <div className="min-h-screen bg-stone-100">
        <ProtectedNavbar />
        <main className="px-6 py-10">
          <div className="mx-auto max-w-4xl rounded-2xl border border-stone-200 bg-stone-50 p-8 shadow-sm">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-8">
              <div className="flex-1 min-w-0">
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
                className="rounded-md bg-beshaped-dark-green px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                View Programs
              </Link>
            </div>

            {embedUrl ? (
              <div className="mt-8 border-t border-stone-200 pt-8">
                <h2 className="text-lg font-semibold text-zinc-900">Video tutorial</h2>
                <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl border border-stone-200">
                  <iframe
                    src={embedUrl}
                    title="Exercise video tutorial"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              </div>
            ) : null}
              </div>

              {anatomyGifUrl ? (
                <div className="shrink-0">
                  <img
                    src={anatomyGifUrl}
                    alt="Exercise demonstration"
                    className="rounded-xl border border-stone-200 object-cover max-w-[280px] w-full"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </main>
      </div>
  );
}
