import { ProgramPhase, Workout } from "../types/programTypes";

const DAYS_PER_WEEK = 7;

/**
 * Normalises a workout's week and day numbers.
 *
 * The coach portal writes `weekNumber` (1…durationWeeks) and `dayNumber` (1–7).
 * Older data may have `dayNumber` counting across the whole phase (> 7) with no
 * `weekNumber`; this fallback splits it the same way the mobile app does
 * (fitness/lib/program-days.ts `readWeekAndDay`).
 */
function normaliseWeekDay(workout: Workout): { weekNumber: number; dayNumber: number } {
  const day = workout.dayNumber;
  if (day > DAYS_PER_WEEK) {
    // Legacy: overall phase day — split into week + day-in-week.
    return {
      weekNumber: Math.ceil(day / DAYS_PER_WEEK),
      dayNumber: ((day - 1) % DAYS_PER_WEEK) + 1,
    };
  }
  return {
    weekNumber: workout.weekNumber ?? 1,
    dayNumber: day,
  };
}

/**
 * Number of weeks in a phase.
 * Prefer the authoritative `durationWeeks` field; fall back to inferring from
 * the highest weekNumber seen in the workouts (handles legacy data).
 */
export const getWeekCount = (phase: ProgramPhase): number => {
  if (phase.durationWeeks && phase.durationWeeks > 0) return phase.durationWeeks;
  if (!phase.workouts || phase.workouts.length === 0) return 1;
  return Math.max(...phase.workouts.map((w) => normaliseWeekDay(w).weekNumber));
};

/**
 * Available week numbers for a phase (1…weekCount).
 */
export const calculateAvailableWeeks = (phase: ProgramPhase): number[] => {
  const count = getWeekCount(phase);
  return Array.from({ length: count }, (_, i) => i + 1);
};

/**
 * Returns true when a workout exists for the given weekNumber + dayNumber pair.
 */
export const hasWorkoutAt = (
  workouts: Workout[],
  weekNumber: number,
  dayNumber: number
): boolean =>
  workouts.some((w) => {
    const n = normaliseWeekDay(w);
    return n.weekNumber === weekNumber && n.dayNumber === dayNumber;
  });

/**
 * Finds the workout for a specific (weekNumber, dayNumber).
 */
export const findWorkoutByWeekDay = (
  workouts: Workout[],
  weekNumber: number,
  dayNumber: number
): Workout | undefined =>
  workouts.find((w) => {
    const n = normaliseWeekDay(w);
    return n.weekNumber === weekNumber && n.dayNumber === dayNumber;
  });

/**
 * Returns the first day-in-week (1–7) that has a workout in the given week,
 * or 1 if none exist (rest-day week).
 */
export const getFirstDayInWeek = (workouts: Workout[], weekNumber: number): number => {
  for (let d = 1; d <= DAYS_PER_WEEK; d++) {
    if (hasWorkoutAt(workouts, weekNumber, d)) return d;
  }
  return 1;
};

/**
 * Validates and adjusts the current selection so it always points at an
 * existing workout (or the nearest valid position when it doesn't).
 */
export const validateWorkoutSelection = (
  phases: ProgramPhase[],
  currentPhaseOrder: number,
  currentWeek: number,
  currentDayInWeek: number
): { phaseOrder: number; week: number; dayInWeek: number } => {
  const phase =
    phases.find((p) => p.order === currentPhaseOrder) ?? phases[0];
  if (!phase) return { phaseOrder: 0, week: 1, dayInWeek: 1 };

  const weekCount = getWeekCount(phase);
  const week =
    currentWeek >= 1 && currentWeek <= weekCount ? currentWeek : 1;

  const dayExists = hasWorkoutAt(phase.workouts, week, currentDayInWeek);
  const dayInWeek = dayExists
    ? currentDayInWeek
    : getFirstDayInWeek(phase.workouts, week);

  return { phaseOrder: phase.order, week, dayInWeek };
};
