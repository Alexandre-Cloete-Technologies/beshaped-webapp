/** Ported from the mobile app (`fitness/lib/program-resume.ts`); keep the two in step. */
import {
  compareProgramDays,
  isSameProgramDay,
  readProgramDay,
  type ProgramDay,
} from "./program-days";

export type WorkoutLogLike = {
  phaseId?: unknown;
  phaseNumber?: unknown;
  weekNumber?: unknown;
  dayNumber?: unknown;
  status?: unknown;
  timeStartedAt?: unknown;
};

/** Time in ms of a Firestore Timestamp, Date or epoch number; 0 when there is none. */
export function toMillis(value: unknown): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (value && typeof (value as { toMillis?: () => number }).toMillis === "function") {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
}

/** Finished: `completed` or `skipped`. */
export function isFinishedLog(log: WorkoutLogLike | null | undefined): boolean {
  return log?.status === "completed" || log?.status === "skipped";
}

/**
 * Started and not finished: `in-progress`, or `to-be-completed` with a start time (how the app wrote
 * started workouts before beshaped-app#21; read only, never written). `to-be-completed` without a start
 * time is a scheduled slot.
 */
export function isStartedLog(log: WorkoutLogLike | null | undefined): boolean {
  return (
    log?.status === "in-progress" ||
    (log?.status === "to-be-completed" && toMillis(log.timeStartedAt) > 0)
  );
}

/** A scheduled slot (seeded by the coach portal, or reset by Discard): `to-be-completed` with no start time. */
export function isScheduledLog(log: WorkoutLogLike | null | undefined): boolean {
  return log?.status === "to-be-completed" && toMillis(log.timeStartedAt) === 0;
}

function isDayCompleted(logs: WorkoutLogLike[], day: ProgramDay): boolean {
  return logs.some((log) => {
    const logDay = readProgramDay(log);
    return Boolean(logDay && isSameProgramDay(logDay, day) && isFinishedLog(log));
  });
}

/** Workout day of the most recently started workout that isn't finished. Scheduled slots don't count. */
function findOpenWorkoutDay<T extends ProgramDay & { isRestDay?: boolean }>(
  days: T[],
  logs: WorkoutLogLike[]
): T | undefined {
  let open: { day: T; startedAt: number } | undefined;

  for (const log of logs) {
    if (!isStartedLog(log)) continue;
    const startedAt = toMillis(log.timeStartedAt);
    const logDay = readProgramDay(log);
    if (!logDay) continue;

    const day = days.find(
      (candidate) => !candidate.isRestDay && isSameProgramDay(candidate, logDay)
    );
    if (!day || isDayCompleted(logs, day)) continue;
    if (!open || startedAt > open.startedAt) open = { day, startedAt };
  }

  return open?.day;
}

/**
 * Resume at the workout in progress, if there is one; otherwise at the first incomplete workout day in
 * program order (phase, week, day). Rest days are skipped (they don't block progress).
 * If every workout day is completed, returns the last day of the program.
 */
export function findResumeProgramPosition<T extends ProgramDay & { isRestDay?: boolean }>(
  days: T[],
  logs: WorkoutLogLike[]
): T | null {
  if (days.length === 0) return null;

  const ordered = [...days].sort(compareProgramDays);
  const openWorkout = findOpenWorkoutDay(ordered, logs);
  if (openWorkout) return openWorkout;

  const firstIncompleteWorkout = ordered.find(
    (day) => !day.isRestDay && !isDayCompleted(logs, day)
  );

  return firstIncompleteWorkout ?? ordered[ordered.length - 1];
}
