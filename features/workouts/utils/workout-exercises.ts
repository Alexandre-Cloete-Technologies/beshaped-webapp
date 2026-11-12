/**
 * The exercises of one program day as the workout page uses them, and the workoutLogs / exerciseHistory
 * payloads built from them. Ported from the mobile program screen (`fitness/app/(tabs)/program/[id].tsx`);
 * keep the two in step.
 */
import type { RawProgramExercise } from "./program-days";
import { getSetsPerMuscleGroup } from "./sets-per-muscle";

/** One row of the set table while it is being edited (text inputs, so strings). */
export interface SetLog {
  weight: string;
  reps: string;
  done: boolean;
}

export type WorkoutExercise = RawProgramExercise & {
  exerciseName: string;
  targetSets: number;
  targetReps: string;
  musclesInvolved: string[];
  muscleGroup: string;
};

export type PreviousSetEntry = { setNumber: number; weight: number; reps: number };

function normalizeMusclesInvolved(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

/** Program exercises with the fields the set table needs (`sets` → `targetSets`, `repsRange` → `targetReps`). */
export function toWorkoutExercises(exercises: RawProgramExercise[]): WorkoutExercise[] {
  return exercises.map((ex) => {
    const musclesInvolved = normalizeMusclesInvolved(ex.musclesInvolved);
    const rawGroup = typeof ex.muscleGroup === "string" ? ex.muscleGroup.trim() : "";
    const targetSets = Number.parseInt(String(ex.sets ?? ""), 10);
    return {
      ...ex,
      exerciseName: typeof ex.exerciseName === "string" ? ex.exerciseName : "Exercise",
      targetSets: Number.isFinite(targetSets) && targetSets > 0 ? targetSets : 3,
      targetReps: ex.repsRange != null && String(ex.repsRange).trim() ? String(ex.repsRange) : "8-12",
      musclesInvolved,
      muscleGroup: rawGroup || musclesInvolved[0] || "General",
    };
  });
}

/** One label per muscle for the card pills; falls back to muscleGroup or General. */
export function getExerciseMuscleLabels(exercise: WorkoutExercise): string[] {
  const deduped = [...new Set(exercise.musclesInvolved.map((s) => s.trim()).filter(Boolean))];
  if (deduped.length > 0) return deduped;
  return exercise.muscleGroup ? [exercise.muscleGroup] : ["General"];
}

/** Normalize for matching history across days (same lift, different row index / id). */
export function normalizeExerciseName(name: unknown): string {
  return typeof name === "string" ? name.trim().toLowerCase() : "";
}

/**
 * Matches persisted `exerciseId` in workoutLogs / exerciseHistory.
 * Prefer catalog `exerciseId` over per-row `id` (ids often differ per program day).
 */
export function getStableExerciseId(exercise: RawProgramExercise, index: number): string {
  const catalog = exercise.exerciseId ?? exercise.exercise_id ?? exercise.exerciseID;
  if (catalog != null && String(catalog).trim() !== "") return String(catalog).trim();
  const rowId = exercise.id;
  if (rowId != null && String(rowId).trim() !== "") return String(rowId).trim();
  const norm = normalizeExerciseName(exercise.exerciseName);
  if (norm) return `name:${norm}`;
  return `exercise-${index}`;
}

/** The exercises of a log when it is started: every set empty and not done. */
export function buildStartedExercises(exercises: WorkoutExercise[]) {
  return exercises.map((exercise, index) => ({
    exerciseId: getStableExerciseId(exercise, index),
    exerciseName: exercise.exerciseName,
    order: index + 1,
    targetSets: exercise.targetSets,
    targetReps: exercise.targetReps,
    restPeriod: typeof exercise.restPeriod === "string" && exercise.restPeriod ? exercise.restPeriod : "60s",
    notes: null,
    sets: Array.from({ length: exercise.targetSets }, (_, setIndex) => ({
      setNumber: setIndex + 1,
      weight: 0,
      reps: 0,
      completed: false,
      timestamp: null as Date | null,
      notes: null,
    })),
  }));
}

/** The exercises, totals and per-muscle set counts of a finished workout, from the set table. */
export function buildCompletedWorkout(
  exercises: WorkoutExercise[],
  setLogs: Record<string, SetLog[]>
) {
  let totalSets = 0;
  let totalReps = 0;
  let totalVolume = 0;
  const now = new Date();

  const exercisesData = exercises.map((exercise, index) => {
    const logs = setLogs[index.toString()] ?? [];
    const sets = logs.map((log, setIndex) => {
      const weight = Number.parseFloat(log.weight) || 0;
      const reps = Number.parseInt(log.reps, 10) || 0;

      if (log.done) {
        totalSets += 1;
        totalReps += reps;
        totalVolume += weight * reps;
      }

      return {
        setNumber: setIndex + 1,
        weight,
        reps,
        completed: log.done || false,
        timestamp: now,
        notes: null,
      };
    });

    return {
      exerciseId: getStableExerciseId(exercise, index),
      exerciseName: exercise.exerciseName,
      order: index + 1,
      targetSets: exercise.targetSets,
      targetReps: exercise.targetReps,
      restPeriod: "60s",
      notes: null,
      sets,
    };
  });

  return {
    exercisesData,
    totalSets,
    totalReps,
    totalVolume,
    setsPerMuscleGroup: getSetsPerMuscleGroup(exercises, setLogs),
  };
}

/** One exerciseHistory entry per exercise that has done sets. */
export function buildExerciseHistoryEntries(
  exercisesData: ReturnType<typeof buildCompletedWorkout>["exercisesData"],
  workoutName: string,
  date: unknown
) {
  return exercisesData.flatMap((entry) => {
    const completedSets = entry.sets.filter((s) => s.completed);
    if (completedSets.length === 0) return [];
    return [
      {
        exerciseId: entry.exerciseId,
        exerciseName: entry.exerciseName,
        workoutName,
        date,
        sets: completedSets.map((s) => ({ setNumber: s.setNumber, weight: s.weight, reps: s.reps })),
        totalVolume: completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0),
      },
    ];
  });
}

/** The previous session's set for a row: by set number, else by position. */
export function lookupPreviousSet(
  previousSets: PreviousSetEntry[] | undefined,
  setIndex: number
): PreviousSetEntry | null {
  if (!previousSets?.length) return null;
  return previousSets.find((s) => s.setNumber === setIndex + 1) ?? previousSets[setIndex] ?? null;
}
