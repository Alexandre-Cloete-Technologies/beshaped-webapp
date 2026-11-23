"use client";

import { useMemo, useState } from "react";
import { FiCheckCircle, FiX } from "react-icons/fi";
import type { Program } from "@/features/programs/types/programTypes";
import { ExerciseDetailModal } from "@/features/programs/components/ExerciseDetailModal";
import { PhaseInfo } from "@/features/programs/components/PhaseInfo";
import RestDayCard from "@/features/programs/components/RestDayCard";
import { WorkoutNotes } from "@/features/programs/components/WorkoutNotes";
import { useExerciseModal } from "@/features/programs/hooks/useExerciseModal";
import { previousSetsForExercise } from "../api/exercise-history";
import { useProgramWorkout } from "../hooks/useProgramWorkout";
import { formatLongDate, toJsDate } from "../utils/format";
import {
  getPrimaryMusclesForExercises,
  getSetsPerMuscleGroup,
  sortSetsPerMuscleGroup,
} from "../utils/sets-per-muscle";
import { MuscleSetsBars } from "./MuscleSetsBars";
import { RestTimer } from "./RestTimer";
import { WorkoutDayPicker } from "./WorkoutDayPicker";
import { WorkoutExerciseCard } from "./WorkoutExerciseCard";
import { WorkoutStatsBar } from "./WorkoutStatsBar";

const card = "rounded-2xl border border-stone-200 bg-white p-6 shadow-sm";
const primaryButton =
  "inline-flex min-h-11 items-center justify-center rounded-md bg-beshaped-dark-green px-5 text-sm font-semibold text-white transition hover:bg-beshaped-green disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButton =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-stone-300 bg-white px-5 text-sm font-semibold text-zinc-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50";
const dangerButton =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-red-300 bg-white px-5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50";

function formatLogDate(value: unknown): string {
  const date = toJsDate(value);
  return date ? formatLongDate(date) : "a previous date";
}

/**
 * A program's workouts with logging: pick a day, Start, tick off sets, Finish (or Discard), and edit a
 * finished workout. The web counterpart of the mobile program screen.
 */
