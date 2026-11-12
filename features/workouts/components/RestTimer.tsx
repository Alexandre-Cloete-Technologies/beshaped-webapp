"use client";

import { useEffect, useState } from "react";
import { FiClock, FiX } from "react-icons/fi";
import { formatTimerDuration } from "../utils/format";

const DEFAULT_DURATION_MS = 2 * 60 * 1000;
const STEP_MS = 15 * 1000;

type TimerState =
  | { status: "idle" }
  | { status: "running"; endsAt: number }
  | { status: "paused"; remainingMs: number };

const adjustButton =
  "min-h-11 rounded-full border border-stone-300 px-4 text-sm font-semibold text-zinc-700 transition hover:bg-stone-100 disabled:opacity-40";

/**
 * The member's own countdown between sets (the app's "Clock"). The button shows the time left while it runs,
 * and the countdown keeps going with the dialog closed.
 */
export function RestTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [durationMs, setDurationMs] = useState(DEFAULT_DURATION_MS);
  const [timer, setTimer] = useState<TimerState>({ status: "idle" });
  const [now, setNow] = useState(0);

  const endsAt = timer.status === "running" ? timer.endsAt : null;

  useEffect(() => {
    if (endsAt === null) return;
    const intervalId = setInterval(() => {
      const current = Date.now();
      if (current >= endsAt) setTimer({ status: "idle" });
      else setNow(current);
    }, 250);
    return () => clearInterval(intervalId);
  }, [endsAt]);

  const remainingMs =
    timer.status === "running"
      ? Math.min(durationMs, Math.max(0, timer.endsAt - now))
      : timer.status === "paused"
        ? timer.remainingMs
        : durationMs;

  const adjust = (deltaMs: number) => {
    if (timer.status !== "idle") return;
    setDurationMs((current) => Math.max(STEP_MS, current + deltaMs));
  };

  const primaryAction = () => {
    if (timer.status === "running") {
      setTimer({ status: "paused", remainingMs });
      return;
    }
    const current = Date.now();
    setNow(current);
    setTimer({ status: "running", endsAt: current + remainingMs });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-stone-100"
      >
        <FiClock className="h-4 w-4" />
        <span className="tabular-nums">
          {timer.status === "idle" ? "Rest timer" : formatTimerDuration(remainingMs)}
        </span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Rest timer"
            className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">Rest timer</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 text-zinc-600 transition hover:bg-stone-100"
                aria-label="Close rest timer"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                className={adjustButton}
                disabled={timer.status !== "idle"}
                onClick={() => adjust(-STEP_MS)}
              >
                -15s
              </button>
              <p
                className="text-5xl font-bold tabular-nums text-zinc-900"
                role="timer"
                aria-live="off"
              >
                {formatTimerDuration(remainingMs)}
              </p>
              <button
                type="button"
                className={adjustButton}
                disabled={timer.status !== "idle"}
                onClick={() => adjust(STEP_MS)}
              >
                +15s
              </button>
            </div>

            <button
              type="button"
              onClick={primaryAction}
              className="mt-6 min-h-11 w-full rounded-md bg-beshaped-dark-green px-4 text-sm font-semibold text-white transition hover:bg-beshaped-green"
            >
              {timer.status === "running" ? "Pause" : timer.status === "paused" ? "Resume" : "Start"}
            </button>
            {timer.status !== "idle" && (
              <button
                type="button"
                onClick={() => setTimer({ status: "idle" })}
                className="mt-2 min-h-11 w-full rounded-md px-4 text-sm font-semibold text-zinc-600 transition hover:bg-stone-100"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
