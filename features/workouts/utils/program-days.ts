/**
 * How a day in a program is identified. Ported from the mobile app (`fitness/lib/program-days.ts`,
 * beshaped-app#26); keep the two in step. A program day is `(phase, weekNumber, dayNumber)`:
 * - the phase is `phaseId` (`programs.phases[].phaseId`, stable when other phases are added or deleted).
 *   `phaseNumber` is its 1-based position in `phases[]`, used for order and display, and to match
 *   logs written before logs carried `phaseId`.
 * - `weekNumber`: 1…`durationWeeks`, restarting in every phase.
 * - `dayNumber`: 1…7 inside the week, restarting every week.
 * Program workoutLogs carry `phaseId`, `phaseNumber`, `weekNumber` and `dayNumber`.
 */

export const DAYS_PER_WEEK = 7;

export type ProgramDay = {
  phaseNumber: number;
  weekNumber: number;
  dayNumber: number;
  /** Stable phase key; null on programs or logs that don't have one. */
  phaseId?: string | null;
};

/**
 * A program day plus its position in the phase, 1-based: week 1 day 1 = 1, week 2 day 1 = 8.
 * The position only drives the pickers; it is never stored.
 */
export type IndexedProgramDay = ProgramDay & { dayIndex: number };

/** An exercise as stored in `programs.phases[].workouts[].exercises[]`. */
export type RawProgramExercise = Record<string, unknown>;

export type ProgramDaySlot = IndexedProgramDay & {
  /** Rest days, and days the coach left empty (no exercises). */
  isRestDay: boolean;
  workoutName: string | null;
  dayName: string | null;
  description: string | null;
  exercises: RawProgramExercise[];
};

function positiveInt(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Week, and day in the week, of a 1-based position in the phase (week 2 day 1 = 8). */
export function weekAndDayFromIndex(
  dayIndex: number
): Pick<ProgramDay, "weekNumber" | "dayNumber"> {
  return {
    weekNumber: Math.ceil(dayIndex / DAYS_PER_WEEK),
    dayNumber: ((dayIndex - 1) % DAYS_PER_WEEK) + 1,
  };
}

/**
 * Week and day of a program day or workout log. Older data that counts `dayNumber` across the whole
 * phase (> 7) is split into week and day; a missing `weekNumber` means week 1.
 */
export function readWeekAndDay(raw: {
  weekNumber?: unknown;
  dayNumber?: unknown;
}): Pick<ProgramDay, "weekNumber" | "dayNumber"> | null {
  const day = positiveInt(raw.dayNumber);
  if (day === null) return null;
  if (day > DAYS_PER_WEEK) return weekAndDayFromIndex(day);
  return { weekNumber: positiveInt(raw.weekNumber) ?? 1, dayNumber: day };
}

/** Program day of a workout log (`phaseId`, `phaseNumber`, `weekNumber`, `dayNumber`), or null if it has none. */
export function readProgramDay(raw: {
  phaseId?: unknown;
  phaseNumber?: unknown;
  weekNumber?: unknown;
  dayNumber?: unknown;
}): ProgramDay | null {
  const phaseNumber = positiveInt(raw.phaseNumber);
  const weekAndDay = readWeekAndDay(raw);
  if (phaseNumber === null || !weekAndDay) return null;
  return { phaseNumber, ...weekAndDay, phaseId: optionalString(raw.phaseId) };
}

export function dayIndexInPhase(weekNumber: number, dayNumber: number): number {
  return (weekNumber - 1) * DAYS_PER_WEEK + dayNumber;
}

/** Same phase (by `phaseId` when both have one, else by position), week and day. */
export function isSameProgramDay(a: ProgramDay, b: ProgramDay): boolean {
  const samePhase =
    a.phaseId && b.phaseId ? a.phaseId === b.phaseId : a.phaseNumber === b.phaseNumber;
  return samePhase && a.weekNumber === b.weekNumber && a.dayNumber === b.dayNumber;
}

export function compareProgramDays(a: ProgramDay, b: ProgramDay): number {
  return (
    a.phaseNumber - b.phaseNumber || a.weekNumber - b.weekNumber || a.dayNumber - b.dayNumber
  );
}

/** Every day of a program document's `phases[].workouts[]`, in program order. */
export function extractProgramDays(programData: { phases?: unknown }): ProgramDaySlot[] {
  const phases = programData.phases;
  if (!Array.isArray(phases)) return [];

  const byKey = new Map<string, ProgramDaySlot>();

  phases.forEach((phase: unknown, phaseIndex: number) => {
    if (!isRecord(phase) || !Array.isArray(phase.workouts)) return;

    phase.workouts.forEach((workout: unknown) => {
      if (!isRecord(workout)) return;
      const weekAndDay = readWeekAndDay(workout);
      if (!weekAndDay) return;

      const exercises: RawProgramExercise[] =
        !workout.isRestDay && Array.isArray(workout.exercises)
          ? workout.exercises.filter(isRecord)
          : [];
      const slot: ProgramDaySlot = {
        phaseNumber: phaseIndex + 1,
        phaseId: optionalString(phase.phaseId),
        ...weekAndDay,
        dayIndex: dayIndexInPhase(weekAndDay.weekNumber, weekAndDay.dayNumber),
        isRestDay: exercises.length === 0,
        workoutName: optionalString(workout.workoutName),
        dayName: optionalString(workout.dayName),
        description: optionalString(workout.description),
        exercises,
      };

      // One slot per day; a workout wins over a rest entry for the same day.
      const key = `${slot.phaseNumber}:${slot.dayIndex}`;
      const existing = byKey.get(key);
      if (!existing || (existing.isRestDay && !slot.isRestDay)) {
        byKey.set(key, slot);
      }
    });
  });

  return [...byKey.values()].sort(compareProgramDays);
}
