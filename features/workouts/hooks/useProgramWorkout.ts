"use client";

/**
 * State and actions of the program workout page: which day is open, its workout log, and Start / Finish /
 * Discard / edit of a finished workout. Mirrors the mobile program screen
 * (`fitness/app/(tabs)/program/[id].tsx`); keep the behaviour of the two in step.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Timestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import type { Program } from "@/features/programs/types/programTypes";
import {
  EMPTY_PREVIOUS_LOOKUP,
  fetchPreviousSets,
  type PreviousSetsLookup,
} from "../api/exercise-history";
import {
  discardProgramDay,
  fetchProgramLogs,
  pickProgramDayLog,
  resetToScheduled,
  saveProgramDay,
  startProgramDay,
  writeExerciseHistory,
  type WorkoutLog,
} from "../api/workout-logs";
import { getWorkoutTimerElapsedMs, useWorkoutStore } from "../stores/useWorkoutStore";
import { toJsDate } from "../utils/format";
import { extractProgramDays, type ProgramDaySlot } from "../utils/program-days";
import {
  findResumeProgramPosition,
  isFinishedLog,
  isScheduledLog,
  isStartedLog,
  toMillis,
} from "../utils/program-resume";
import {
  buildCompletedWorkout,
  buildExerciseHistoryEntries,
  buildStartedExercises,
  toWorkoutExercises,
  type PreviousSetEntry,
  type SetLog,
} from "../utils/workout-exercises";

/** A day picked in the page: its phase and its position in the phase (week 2 day 1 = 8). */
export type DaySelection = { phaseNumber: number; dayIndex: number };

type BusyAction = "starting" | "saving" | "discarding";

function workoutNameOf(slot: ProgramDaySlot): string {
  return (slot.isRestDay ? slot.dayName : slot.workoutName) || `Day ${slot.dayNumber}`;
}