export function ProgramWorkout({ program: initialProgram }: { program: Program }) {
  // Keep the program this page opened with: a server refresh mid-workout must not rebuild the set table.
  // The page keys this component by program id, so another program gets a fresh one.
  const [program] = useState(initialProgram);
  const workout = useProgramWorkout(program);
  const exerciseInfo = useExerciseModal();
  const {
    slot,
    exercises,
    log,
    setLogs,
    isInProgress,
    isCompleted,
    isEditingCompleted,
    busy,
    savedSummary,
  } = workout;

  const progress = useMemo(() => {
    let completedSets = 0;
    let totalVolume = 0;
    Object.values(setLogs).forEach((rows) =>
      rows.forEach((row) => {
        if (!row.done) return;
        completedSets += 1;
        totalVolume += (Number.parseFloat(row.weight) || 0) * (Number.parseInt(row.reps, 10) || 0);
      })
    );
    return { completedSets, totalVolume };
  }, [setLogs]);

  const liveMuscleRows = useMemo(() => {
    const counts = getSetsPerMuscleGroup(exercises, setLogs);
    return getPrimaryMusclesForExercises(exercises)
      .map((muscle) => ({ muscle, sets: counts[muscle] ?? 0 }))
      .sort((a, b) => b.sets - a.sets || a.muscle.localeCompare(b.muscle));
  }, [exercises, setLogs]);

  if (!slot) {
    return (
      <div className={`${card} text-center`}>
        <p className="text-zinc-600">No workout data available for this program.</p>
      </div>
    );
  }

  if (!workout.logsReady) {
    return (
      <div className={`${card} text-center`} role="status">
        <p className="text-zinc-600">Loading your workout...</p>
      </div>
    );
  }

  const phase = program.phases?.[slot.phaseNumber - 1];
  const completedMuscleRows = sortSetsPerMuscleGroup(log?.setsPerMuscleGroup ?? {});
  const savedMuscleRows = savedSummary ? sortSetsPerMuscleGroup(savedSummary) : [];

  const confirmDiscard = () => {
    const confirmed = window.confirm(
      "Discard workout?\n\nThis will discard the workout you just started and clear any unsaved entries."
    );
    if (confirmed) void workout.discard();
  };

  return (
    <div className="space-y-5">
      {workout.loadFailed && (
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          We couldn&apos;t load your workout history, so logging is switched off. Refresh the page to try again.
        </p>
      )}

      {/* Like the app, the picker is hidden while a workout is in progress. */}
      {!isInProgress && (
        <>
          <WorkoutDayPicker days={workout.days} selected={slot} onSelect={workout.selectDay} />
          {phase?.description && (
            <PhaseInfo phaseNumber={slot.phaseNumber - 1} description={phase.description} />
          )}
        </>
      )}

      <section className="space-y-4" aria-label="Workout">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900">{workout.workoutName}</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Week {slot.weekNumber} Day {slot.dayNumber}
              {isInProgress ? " · In progress" : ""}
            </p>
          </div>

          {!workout.isRestDay && !isCompleted && (
            <div className="flex flex-wrap gap-2">
              {isInProgress ? (
                <>
                  <RestTimer />
                  <button
                    type="button"
                    className={primaryButton}
                    disabled={Boolean(busy)}
                    onClick={() => void workout.save()}
                  >
                    {busy === "saving" ? "Saving..." : "Finish"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={primaryButton}
                  disabled={!workout.canStart}
                  onClick={() => void workout.start()}
                >
                  {busy === "starting" ? "Starting..." : "Start"}
                </button>
              )}
            </div>
          )}
        </div>

        {workout.actionError && (
          <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {workout.actionError}
          </p>
        )}

        {isInProgress && (
          <div className="sticky top-2 z-20 space-y-2">
            <WorkoutStatsBar
              workoutKey={workout.draftKey}
              completedSets={progress.completedSets}
              totalVolume={progress.totalVolume}
            />
          </div>
        )}

        {isCompleted && (
          <div className="flex flex-col gap-4 rounded-2xl border border-beshaped-green/40 bg-beshaped-green/10 p-5 sm:flex-row sm:items-start">
            <FiCheckCircle className="h-6 w-6 shrink-0 text-beshaped-dark-green" />
            <div className="min-w-0 flex-1 space-y-2 text-sm text-zinc-700">
              <p className="text-base font-semibold text-beshaped-dark-green">Workout Completed</p>
              <p>
                You completed this workout on {formatLogDate(log?.dateCompleted)}.{" "}
                {isEditingCompleted ? "Editing is enabled." : "Data is read-only."}
              </p>
              {log?.editedAt && <p>Edited at: {formatLogDate(log.editedAt)}</p>}
              {completedMuscleRows.length > 0 && (
                <ul className="flex flex-wrap gap-2 pt-1">
                  {completedMuscleRows.map(({ muscle, sets }) => (
                    <li
                      key={muscle}
                      className="rounded-full border border-beshaped-green/40 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em] text-zinc-700"
                    >
                      {muscle} · {sets}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {isEditingCompleted ? (
                <>
                  <button
                    type="button"
                    className={primaryButton}
                    disabled={Boolean(busy)}
                    onClick={() => void workout.save()}
                  >
                    {busy === "saving" ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    className={secondaryButton}
                    disabled={Boolean(busy)}
                    onClick={workout.cancelEditingCompleted}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button type="button" className={secondaryButton} onClick={workout.startEditingCompleted}>
                  Edit
                </button>
              )}
            </div>
          </div>
        )}

        {workout.isRestDay ? (
          <RestDayCard />
        ) : !workout.setsReady ? (
          <div className={`${card} text-center`} role="status">
            <p className="text-zinc-600">Loading exercises...</p>
          </div>
        ) : (
          <>
            {slot.description && <WorkoutNotes notes={slot.description} />}

            {exercises.map((exercise, exerciseIndex) => {
              const exerciseId =
                typeof exercise.exerciseId === "string" && exercise.exerciseId.trim()
                  ? exercise.exerciseId.trim()
                  : null;
              return (
                <WorkoutExerciseCard
                  key={exerciseIndex}
                  exercise={exercise}
                  rows={setLogs[exerciseIndex.toString()] ?? []}
                  previousSets={previousSetsForExercise(workout.previousSets, exercise, exerciseIndex)}
                  editable={workout.canEditSets && !busy}
                  onChangeField={(setIndex, field, value) =>
                    workout.changeSetField(exerciseIndex, setIndex, field, value)
                  }
                  onToggleDone={(setIndex, previousSet) =>
                    workout.toggleSetDone(exerciseIndex, setIndex, previousSet)
                  }
                  onShowInfo={exerciseId ? () => exerciseInfo.openModal(exerciseId) : undefined}
                />
              );
            })}

            {isInProgress && (
              <>
                {liveMuscleRows.length > 0 && (
                  <details className={card}>
                    <summary className="cursor-pointer text-sm font-semibold text-zinc-900">
                      Muscle distribution
                    </summary>
                    <div className="mt-4">
                      <MuscleSetsBars rows={liveMuscleRows} />
                    </div>
                  </details>
                )}
                <div className="flex flex-wrap justify-between gap-2">
                  <button
                    type="button"
                    className={dangerButton}
                    disabled={Boolean(busy)}
                    onClick={confirmDiscard}
                  >
                    {busy === "discarding" ? "Discarding..." : "Discard"}
                  </button>
                  <button
                    type="button"
                    className={primaryButton}
                    disabled={Boolean(busy)}
                    onClick={() => void workout.save()}
                  >
                    {busy === "saving" ? "Saving..." : "Finish"}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </section>

      {savedSummary && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={workout.closeSavedSummary}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="workout-saved-title"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="workout-saved-title" className="text-xl font-semibold text-zinc-900">
                  Workout saved
                </h2>
                <p className="mt-1 text-sm text-zinc-600">Sets completed by primary muscle</p>
              </div>
              <button
                type="button"
                onClick={workout.closeSavedSummary}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-stone-300 text-zinc-600 transition hover:bg-stone-100"
                aria-label="Close workout summary"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5">
              {savedMuscleRows.length === 0 ? (
                <p className="text-sm text-zinc-600">No completed sets were logged for this workout.</p>
              ) : (
                <MuscleSetsBars rows={savedMuscleRows} />
              )}
            </div>
            <button
              type="button"
              className={`${primaryButton} mt-6 w-full`}
              onClick={workout.closeSavedSummary}
            >
              Done
            </button>
          </div>
        </div>
      )}

      <ExerciseDetailModal
        isVisible={exerciseInfo.isInfoModalVisible}
        selectedExerciseId={exerciseInfo.selectedExerciseId}
        exerciseDetail={exerciseInfo.modalExerciseDetail}
        isLoading={exerciseInfo.modalExerciseLoading}
        onClose={exerciseInfo.closeModal}
      />
    </div>
  );
}
