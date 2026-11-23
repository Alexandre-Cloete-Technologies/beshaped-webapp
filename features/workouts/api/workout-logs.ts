/**
 * Program workout logs: their doc id and the writes the program page makes. Ported from the mobile app
 * (`fitness/lib/workout-logs.ts`; workoutLogs data contract, beshaped-backend#38); keep the two in step.
 * Runs in the browser as the signed-in user, so Firestore security rules apply.
 *
 * - One log per user, program, round and program day. Its doc id is
 *   `{uid}_{programId}_r{round}_{phaseKey}_w{week}d{day}`, the same rule as the coach portal's seed, so the
 *   member fills the slot the coach seeded.
 * - Status: `to-be-completed` with no start time = scheduled; `in-progress` = started; `completed` or
 *   `skipped` = done (`utils/program-resume.ts`).
 * - Logs written before this rule have random ids, so a day is looked up by its fields first and the rule id is
 *   used only when the day has no log yet.
 */
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { isSameProgramDay, readProgramDay, type ProgramDay } from "../utils/program-days";
import { isFinishedLog, isScheduledLog, isStartedLog } from "../utils/program-resume";

/** A `workoutLogs` doc with its id; the named fields are the ones the day and status rules read. */
export interface WorkoutLog extends DocumentData {
  id: string;
  userId?: unknown;
  programId?: unknown;
  status?: unknown;
  timeStartedAt?: unknown;
  phaseId?: unknown;
  phaseNumber?: unknown;
  weekNumber?: unknown;
  dayNumber?: unknown;
}

/** Always 1 until a restart feature exists. */
export const PROGRAM_LOG_ROUND = 1;

const SAFE_PHASE_ID = /^[A-Za-z0-9_-]{1,40}$/;

/** The phase's id when it can go in a doc id (only [A-Za-z0-9_-], at most 40 characters). */
export function usablePhaseId(phaseId: unknown): string | null {
  return typeof phaseId === "string" && SAFE_PHASE_ID.test(phaseId) ? phaseId : null;
}

/** Doc id of the user's log for one program day; the phase is its `phaseId`, else `p{phaseNumber}`. */
export function programWorkoutLogId(userId: string, programId: string, day: ProgramDay): string {
  const phaseKey = usablePhaseId(day.phaseId) ?? `p${day.phaseNumber}`;
  return `${userId}_${programId}_r${PROGRAM_LOG_ROUND}_${phaseKey}_w${day.weekNumber}d${day.dayNumber}`;
}

/** Whether a log has a rule id (the coach's slot or one a client created), as opposed to an older random id. */
export function isRuleIdLog(logId: string, userId: string, programId: string): boolean {
  return logId.startsWith(`${userId}_${programId}_r`);
}

function logRank(log: DocumentData): number {
  if (isFinishedLog(log)) return 2;
  if (isStartedLog(log)) return 1;
  return 0;
}

/**
 * The user's log for one day of this program: a finished one, else a started one, else a scheduled slot.
 * Older data can hold more than one log per day (an app log with a random id next to a seeded slot).
 */
export function pickProgramDayLog(
  logs: WorkoutLog[],
  userId: string,
  programId: string,
  day: ProgramDay
): WorkoutLog | null {
  const matches = logs.filter((log) => {
    if (log.userId !== userId || log.programId !== programId) return false;
    const logDay = readProgramDay(log);
    return Boolean(logDay && isSameProgramDay(logDay, day));
  });
  matches.sort((a, b) => logRank(b) - logRank(a));
  return matches[0] ?? null;
}

/** This program's logs for the user (`userId` + `programId`, equality only). */
export async function fetchProgramLogs(userId: string, programId: string): Promise<WorkoutLog[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "workoutLogs"),
      where("userId", "==", userId),
      where("programId", "==", programId)
    )
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

function programDayFields(userId: string, programId: string, day: ProgramDay) {
  return {
    userId,
    sourceType: "program",
    programId,
    round: PROGRAM_LOG_ROUND,
    phaseId: day.phaseId ?? null,
    phaseNumber: day.phaseNumber,
    weekNumber: day.weekNumber,
    dayNumber: day.dayNumber,
  };
}

/**
 * Start: the day's log becomes `in-progress` with `timeStartedAt`. It fills the existing log (the coach's
 * scheduled slot) or creates the doc at the rule id when the day has no log yet. A log that is already started
 * or finished is returned as it is, so a second device or a double click doesn't restart it.
 */
