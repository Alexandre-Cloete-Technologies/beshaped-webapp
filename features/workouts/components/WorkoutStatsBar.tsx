"use client";

import { useEffect, useState } from "react";
import { FiPause, FiPlay } from "react-icons/fi";
import { getWorkoutTimerElapsedMs, useWorkoutStore } from "../stores/useWorkoutStore";
import { formatWorkoutStatsDuration } from "../utils/format";

type WorkoutStatsBarProps = {
  /** The open day's key; the timer counts only when it belongs to this workout. */
  workoutKey: string | null;
  completedSets: number;
  totalVolume: number;
};

const statLabel = "text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500";
const statValue = "text-lg font-semibold tabular-nums text-zinc-900";

/** Duration (press to pause or resume), volume and sets of the workout in progress. */
export function WorkoutStatsBar({ workoutKey, completedSets, totalVolume }: WorkoutStatsBarProps) {
  const timer = useWorkoutStore((state) => state.workoutTimer);
  const pauseWorkoutTimer = useWorkoutStore((state) => state.pauseWorkoutTimer);
  const resumeWorkoutTimer = useWorkoutStore((state) => state.resumeWorkoutTimer);
  const [now, setNow] = useState(0);

  const isActive = timer.workoutKey === workoutKey && timer.status !== "idle";
  const isRunning = isActive && timer.status === "running";

  useEffect(() => {
    if (!isRunning) return;
    const tick = () => setNow(Date.now());
    const firstTick = setTimeout(tick, 0);
    const intervalId = setInterval(tick, 1000);
    return () => {
      clearTimeout(firstTick);
      clearInterval(intervalId);
    };
  }, [isRunning]);

  // Before the first tick `now` is 0: show the time banked so far, not a negative count.
  const elapsedMs = isActive ? getWorkoutTimerElapsedMs(timer, now || timer.startedAt || 0) : 0;
  const isPaused = isActive && timer.status === "paused";

  return (
    <dl className="grid grid-cols-3 gap-2 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div>
        <dt className={statLabel}>Duration</dt>
        <dd>
          <button
            type="button"
            disabled={!isActive}
            onClick={isPaused ? resumeWorkoutTimer : pauseWorkoutTimer}
            className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-lg font-semibold tabular-nums text-beshaped-dark-green transition hover:bg-stone-100"
            aria-label={isPaused ? "Resume workout timer" : "Pause workout timer"}
          >
            {isPaused ? <FiPlay className="h-4 w-4" /> : <FiPause className="h-4 w-4" />}
            {formatWorkoutStatsDuration(elapsedMs)}
          </button>
        </dd>
      </div>
      <div>
        <dt className={statLabel}>Volume</dt>
        <dd className={`${statValue} flex min-h-11 items-center`}>{Math.round(totalVolume)} kg</dd>
      </div>
      <div>
        <dt className={statLabel}>Sets</dt>
        <dd className={`${statValue} flex min-h-11 items-center`}>{completedSets}</dd>
      </div>
    </dl>
  );
}
