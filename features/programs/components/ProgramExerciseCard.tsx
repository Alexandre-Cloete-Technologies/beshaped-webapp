import { ProgramExercise } from "@/features/programs/types/programTypes";
import Link from "next/link";
import { FiInfo } from "react-icons/fi";



interface ProgramExerciseCardProps {
  exercise: ProgramExercise;
  onViewExerciseDetails: (exerciseId: string) => void;
};

export const ProgramExerciseCard = ({
  exercise,
  onViewExerciseDetails,
}: ProgramExerciseCardProps) => {
  return (
    <article className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-beshaped-green px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white">
            {exercise.musclesInvolved}
          </span>

        </div>
        <button
          type="button"
          onClick={() => onViewExerciseDetails(exercise.exerciseId)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-zinc-600 transition hover:bg-stone-100"
          aria-label={`More information about ${exercise.exerciseName}`}
        >
          <FiInfo className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3 p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900">{exercise.exerciseName}</h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              {exercise.notes || "View the planned sets and reps below for this exercise."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                Target reps
              </p>
              <p className="mt-2 text-lg font-semibold text-zinc-900">{exercise.repsRange}</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                Target sets
              </p>
              <p className="mt-2 text-lg font-semibold text-zinc-900">{exercise.sets}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/exercises/${exercise.exerciseId}`}
            className="inline-flex items-center rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-stone-100"
          >
            Open Exercise
          </Link>
          <button
            type="button"
            onClick={() => onViewExerciseDetails(exercise.exerciseId)}
            className="inline-flex items-center rounded-md bg-beshaped-green px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            View Details
          </button>
        </div>

        <div className="rounded-2xl border border-stone-200">
          <div className="grid grid-cols-2 bg-stone-50 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <div className="border-b border-stone-200 px-4 py-3">Sets</div>
            <div className="border-b border-l border-stone-200 px-4 py-3">Reps</div>
          </div>

          {Array.from({ length: exercise.sets }).map((_, setIndex) => (
            <div
              key={`${exercise.exerciseId}-set-${setIndex}`}
              className="grid grid-cols-2 text-sm"
            >
              <div className="border-b border-stone-200 px-4 py-3 text-zinc-700">
                Set {setIndex + 1}
              </div>
              <div className="border-b border-l border-stone-200 px-4 py-3 text-zinc-700">
                {exercise.repsRange}
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
};