export async function startProgramDay(params: {
  userId: string;
  programId: string;
  day: ProgramDay;
  existing: WorkoutLog | null;
  /** programName, workoutName and the exercises as they are started. */
  fields: DocumentData;
  startedAt: Date;
}): Promise<WorkoutLog> {
  const { userId, programId, day, existing, fields, startedAt } = params;
  const ref = doc(db, "workoutLogs", existing?.id ?? programWorkoutLogId(userId, programId, day));

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = snapshot.exists() ? snapshot.data() : undefined;
    if (current && !isScheduledLog(current)) return { ...current, id: ref.id };

    const data = {
      ...programDayFields(userId, programId, day),
      ...fields,
      status: "in-progress",
      timeStartedAt: startedAt,
      timeCompletedAt: null,
      dateCompleted: null,
      totalDuration: null,
      totalVolume: 0,
      totalSets: 0,
      totalReps: 0,
      personalBests: [],
      notes: null,
    };
    if (current) transaction.update(ref, data);
    else transaction.set(ref, data);
    return { ...current, ...data, id: ref.id };
  });
}

/** Finish, or save a finished workout again: always the same doc (the day's log, else the rule id). */
export async function saveProgramDay(params: {
  userId: string;
  programId: string;
  day: ProgramDay;
  existing: WorkoutLog | null;
  data: DocumentData;
}): Promise<WorkoutLog> {
  const { userId, programId, day, existing, data } = params;
  const id = existing?.id ?? programWorkoutLogId(userId, programId, day);
  const full = { ...programDayFields(userId, programId, day), ...data };
  await setDoc(doc(db, "workoutLogs", id), full, { merge: true });
  return { ...existing, ...full, id };
}

function clearedExercises(exercises: unknown): DocumentData[] {
  if (!Array.isArray(exercises)) return [];
  return exercises.map((exercise: DocumentData) => ({
    ...exercise,
    sets: Array.isArray(exercise?.sets)
      ? exercise.sets.map((set: DocumentData) => ({
          ...set,
          weight: 0,
          reps: 0,
          completed: false,
          timestamp: null,
        }))
      : [],
  }));
}

/** The scheduled shape Discard puts a rule-id log back into. */
export function resetToScheduled<T extends DocumentData>(log: T): T {
  return {
    ...log,
    status: "to-be-completed",
    timeStartedAt: null,
    timeCompletedAt: null,
    dateCompleted: null,
    totalDuration: null,
    totalVolume: 0,
    totalSets: 0,
    totalReps: 0,
    exercises: clearedExercises(log.exercises),
  };
}

/**
 * Discard a started program workout. A rule-id log goes back to a scheduled slot, so the coach's slot stays; an
 * older log with a random id is deleted. A finished log is never touched.
 */
export async function discardProgramDay(
  logId: string,
  userId: string,
  programId: string
): Promise<"reset" | "deleted"> {
  if (!isRuleIdLog(logId, userId, programId)) {
    await deleteDoc(doc(db, "workoutLogs", logId));
    return "deleted";
  }

  const ref = doc(db, "workoutLogs", logId);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) return "deleted";
    const current = snapshot.data();
    if (!isFinishedLog(current)) {
      const reset = resetToScheduled(current);
      transaction.update(ref, {
        status: reset.status,
        timeStartedAt: null,
        timeCompletedAt: null,
        dateCompleted: null,
        totalDuration: null,
        totalVolume: 0,
        totalSets: 0,
        totalReps: 0,
        exercises: reset.exercises,
      });
    }
    return "reset";
  });
}

export type ExerciseHistoryEntry = {
  exerciseId: string;
  exerciseName: string;
  workoutName: string;
  date: unknown;
  sets: { setNumber: number; weight: number; reps: number }[];
  totalVolume: number;
};

/** exerciseHistory doc id: one doc per exercise per workout log. */
export function exerciseHistoryId(workoutLogId: string, exerciseId: string): string {
  return `${workoutLogId}_${encodeURIComponent(exerciseId)}`;
}

/**
 * The exerciseHistory of one saved workout log: one doc per exercise with done sets. Saving again overwrites
 * them, and docs for exercises that no longer have done sets are deleted.
 */
export async function writeExerciseHistory(
  userId: string,
  workoutLogId: string,
  entries: ExerciseHistoryEntry[]
): Promise<void> {
  const existing = await getDocs(
    query(
      collection(db, "exerciseHistory"),
      where("userId", "==", userId),
      where("workoutLogId", "==", workoutLogId)
    )
  );
  const keep = new Set(entries.map((entry) => exerciseHistoryId(workoutLogId, entry.exerciseId)));
  const batch = writeBatch(db);

  existing.docs.forEach((d) => {
    if (!keep.has(d.id)) batch.delete(d.ref);
  });
  entries.forEach((entry) => {
    batch.set(doc(db, "exerciseHistory", exerciseHistoryId(workoutLogId, entry.exerciseId)), {
      userId,
      workoutLogId,
      ...entry,
      createdAt: serverTimestamp(),
    });
  });

  if (entries.length || existing.size) await batch.commit();
}
