/**
 * A member's history of one exercise, read from their workoutLogs: one point per session, for the progress
 * chart, the personal record and the history list. Ported from the mobile app
 * (`fitness/lib/exercise-progress.ts`); keep the two in step. Runs in the browser as the signed-in user.
 */
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type ChartMetric = "heaviestWeight" | "bestSetVolume" | "totalVolume";

export type ExerciseSetSummary = {
  setNumber: number;
  weight: number;
  reps: number;
};

export type ExerciseProgressPoint = {
  date: Date;
  label: string;
  heaviestWeight: number;
  bestSetVolume: number;
  totalVolume: number;
  sets: ExerciseSetSummary[];
  bestSetByWeight: ExerciseSetSummary;
  bestSetByVolume: ExerciseSetSummary;
  inProgress: boolean;
  workoutLogId: string;
};

type WorkoutSetLike = {
  setNumber?: unknown;
  weight?: unknown;
  reps?: unknown;
  completed?: unknown;
};

type WorkoutExerciseLike = {
  exerciseId?: unknown;
  exercise_id?: unknown;
  exerciseID?: unknown;
  exerciseName?: unknown;
  sets?: WorkoutSetLike[];
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function normalizeExerciseName(name: unknown): string {
  return typeof name === "string" ? name.trim().toLowerCase() : "";
}

/** "Nov 12" */
export function formatShortChartDate(date: Date): string {
  return `${MONTH_LABELS[date.getMonth()]} ${date.getDate()}`;
}

/** "Nov 12, 2026" */
export function formatFullChartDate(date: Date): string {
  return `${MONTH_LABELS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** "12 Nov 2026, 14:05" */
export function formatHistorySessionDate(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${date.getDate()} ${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}, ${hours}:${minutes}`;
}

/** A weight without rounding half-kilo plates away: 42.5 stays "42.5", 40 stays "40". */
export function formatWeight(weight: number): string {
  return String(Math.round(weight * 100) / 100);
}

export function formatSetLabel(set: ExerciseSetSummary): string {
  return `${formatWeight(set.weight)} kg × ${Math.round(set.reps)}`;
}

/** The set a metric's value comes from: the heaviest set, or the set with the most volume. */
export function getHighlightSetForMetric(
  point: ExerciseProgressPoint,
  metric: ChartMetric
): ExerciseSetSummary {
  return metric === "heaviestWeight" ? point.bestSetByWeight : point.bestSetByVolume;
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (value && typeof (value as { toDate?: unknown }).toDate === "function") {
    try {
      const parsed = (value as { toDate: () => Date }).toDate();
      return parsed instanceof Date && !Number.isNaN(parsed.getTime()) ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
}

function metricsFromSets(sets: WorkoutSetLike[]) {
  const hasCompletionFlags = sets.some((set) => typeof set.completed === "boolean");

  const done: ExerciseSetSummary[] = sets
    .map((set, index) => ({
      set,
      weight: Number(set.weight) || 0,
      reps: Number(set.reps) || 0,
      setNumber: Number(set.setNumber) || index + 1,
    }))
    .filter(({ set, weight, reps }) => {
      if (weight <= 0 && reps <= 0) return false;
      return hasCompletionFlags ? set.completed === true : true;
    })
    .map(({ weight, reps, setNumber }) => ({ setNumber, weight, reps }));

  if (done.length === 0) return null;

  return {
    heaviestWeight: Math.max(0, ...done.map((set) => set.weight)),
    bestSetVolume: Math.max(0, ...done.map((set) => set.weight * set.reps)),
    totalVolume: done.reduce((sum, set) => sum + set.weight * set.reps, 0),
    sets: done,
    bestSetByWeight: done.reduce((best, set) => (set.weight > best.weight ? set : best)),
    bestSetByVolume: done.reduce((best, set) =>
      set.weight * set.reps > best.weight * best.reps ? set : best
    ),
  };
}

function exerciseMatches(
  exercise: WorkoutExerciseLike,
  exerciseId: string,
  exerciseName: string
): boolean {
  const targetId = exerciseId.trim();
  const targetName = normalizeExerciseName(exerciseName);

  const candidateIds = [exercise.exerciseId, exercise.exercise_id, exercise.exerciseID]
    .map((value) => (value == null ? "" : String(value).trim()))
    .filter(Boolean);

  if (targetId && candidateIds.includes(targetId)) return true;

  // Ids like "name:pull up (weighted)" are the fallback for exercises logged without a library id.
  if (targetId.startsWith("name:")) {
    const fromId = targetId.slice("name:".length);
    if (fromId && normalizeExerciseName(exercise.exerciseName) === fromId) return true;
  }

  if (!targetName) return false;
  return normalizeExerciseName(exercise.exerciseName) === targetName;
}

/**
 * Per-session progress points for one exercise, oldest first: every finished session, plus at most one
 * in-progress session (the latest). Matches the exercise by id, else by name.
 */
export async function fetchExerciseProgressPoints({
  userId,
  exerciseId,
  exerciseName,
}: {
  userId: string;
  exerciseId: string;
  exerciseName?: string;
}): Promise<ExerciseProgressPoint[]> {
  if (!userId.trim()) return [];

  const snapshot = await getDocs(
    query(collection(db, "workoutLogs"), where("userId", "==", userId))
  );

  const points: ExerciseProgressPoint[] = [];

  for (const logDoc of snapshot.docs) {
    const data = logDoc.data();
    const status = typeof data.status === "string" ? data.status.trim().toLowerCase() : "";
    // Done = completed or skipped (workoutLogs contract); scheduled slots have no date and are skipped below.
    const inProgress = status !== "" && status !== "completed" && status !== "skipped";

    const date =
      toDate(data.dateCompleted) ?? toDate(data.timeCompletedAt) ?? toDate(data.timeStartedAt);
    if (!date) continue;

    const exercises: WorkoutExerciseLike[] = Array.isArray(data.exercises) ? data.exercises : [];
    const match = exercises.find((exercise) =>
      exerciseMatches(exercise, exerciseId, exerciseName ?? "")
    );
    if (!match) continue;

    const metrics = metricsFromSets(Array.isArray(match.sets) ? match.sets : []);
    if (!metrics) continue;

    points.push({
      date,
      label: formatShortChartDate(date),
      ...metrics,
      inProgress,
      workoutLogId: logDoc.id,
    });
  }

  points.sort((a, b) => a.date.getTime() - b.date.getTime());

  const completed = points.filter((point) => !point.inProgress);
  const latestInProgress = points.filter((point) => point.inProgress).at(-1);
  return latestInProgress ? [...completed, latestInProgress] : completed;
}

/** The points of the last `months` months (30-day months); all of them when `months` is 0 or less. */
export function filterProgressPointsByMonths(
  points: ExerciseProgressPoint[],
  months: number,
  now: number
): ExerciseProgressPoint[] {
  if (months <= 0) return points;
  const cutoff = now - months * 30 * 24 * 60 * 60 * 1000;
  return points.filter((point) => point.date.getTime() >= cutoff);
}

export function getPersonalRecordHeaviest(points: ExerciseProgressPoint[]): number {
  return points.length === 0 ? 0 : Math.max(...points.map((point) => point.heaviestWeight));
}
