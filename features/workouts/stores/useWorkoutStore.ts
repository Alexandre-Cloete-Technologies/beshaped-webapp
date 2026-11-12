"use client";

/**
 * The workout in progress: the set table, its per-day drafts and the workout timer. Ported from the mobile
 * app (`fitness/stores/useWorkoutStore.ts`); keep the two in step. Drafts are kept in this browser's
 * localStorage (the app keeps them in AsyncStorage), so sets typed here are not on the member's phone until
 * the workout is finished.
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SetLog } from "../utils/workout-exercises";

export type WorkoutTimerStatus = "idle" | "running" | "paused";

export interface WorkoutTimer {
  status: WorkoutTimerStatus;
  workoutKey: string | null;
  startedAt: number | null;
  accumulatedMs: number;
}

type SetLogs = Record<string, SetLog[]>;

/** A finished log's exercise, as far as hydrating the table needs it. */
type CompletedExercise = {
  sets?: { weight?: unknown; reps?: unknown; completed?: unknown }[];
};

interface WorkoutState {
  /** The set table on screen, keyed by exercise index. */
  setLogs: SetLogs;
  activeDraftKey: string | null;
  draftsByWorkoutKey: Record<string, SetLogs>;
  workoutTimer: WorkoutTimer;

  initializeSetLogs: (
    exercises: { targetSets?: number }[],
    draftKey?: string | null,
    options?: { completedExercises?: CompletedExercise[] }
  ) => void;
  updateSetLog: (
    exerciseKey: string,
    setIndex: number,
    field: keyof SetLog,
    value: string | boolean
  ) => void;
  resetSetLogs: () => void;
  clearDraftForKey: (draftKey: string) => void;
  startWorkoutTimer: (workoutKey: string | null, startedAtMs?: number) => void;
  pauseWorkoutTimer: () => void;
  resumeWorkoutTimer: () => void;
  resetWorkoutTimer: () => void;
}

const buildInitialSetLogs = (exercises: { targetSets?: number }[]): SetLogs => {
  const initial: SetLogs = {};
  exercises.forEach((exercise, exerciseIndex) => {
    if (exercise.targetSets) {
      initial[exerciseIndex.toString()] = Array.from({ length: exercise.targetSets }, () => ({
        weight: "",
        reps: "",
        done: false,
      }));
    }
  });
  return initial;
};

const hydrateWithDraft = (initial: SetLogs, draft?: SetLogs): SetLogs => {
  if (!draft) return initial;
  const hydrated = { ...initial };
  Object.keys(initial).forEach((exerciseKey) => {
    if (draft[exerciseKey]) hydrated[exerciseKey] = draft[exerciseKey];
  });
  return hydrated;
};

/** Apply a finished workout log onto empty set rows in one pass (avoids empty→filled flashes). */
const hydrateWithCompletedExercises = (
  initial: SetLogs,
  completedExercises: CompletedExercise[]
): SetLogs => {
  const hydrated: SetLogs = { ...initial };
  completedExercises.forEach((exercise, exerciseIndex) => {
    const key = exerciseIndex.toString();
    const rows = hydrated[key];
    const sets = exercise?.sets;
    if (!rows || !sets) return;

    hydrated[key] = rows.map((row, setIndex) => {
      const set = sets[setIndex];
      if (!set) return row;
      return {
        weight: set.weight !== undefined && set.weight !== null ? String(set.weight) : "",
        reps: set.reps !== undefined && set.reps !== null ? String(set.reps) : "",
        done: set.completed === true,
      };
    });
  });
  return hydrated;
};

const idleWorkoutTimer: WorkoutTimer = {
  status: "idle",
  workoutKey: null,
  startedAt: null,
  accumulatedMs: 0,
};

/** Elapsed time of the timer at `now` (ms since epoch). */
export const getWorkoutTimerElapsedMs = (timer: WorkoutTimer, now: number = Date.now()) => {
  const activeMs = timer.status === "running" && timer.startedAt ? now - timer.startedAt : 0;
  return timer.accumulatedMs + Math.max(0, activeMs);
};

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      setLogs: {},
      activeDraftKey: null,
      draftsByWorkoutKey: {},
      workoutTimer: idleWorkoutTimer,

      initializeSetLogs: (exercises, draftKey, options) => {
        set((state) => {
          const initial = buildInitialSetLogs(exercises);
          const resolvedDraftKey = draftKey ?? state.activeDraftKey;
          const completedExercises = options?.completedExercises;

          // A finished log wins over a draft, so empty rows are never painted and then overwritten.
          const setLogs = completedExercises?.length
            ? hydrateWithCompletedExercises(initial, completedExercises)
            : hydrateWithDraft(
                initial,
                resolvedDraftKey ? state.draftsByWorkoutKey[resolvedDraftKey] : undefined
              );

          return { setLogs, activeDraftKey: resolvedDraftKey ?? null };
        });
      },

      updateSetLog: (exerciseKey, setIndex, field, value) => {
        set((state) => {
          const setLogs = { ...state.setLogs };
          if (setLogs[exerciseKey]?.[setIndex]) {
            const rows = [...setLogs[exerciseKey]];
            rows[setIndex] = { ...rows[setIndex], [field]: value };
            setLogs[exerciseKey] = rows;
          }

          const draftsByWorkoutKey = { ...state.draftsByWorkoutKey };
          if (state.activeDraftKey) draftsByWorkoutKey[state.activeDraftKey] = setLogs;

          return { setLogs, draftsByWorkoutKey };
        });
      },

      resetSetLogs: () => set({ setLogs: {}, activeDraftKey: null }),

      clearDraftForKey: (draftKey) => {
        set((state) => {
          if (!state.draftsByWorkoutKey[draftKey]) return {};
          const draftsByWorkoutKey = { ...state.draftsByWorkoutKey };
          delete draftsByWorkoutKey[draftKey];
          return { draftsByWorkoutKey };
        });
      },

      startWorkoutTimer: (workoutKey, startedAtMs) => {
        set({
          workoutTimer: {
            status: "running",
            workoutKey,
            startedAt: startedAtMs ?? Date.now(),
            accumulatedMs: 0,
          },
        });
      },

      pauseWorkoutTimer: () => {
        set((state) => {
          const timer = state.workoutTimer;
          if (timer.status !== "running" || !timer.startedAt) return {};
          return {
            workoutTimer: {
              ...timer,
              status: "paused",
              startedAt: null,
              accumulatedMs: getWorkoutTimerElapsedMs(timer),
            },
          };
        });
      },

      resumeWorkoutTimer: () => {
        set((state) => {
          if (state.workoutTimer.status !== "paused") return {};
          return {
            workoutTimer: { ...state.workoutTimer, status: "running", startedAt: Date.now() },
          };
        });
      },

      resetWorkoutTimer: () => set({ workoutTimer: idleWorkoutTimer }),
    }),
    {
      name: "workout-store-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ draftsByWorkoutKey: state.draftsByWorkoutKey }),
    }
  )
);
