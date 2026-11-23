"use client";

import { FiCheck, FiInfo } from "react-icons/fi";
import {
  getExerciseMuscleLabels,
  lookupPreviousSet,
  type PreviousSetEntry,
  type SetLog,
  type WorkoutExercise,
} from "../utils/workout-exercises";

type WorkoutExerciseCardProps = {
  exercise: WorkoutExercise;
  /** The exercise's rows of the set table. */
  rows: SetLog[];
  previousSets: PreviousSetEntry[] | undefined;
  /** False before Start and on a finished workout that isn't being edited. */
  editable: boolean;
  onChangeField: (setIndex: number, field: "weight" | "reps", value: string) => void;
  onToggleDone: (setIndex: number, previousSet: PreviousSetEntry | null) => void;
  /** Opens the exercise's details; absent when the exercise isn't in the library. */
  onShowInfo?: () => void;
};

const headerCell = "px-2 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500";
const input =
  "h-11 w-full min-w-0 rounded-lg border border-stone-300 bg-white px-2 text-center text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-beshaped-green focus:ring-2 focus:ring-beshaped-green/20 disabled:bg-stone-100 disabled:text-zinc-500";

/** One exercise of the workout: its targets and the table of sets (previous, weight, reps, done). */
export function WorkoutExerciseCard({
  exercise,
  rows,
  previousSets,
  editable,
  onChangeField,
  onToggleDone,
  onShowInfo,
}: WorkoutExerciseCardProps) {
  const name = exercise.exerciseName;

  return (
    <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 bg-stone-50 px-4 py-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {getExerciseMuscleLabels(exercise).map((muscle) => (
            <span
              key={muscle}
              className="rounded-full bg-beshaped-green px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white"
            >
              {muscle}
            </span>
          ))}
          <span className="text-sm text-zinc-600">
            Reps: {exercise.targetReps} · Sets: {exercise.targetSets}
          </span>
        </div>
        {onShowInfo && (
          <button
            type="button"
            onClick={onShowInfo}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-white text-zinc-600 transition hover:bg-stone-100"
            aria-label={`More information about ${name}`}
          >
            <FiInfo className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-3 p-4">
        <h3 className="text-lg font-semibold text-zinc-900">{name}</h3>
        {typeof exercise.notes === "string" && exercise.notes.trim() && (
          <p className="text-sm text-zinc-600">{exercise.notes}</p>
        )}

        <div role="table" aria-label={`Sets for ${name}`} className="rounded-xl border border-stone-200">
          <div role="row" className="grid grid-cols-[1.1fr_1fr_1fr_3rem] items-center bg-stone-50">
            <span role="columnheader" className={headerCell}>
              Previous
            </span>
            <span role="columnheader" className={`${headerCell} text-center`}>
              Weight
            </span>
            <span role="columnheader" className={`${headerCell} text-center`}>
              Reps
            </span>
            <span role="columnheader" className={`${headerCell} text-center`}>
              Done
            </span>
          </div>

          {rows.map((row, setIndex) => {
            const previousSet = lookupPreviousSet(previousSets, setIndex);
            return (
              <div
                key={setIndex}
                role="row"
                className={`grid grid-cols-[1.1fr_1fr_1fr_3rem] items-center gap-2 border-t border-stone-200 px-2 py-2 ${
                  setIndex % 2 === 1 ? "bg-stone-50" : ""
                }`}
              >
                <span role="cell" className="text-sm tabular-nums text-zinc-600">
                  {previousSet ? `${previousSet.weight} x ${previousSet.reps}` : "—"}
                </span>
                <span role="cell">
                  <input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className={input}
                    value={row.weight}
                    placeholder={previousSet ? String(previousSet.weight) : "-"}
                    disabled={!editable}
                    onChange={(event) => onChangeField(setIndex, "weight", event.target.value)}
                    aria-label={`${name}, set ${setIndex + 1}, weight in kg`}
                  />
                </span>
                <span role="cell">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    className={input}
                    value={row.reps}
                    placeholder={previousSet ? String(previousSet.reps) : exercise.targetReps}
                    disabled={!editable}
                    onChange={(event) => onChangeField(setIndex, "reps", event.target.value)}
                    aria-label={`${name}, set ${setIndex + 1}, reps`}
                  />
                </span>
                <span role="cell" className="flex justify-center">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={row.done}
                    aria-label={`${name}, set ${setIndex + 1} done`}
                    disabled={!editable}
                    onClick={() => onToggleDone(setIndex, previousSet)}
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-lg border-2 transition disabled:opacity-60 ${
                      row.done
                        ? "border-beshaped-dark-green bg-beshaped-dark-green text-white"
                        : "border-stone-300 bg-white text-transparent"
                    }`}
                  >
                    <FiCheck className="h-5 w-5" />
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}