export function useProgramWorkout(program: Program) {
  const programId = program.id;
  const [authUser] = useAuthState(auth);
  const uid = authUser?.uid ?? null;

  const days = useMemo(() => extractProgramDays(program), [program]);

  const [loaded, setLoaded] = useState<{ uid: string; logs: WorkoutLog[] } | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [selection, setSelection] = useState<DaySelection | null>(null);
  const [previous, setPrevious] = useState<{ key: string; lookup: PreviousSetsLookup } | null>(null);
  const [isEditingCompleted, setIsEditingCompleted] = useState(false);
  const [busy, setBusy] = useState<BusyAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  /** Sets per muscle of the workout that was just saved; shown once in the summary dialog. */
  const [savedSummary, setSavedSummary] = useState<Record<string, number> | null>(null);

  const setLogs = useWorkoutStore((state) => state.setLogs);
  const activeDraftKey = useWorkoutStore((state) => state.activeDraftKey);
  const updateSetLog = useWorkoutStore((state) => state.updateSetLog);

  /** Fields ticking a set filled in from "Previous", so unticking can empty them again. */
  const autoFilledRef = useRef<Record<string, { weight: boolean; reps: boolean }>>({});

  // The member's logs for this program; the page opens on the day to resume.
  useEffect(() => {
    if (!uid) return;
    let cancelled = false;

    fetchProgramLogs(uid, programId)
      .then((logs) => ({ logs, failed: false }))
      .catch((error) => {
        console.error("Error fetching workout logs:", error);
        return { logs: [] as WorkoutLog[], failed: true };
      })
      .then(({ logs, failed }) => {
        if (cancelled) return;
        const resumeAt = findResumeProgramPosition(days, logs);
        setLoaded({ uid, logs });
        setLoadFailed(failed);
        setSelection(
          (current) =>
            current ??
            (resumeAt ? { phaseNumber: resumeAt.phaseNumber, dayIndex: resumeAt.dayIndex } : null)
        );
      });

    return () => {
      cancelled = true;
    };
  }, [uid, programId, days]);

  const logs = loaded && loaded.uid === uid ? loaded.logs : null;

  const slot = useMemo(() => {
    const picked =
      selection &&
      days.find(
        (day) => day.phaseNumber === selection.phaseNumber && day.dayIndex === selection.dayIndex
      );
    return picked || days[0] || null;
  }, [days, selection]);

  const exercises = useMemo(
    () => (slot && !slot.isRestDay ? toWorkoutExercises(slot.exercises) : []),
    [slot]
  );

  // A finished log wins over a started one, and a started one over a scheduled slot.
  const log = useMemo(
    () => (logs && uid && slot ? pickProgramDayLog(logs, uid, programId, slot) : null),
    [logs, uid, programId, slot]
  );

  const draftKey =
    uid && slot ? `${uid}:${programId}:p${slot.phaseNumber}:d${slot.dayIndex}` : null;
  const logsReady = logs !== null;
  const logId = log?.id ?? null;

  // The set table for the open day: empty rows, this browser's draft, or the finished log. Only a started
  // workout runs the timer; a scheduled slot shows Start.
  useEffect(() => {
    if (!logsReady || !draftKey) return;
    const store = useWorkoutStore.getState();

    if (exercises.length === 0) {
      store.resetSetLogs();
      return;
    }

    store.initializeSetLogs(exercises, draftKey, {
      completedExercises: isFinishedLog(log) && Array.isArray(log?.exercises) ? log.exercises : undefined,
    });

    if (isStartedLog(log)) {
      const timer = store.workoutTimer;
      if (timer.workoutKey !== draftKey || timer.status === "idle") {
        store.startWorkoutTimer(draftKey, toMillis(log?.timeStartedAt) || undefined);
      }
    } else if (store.workoutTimer.workoutKey === draftKey) {
      store.resetWorkoutTimer();
    }
  }, [logsReady, draftKey, exercises, log]);

  // "Previous" column: the latest earlier session of each exercise (not this day's own log).
  useEffect(() => {
    if (!uid || !logsReady || !draftKey || exercises.length === 0) return;
    let cancelled = false;

    fetchPreviousSets(uid, exercises, logId)
      .catch((error) => {
        console.error("Error loading exercise history for previous sets:", error);
        return EMPTY_PREVIOUS_LOOKUP;
      })
      .then((lookup) => {
        if (!cancelled) setPrevious({ key: draftKey, lookup });
      });

    return () => {
      cancelled = true;
    };
  }, [uid, logsReady, draftKey, exercises, logId]);

  const isRestDay = Boolean(slot?.isRestDay);
  const isInProgress = isStartedLog(log);
  const isCompleted = isFinishedLog(log);
  const canEditSets = isInProgress || (isCompleted && isEditingCompleted);
  const canStart =
    !loadFailed &&
    !busy &&
    !isRestDay &&
    exercises.length > 0 &&
    Boolean(uid) &&
    (!log || isScheduledLog(log));

  /** The open day's set table and "Previous" column are loaded (they reload when another day is picked). */
  const setsReady = logsReady && activeDraftKey === draftKey && previous?.key === draftKey;

  const replaceLog = (next: WorkoutLog) =>
    setLoaded((current) =>
      current
        ? { ...current, logs: [next, ...current.logs.filter((item) => item.id !== next.id)] }
        : current
    );

  const selectDay = (next: DaySelection) => {
    if (isInProgress || busy) return;
    autoFilledRef.current = {};
    setIsEditingCompleted(false);
    setActionError(null);
    setSelection(next);
  };

  const start = async () => {
    if (!uid || !slot || !draftKey || !canStart) return;

    setBusy("starting");
    setActionError(null);
    try {
      const startedAt = new Date();
      // Fills the coach's scheduled slot, or creates the day's log at its rule id.
      const saved = await startProgramDay({
        userId: uid,
        programId,
        day: slot,
        existing: log,
        fields: {
          programName: program.name || "Unknown Program",
          workoutName: workoutNameOf(slot),
          exercises: buildStartedExercises(exercises),
        },
        startedAt,
      });

      // A fresh start drops an old draft; a workout already started elsewhere keeps what was typed here.
      if (isStartedLog(saved) && toMillis(saved.timeStartedAt) === startedAt.getTime()) {
        useWorkoutStore.getState().clearDraftForKey(draftKey);
      }
      autoFilledRef.current = {};
      setIsEditingCompleted(false);
      replaceLog(saved);
    } catch (error) {
      console.error("Error starting workout:", error);
      setActionError("Failed to start the workout. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  /** Finish the workout in progress, or save the edits to a finished one. */
  const save = async () => {
    if (!uid || !slot || !draftKey || exercises.length === 0 || busy) return;
    if (!isInProgress && !(isCompleted && isEditingCompleted)) return;

    setBusy("saving");
    setActionError(null);
    try {
      const store = useWorkoutStore.getState();
      const timer = store.workoutTimer;
      const elapsedMs = timer.workoutKey === draftKey ? getWorkoutTimerElapsedMs(timer) : 0;

      // Only this program's logs, so a save never lands on another program's log.
      const existing =
        log ?? pickProgramDayLog(await fetchProgramLogs(uid, programId), uid, programId, slot);

      const built = buildCompletedWorkout(exercises, store.setLogs);
      const now = new Date();
      const workoutName = workoutNameOf(slot);
      const dateCompleted = existing?.dateCompleted ?? now;

      // Always the same doc for this day: the day's log, else its rule id (saving again updates it).
      const saved = await saveProgramDay({
        userId: uid,
        programId,
        day: slot,
        existing,
        data: {
          dateCompleted,
          programName: program.name || "Unknown Program",
          workoutName,
          timeStartedAt: existing?.timeStartedAt ?? now,
          timeCompletedAt: existing?.timeCompletedAt ?? now,
          totalDuration:
            elapsedMs > 0
              ? Math.max(1, Math.floor(elapsedMs / 1000))
              : (existing?.totalDuration ?? null),
          status: "completed",
          exercises: built.exercisesData,
          totalVolume: built.totalVolume,
          totalSets: built.totalSets,
          totalReps: built.totalReps,
          setsPerMuscleGroup: built.setsPerMuscleGroup,
          personalBests: [],
          notes: null,
          ...(isEditingCompleted ? { editedAt: now } : {}),
        },
      });

      // One exerciseHistory doc per exercise per log; saving again overwrites them.
      await writeExerciseHistory(
        uid,
        saved.id,
        buildExerciseHistoryEntries(
          built.exercisesData,
          workoutName,
          Timestamp.fromDate(toJsDate(dateCompleted) ?? now)
        )
      );

      if (timer.workoutKey === draftKey) store.resetWorkoutTimer();
      store.clearDraftForKey(draftKey);
      autoFilledRef.current = {};
      setIsEditingCompleted(false);
      setSavedSummary(built.setsPerMuscleGroup);
      replaceLog(saved);
    } catch (error) {
      console.error("Error saving workout:", error);
      setActionError("Failed to save the workout. Your entries are still here; please try again.");
    } finally {
      setBusy(null);
    }
  };

  /** Discard the workout in progress: its slot goes back to scheduled (an older random-id log is deleted). */
  const discard = async () => {
    if (!uid || !draftKey || !log || !isInProgress || busy) return;

    setBusy("discarding");
    setActionError(null);
    try {
      const outcome = await discardProgramDay(log.id, uid, programId);
      const store = useWorkoutStore.getState();
      store.clearDraftForKey(draftKey);
      if (store.workoutTimer.workoutKey === draftKey) store.resetWorkoutTimer();
      autoFilledRef.current = {};
      setIsEditingCompleted(false);
      setLoaded((current) => {
        if (!current) return current;
        return {
          ...current,
          logs:
            outcome === "reset"
              ? current.logs.map((item) => (item.id === log.id ? resetToScheduled(item) : item))
              : current.logs.filter((item) => item.id !== log.id),
        };
      });
    } catch (error) {
      console.error("Error discarding workout:", error);
      setActionError("Failed to discard the workout. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const startEditingCompleted = () => {
    if (isCompleted && !busy) setIsEditingCompleted(true);
  };

  const cancelEditingCompleted = () => {
    if (log && Array.isArray(log.exercises)) {
      useWorkoutStore
        .getState()
        .initializeSetLogs(exercises, draftKey, { completedExercises: log.exercises });
    }
    autoFilledRef.current = {};
    setIsEditingCompleted(false);
  };

  const changeSetField = (
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: string
  ) => {
    if (canEditSets) updateSetLog(exerciseIndex.toString(), setIndex, field, value);
  };

  /** Tick or untick a set. Ticking fills empty weight / reps from "Previous"; unticking empties those again. */
  const toggleSetDone = (
    exerciseIndex: number,
    setIndex: number,
    previousSet: PreviousSetEntry | null
  ) => {
    if (!canEditSets) return;
    const exerciseKey = exerciseIndex.toString();
    const fillKey = `${exerciseKey}:${setIndex}`;
    const row: SetLog | undefined = useWorkoutStore.getState().setLogs[exerciseKey]?.[setIndex];
    if (!row) return;
    const nextDone = !row.done;

    if (!nextDone) {
      const marks = autoFilledRef.current[fillKey];
      if (marks?.weight) updateSetLog(exerciseKey, setIndex, "weight", "");
      if (marks?.reps) updateSetLog(exerciseKey, setIndex, "reps", "");
      delete autoFilledRef.current[fillKey];
    } else if (previousSet) {
      const marks = { weight: !row.weight.trim(), reps: !row.reps.trim() };
      if (marks.weight) updateSetLog(exerciseKey, setIndex, "weight", String(previousSet.weight));
      if (marks.reps) updateSetLog(exerciseKey, setIndex, "reps", String(previousSet.reps));
      if (marks.weight || marks.reps) autoFilledRef.current[fillKey] = marks;
      else delete autoFilledRef.current[fillKey];
    }

    updateSetLog(exerciseKey, setIndex, "done", nextDone);
  };

  return {
    days,
    slot,
    exercises,
    log,
    setLogs,
    draftKey,
    previousSets: previous?.key === draftKey ? previous.lookup : EMPTY_PREVIOUS_LOOKUP,
    workoutName: slot ? (typeof log?.workoutName === "string" && log.workoutName.trim()) || workoutNameOf(slot) : "",
    logsReady,
    setsReady,
    loadFailed,
    isRestDay,
    isInProgress,
    isCompleted,
    isEditingCompleted,
    canEditSets,
    canStart,
    busy,
    actionError,
    savedSummary,
    closeSavedSummary: () => setSavedSummary(null),
    selectDay,
    start,
    save,
    discard,
    startEditingCompleted,
    cancelEditingCompleted,
    changeSetField,
    toggleSetDone,
  };
}
