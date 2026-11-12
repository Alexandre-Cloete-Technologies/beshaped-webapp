/** Ported from the mobile app (`fitness/lib/sets-per-muscle.ts`); keep the two in step. */

export type MuscleTaggedExercise = {
  musclesInvolved?: unknown;
  muscleGroup?: unknown;
};

export type SetDoneLike = {
  done?: boolean;
};

/** Title-case muscle labels so "shoulders" / "Shoulders" share one key. */
export function normalizeMuscleName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Primary muscle only: first musclesInvolved entry, else muscleGroup, else General. */
export function getPrimaryMuscle(exercise: MuscleTaggedExercise): string {
  if (Array.isArray(exercise.musclesInvolved)) {
    for (const value of exercise.musclesInvolved) {
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed) return normalizeMuscleName(trimmed);
      }
    }
  }

  if (typeof exercise.muscleGroup === "string") {
    const group = exercise.muscleGroup.trim();
    if (group) return normalizeMuscleName(group);
  }

  return "General";
}

/** Unique primary muscles for a workout, excluding General. */
export function getPrimaryMusclesForExercises(exercises: MuscleTaggedExercise[]): string[] {
  const muscles = new Set<string>();

  exercises.forEach((exercise) => {
    const muscle = getPrimaryMuscle(exercise);
    if (muscle.toLowerCase() === "general") return;
    muscles.add(muscle);
  });

  return [...muscles].sort((a, b) => a.localeCompare(b));
}

/** Count completed sets credited to each exercise's primary muscle only. */
export function getSetsPerMuscleGroup(
  exercises: MuscleTaggedExercise[],
  setLogs: Record<string, SetDoneLike[] | undefined>
): Record<string, number> {
  const counts: Record<string, number> = {};

  exercises.forEach((exercise, index) => {
    const completedCount = (setLogs[index.toString()] ?? []).filter(
      (set) => set.done === true
    ).length;
    if (completedCount === 0) return;

    const muscle = getPrimaryMuscle(exercise);
    if (muscle.toLowerCase() === "general") return;
    counts[muscle] = (counts[muscle] ?? 0) + completedCount;
  });

  return counts;
}

/** Sorted highest → lowest for summary UI. */
export function sortSetsPerMuscleGroup(
  counts: Record<string, number>
): { muscle: string; sets: number }[] {
  return Object.entries(counts)
    .map(([muscle, sets]) => ({ muscle, sets }))
    .sort((a, b) => b.sets - a.sets || a.muscle.localeCompare(b.muscle));
}
