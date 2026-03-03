import Link from "next/link";

export type ExerciseCardProps = {
  id: string;
  name: string;
  primaryMuscles: string;
  secondaryMuscles: string[];
};

export const ExerciseCard = ({
  id,
  name,
  primaryMuscles,
  secondaryMuscles,
}: ExerciseCardProps) => {
  return (
    <article className="group rounded-xl border border-stone-200 bg-stone-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-zinc-900">{name}</h3>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-start gap-2">
        <span className="rounded-md bg-white px-3 py-1 text-xs text-zinc-700">
          Primary: {primaryMuscles}
        </span>
        <span className="rounded-md bg-white px-3 py-1 text-xs text-zinc-700">
          Secondary: {secondaryMuscles.join(", ")}
        </span>
      </div>

      <Link
        href={`/exercises/${id}`}
        className="mt-5 inline-flex items-center rounded-md bg-beshaped-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
      >
        View Exercise
      </Link>
    </article>
  );
};
