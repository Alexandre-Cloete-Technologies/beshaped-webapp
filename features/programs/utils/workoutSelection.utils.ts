import { ProgramPhase, Workout } from "../types/programTypes";

/**
 * Calculates available weeks for a phase based on workouts
 */
export const calculateAvailableWeeks = (workouts: Workout[]): number[] => {
  if (!workouts || workouts.length === 0) return [];

  const maxDay = Math.max(...workouts.map((w) => w.dayNumber));
  const weekCount = Math.ceil(maxDay / 7);

  return Array.from({ length: weekCount }, (_, i) => i + 1);
};

/**
 * Converts week and day-in-week to overall day number
 */
export const calculateOverallDay = (week: number, dayInWeek: number): number => {
  return (week - 1) * 7 + dayInWeek;
};

/**
 * Finds a workout for a specific day
 */
export const findWorkoutByDay = (
  workouts: Workout[],
  day: number
): Workout | undefined => {
  return workouts.find((workout) => workout.dayNumber === day);
};

/**
 * Checks if a phase has workouts for a specific week
 */
export const hasWorkoutsInWeek = (
  workouts: Workout[],
  week: number
): boolean => {
  const startDay = (week - 1) * 7 + 1;
  const endDay = week * 7;

  return workouts.some((w) => w.dayNumber >= startDay && w.dayNumber <= endDay);
};

/**
 * Gets the first available day in a week
 */
export const getFirstAvailableDayInWeek = (
  workouts: Workout[],
  week: number
): number => {
  const startDay = (week - 1) * 7 + 1;
  const endDay = week * 7;

  for (let dayInWeek = 1; dayInWeek <= 7; dayInWeek++) {
    const overallDay = startDay + dayInWeek - 1;
    if (workouts.some((w) => w.dayNumber === overallDay)) {
      return dayInWeek;
    }
  }

  return 1;
};

/**
 * Validates and adjusts workout selection to ensure it points to valid data
 */
export const validateWorkoutSelection = (
  phases: ProgramPhase[],
  currentPhase: number,
  currentWeek: number,
  currentDayInWeek: number
): { phase: number; week: number; dayInWeek: number; overallDay: number } => {
  const phase = phases.find((p) => p.order === currentPhase) || phases[0];
  if (!phase) {
    return { phase: 1, week: 1, dayInWeek: 1, overallDay: 1 };
  }

  const availableWeeks = calculateAvailableWeeks(phase.workouts);
  const week = availableWeeks.includes(currentWeek) ? currentWeek : availableWeeks[0] || 1;
  
  const overallDay = calculateOverallDay(week, currentDayInWeek);
  const workout = findWorkoutByDay(phase.workouts, overallDay);

  if (!workout) {
    const firstDay = getFirstAvailableDayInWeek(phase.workouts, week);
    return {
      phase: phase.order,
      week,
      dayInWeek: firstDay,
      overallDay: calculateOverallDay(week, firstDay),
    };
  }

  return {
    phase: phase.order,
    week,
    dayInWeek: currentDayInWeek,
    overallDay,
  };
};