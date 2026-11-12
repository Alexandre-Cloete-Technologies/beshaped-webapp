/**
 * The "Previous" column of the set table: each exercise's sets from the member's latest earlier session.
 * Ported from the mobile program screen (`fetchExerciseHistoryPreviousSets`); keep the two in step.
 */
import { collection, getDocs, query, where, type DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { RawProgramExercise } from "../utils/program-days";
import { toMillis } from "../utils/program-resume";
import {
  getStableExerciseId,
  normalizeExerciseName,
  type PreviousSetEntry,
} from "../utils/workout-exercises";

export type PreviousSetsLookup = {
  byId: Record<string, PreviousSetEntry[]>;
  byNormalizedName: Record<string, PreviousSetEntry[]>;
};

export const EMPTY_PREVIOUS_LOOKUP: PreviousSetsLookup = { byId: {}, byNormalizedName: {} };

function historyDateMs(data: DocumentData): number {
  const ms = toMillis(data.date);
  if (ms) return ms;
  const seconds = (data.date as { seconds?: unknown } | null | undefined)?.seconds;
  return typeof seconds === "number" ? seconds * 1000 : 0;
}

/**
 * Latest earlier sets per exercise, matched by exercise id and by name. `excludeWorkoutLogId` leaves out the
 * day's own log, so a finished workout doesn't show itself as "previous".
 */
export async function fetchPreviousSets(
  userId: string,
  exercises: RawProgramExercise[],
  excludeWorkoutLogId: string | null
): Promise<PreviousSetsLookup> {
  if (!exercises.length) return EMPTY_PREVIOUS_LOOKUP;

  const neededIds = new Set(exercises.map((ex, i) => getStableExerciseId(ex, i)));
  const neededNames = new Set(
    exercises.map((ex) => normalizeExerciseName(ex.exerciseName)).filter((n) => n.length > 0)
  );

  // Equality-only query on the automatic single-field index. userId is the uid string (beshaped-backend#29).
  const snapshot = await getDocs(
    query(collection(db, "exerciseHistory"), where("userId", "==", userId))
  );
  const newestFirst = snapshot.docs
    .map((d) => d.data())
    .sort((a, b) => historyDateMs(b) - historyDateMs(a));

  const byId: Record<string, PreviousSetEntry[]> = {};
  const byNormalizedName: Record<string, PreviousSetEntry[]> = {};

  newestFirst.forEach((data) => {
    if (excludeWorkoutLogId && data.workoutLogId === excludeWorkoutLogId) return;

    const id = String(data.exerciseId ?? "").trim();
    const name = normalizeExerciseName(data.exerciseName);
    const idMatches = Boolean(id && neededIds.has(id) && !byId[id]);
    const nameMatches = Boolean(name && neededNames.has(name) && !byNormalizedName[name]);
    if (!idMatches && !nameMatches) return;

    const rawSets: DocumentData[] = Array.isArray(data.sets) ? data.sets : [];
    const sets = rawSets.map((s, i) => ({
      setNumber: Number(s.setNumber) || i + 1,
      weight: Number(s.weight) || 0,
      reps: Number(s.reps) || 0,
    }));

    if (idMatches) byId[id] = sets;
    if (nameMatches) byNormalizedName[name] = sets;
  });

  return { byId, byNormalizedName };
}

export function previousSetsForExercise(
  lookup: PreviousSetsLookup,
  exercise: RawProgramExercise,
  exerciseIndex: number
): PreviousSetEntry[] | undefined {
  const fromId = lookup.byId[getStableExerciseId(exercise, exerciseIndex)];
  if (fromId?.length) return fromId;
  const name = normalizeExerciseName(exercise.exerciseName);
  const fromName = name ? lookup.byNormalizedName[name] : undefined;
  return fromName?.length ? fromName : undefined;
}
