import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { ProtectedNavbar } from "../../components/ProtectedNavbar";
import { db } from "../../../lib/firebase";
import { resolveGifUrl } from "../../../lib/exercise-utils";
import { fetchDocument } from "@/lib/fetchDocument";
import { fetchExercise } from "@/lib/exercises";
import { notFound } from "next/navigation";
import Image from "next/image";

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

const getYoutubeEmbedUrl = (url: string): string => {
  try {
    // youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
    // youtu.be/VIDEO_ID
    const shortMatch = url.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    return "";
  } catch {
    return "";
  }
};

export default async function ExerciseDetailPage({ params }: ExerciseDetailPageProps) {
  const { exerciseId } = await params;

  const exercise = await fetchExercise(exerciseId);
  console.log(exercise);
  if (!exercise) {
    notFound();
  }

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

          <div className="flex-1 min-w-0">

            <h1 className="text-3xl font-bold text-zinc-900">{exercise.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Video Section */}
              {exercise.videoUrl && <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl border border-stone-200">
                <iframe
                  src={getYoutubeEmbedUrl(exercise.videoUrl)}
                  title="Exercise video tutorial"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
              }

              {/* Details Section */}
              <div className="flex flex-col gap-4 w-full">
                {exercise.description && <div>
                  <h2 className="text-xl font-semibold mb-2 text-black">Description</h2>
                  <p className="text-gray-700">{exercise.description}</p>
                </div>}

                <div className="text-black">
                  <span className="font-semibold text-black">Equipment Needed</span>
                  <p className="text-gray-700">{exercise.equipment}</p>
                </div>


                <div>
                  <h3 className="font-semibold mb-2 text-black">Muscle Group</h3>
                  <span className="bg-black text-white px-3 py-1 rounded-full text-sm">{exercise.muscleGroup}</span>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-black">Primary Muscles</h3>
                  <div className="flex flex-wrap gap-2">
                    {exercise.primaryMuscles.map((muscle) => (
                      <span
                        key={muscle}
                        className="bg-beshaped-green/80 text-white px-3 py-1 rounded-full text-sm"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>

                {exercise.secondaryMuscles.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-black">Secondary Muscles</h3>
                    <div className="flex flex-wrap gap-2">
                      {exercise.secondaryMuscles.map((muscle) => (
                        <span
                          key={muscle}
                          className="border-beshaped-green border-2 text-black px-3 py-1 rounded-full text-sm"
                        >
                          {muscle}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions Section */}
            <div className="mt-8 space-y-4">
              <h2 className="text-2xl font-bold text-black">Instructions</h2>

              <div>
                <h3 className="font-semibold text-lg mb-2 text-black">Setup</h3>
                <p className="text-gray-700">{exercise.instructions.setup}</p>
              </div>

              {exercise.instructions.posture && (
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-black">Posture</h3>
                  <p className="text-gray-700">{exercise.instructions.posture}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-lg mb-2 text-black">Execution</h3>
                <p className="text-gray-700">{exercise.instructions.execution}</p>
              </div>

              {exercise.instructions.breathing && (
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-black">Breathing</h3>
                  <p className="text-gray-700">{exercise.instructions.breathing}</p>
                </div>
              )}

              {exercise.instructions.control && (
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-black">Control</h3>
                  <p className="text-gray-700">{exercise.instructions.control}</p>
                </div>
              )}
            </div>

            {/* Tips Section */}
            {exercise.tips.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4 text-black">Tips</h2>
                <ul className="list-disc list-inside space-y-2">
                  {exercise.tips.map((tip, index) => (
                    <li key={index} className="text-gray-700">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Anatomical Illustrations */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {exercise.anatomicalIllustration && (
                <div>
                  <h3 className="font-semibold mb-2 text-black">Anatomical Illustration</h3>
                  <Image
                    src={exercise.anatomicalIllustration}
                    alt="Anatomical illustration"
                    className="w-full rounded-lg"
                    width={500}
                    height={500}
                  />
                </div>
              )}
              {exercise.anatomyExerciseWalkthrough && (
                <div>
                  <h3 className="font-semibold mb-2 text-black">Exercise Walkthrough</h3>
                  <Image
                    src={exercise.anatomyExerciseWalkthrough}
                    alt="Exercise walkthrough"
                    className="w-full rounded-lg"
                    width={500}
                    height={500}
                  />
                </div>
              )}
            </div>




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

          </div>
        </div>
      </main>
    </div>
  );
}
