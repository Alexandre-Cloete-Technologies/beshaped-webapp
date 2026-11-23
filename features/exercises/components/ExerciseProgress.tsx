"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { FiAward } from "react-icons/fi";
import { auth } from "@/lib/firebase";
import {
  fetchExerciseProgressPoints,
  filterProgressPointsByMonths,
  formatFullChartDate,
  formatHistorySessionDate,
  formatSetLabel,
  formatWeight,
  getHighlightSetForMetric,
  getPersonalRecordHeaviest,
  type ChartMetric,
  type ExerciseProgressPoint,
} from "../api/exercise-progress";
import { ProgressLineChart } from "./ProgressLineChart";

type ExerciseProgressProps = {
  exerciseId: string;
  exerciseName: string;
};

const CHART_METRICS: { key: ChartMetric; label: string }[] = [
  { key: "heaviestWeight", label: "Heaviest Weight" },
  { key: "bestSetVolume", label: "Best Set Volume" },
  { key: "totalVolume", label: "Total Volume" },
];

const CHART_TIMEFRAMES = [
  { months: 1, label: "Last 1 month" },
  { months: 3, label: "Last 3 months" },
  { months: 12, label: "Last 1 year" },
];

const card = "rounded-2xl border border-stone-200 bg-stone-50 p-6 shadow-sm sm:p-8";
const stateText = "py-10 text-center text-sm text-zinc-600";

function metricDetail(point: ExerciseProgressPoint, metric: ChartMetric): string {
  if (metric === "heaviestWeight") return `Heaviest ${formatWeight(point.heaviestWeight)} kg`;
  if (metric === "bestSetVolume") return `Best set volume ${Math.round(point.bestSetVolume)} kg`;
  return `Session volume ${Math.round(point.totalVolume)} kg`;
}

/**
 * The signed-in member's own numbers for one exercise: a progress chart (three metrics, three timeframes),
 * their personal record and every past session. The web counterpart of the app's exercise screen.
 */
export function ExerciseProgress({ exerciseId, exerciseName }: ExerciseProgressProps) {
  const [authUser] = useAuthState(auth);
  const uid = authUser?.uid ?? null;

  const [loaded, setLoaded] = useState<{
    key: string;
    points: ExerciseProgressPoint[];
    failed: boolean;
    at: number;
  } | null>(null);
  const [metric, setMetric] = useState<ChartMetric>("bestSetVolume");
  const [months, setMonths] = useState(3);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const loadKey = uid ? `${uid}|${exerciseId}` : null;

  useEffect(() => {
    if (!uid || !loadKey) return;
    let cancelled = false;

    fetchExerciseProgressPoints({ userId: uid, exerciseId, exerciseName })
      .then((points) => ({ points, failed: false }))
      .catch((error) => {
        console.error("Failed to load exercise progress", error);
        return { points: [] as ExerciseProgressPoint[], failed: true };
      })
      .then((result) => {
        if (!cancelled) setLoaded({ key: loadKey, at: Date.now(), ...result });
      });

    return () => {
      cancelled = true;
    };
  }, [uid, loadKey, exerciseId, exerciseName]);

  const result = loaded && loaded.key === loadKey ? loaded : null;
  const allPoints = result?.points;

  const chartPoints = useMemo(
    () => (result ? filterProgressPointsByMonths(result.points, months, result.at) : []),
    [result, months]
  );
  const historySessions = useMemo(() => [...(allPoints ?? [])].reverse(), [allPoints]);

  const pickedIndex = hoveredIndex ?? selectedIndex;
  const pickedPoint = pickedIndex !== null ? (chartPoints[pickedIndex] ?? null) : null;
  const headlinePoint = pickedPoint ?? chartPoints.at(-1) ?? null;
  const personalRecord = getPersonalRecordHeaviest(allPoints ?? []);
  const metricLabel = CHART_METRICS.find((option) => option.key === metric)?.label ?? "";

  const clearPick = () => {
    setSelectedIndex(null);
    setHoveredIndex(null);
  };

  return (
    <>
      <section className={card} aria-labelledby="exercise-progress-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="exercise-progress-title" className="text-2xl font-bold text-zinc-900">
              Your progress
            </h2>
            <p className="mt-2 text-3xl font-bold tabular-nums text-zinc-900">
              {!result
                ? "Loading…"
                : headlinePoint
                  ? `${formatWeight(headlinePoint[metric])} kg`
                  : "No data yet"}
            </p>
            <p className="text-sm text-zinc-600">
              {headlinePoint
                ? `${metricLabel} · ${formatFullChartDate(headlinePoint.date)}${
                    headlinePoint.inProgress ? " · In progress" : ""
                  }`
                : metricLabel}
            </p>
          </div>

          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">
            Timeframe
            <select
              value={months}
              onChange={(event) => {
                setMonths(Number(event.target.value));
                clearPick();
              }}
              className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm font-medium normal-case tracking-normal text-zinc-900"
            >
              {CHART_TIMEFRAMES.map((option) => (
                <option key={option.months} value={option.months}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Chart metric">
          {CHART_METRICS.map((option) => (
            <button
              key={option.key}
              type="button"
              aria-pressed={option.key === metric}
              onClick={() => {
                setMetric(option.key);
                clearPick();
              }}
              className={`min-h-11 rounded-full px-4 text-sm font-semibold transition ${
                option.key === metric
                  ? "bg-beshaped-dark-green text-white"
                  : "border border-stone-300 bg-white text-zinc-700 hover:bg-stone-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-stone-200 bg-white p-3">
          {!result ? (
            <p className={stateText} role="status">
              Loading your history...
            </p>
          ) : result.failed ? (
            <p className={stateText} role="alert">
              Couldn&apos;t load progress history.
            </p>
          ) : chartPoints.length === 0 ? (
            <p className={stateText}>
              {result.points.length > 0
                ? "No sessions in this timeframe."
                : "Complete a workout with this exercise to see progress."}
            </p>
          ) : (
            <ProgressLineChart
              title={metricLabel}
              points={chartPoints.map((point) => ({
                key: point.workoutLogId,
                value: point[metric],
                label: point.label,
                description: `${formatFullChartDate(point.date)}: ${formatWeight(point[metric])} kg${
                  point.inProgress ? ", in progress" : ""
                }`,
                inProgress: point.inProgress,
              }))}
              activeIndex={pickedIndex}
              onHover={setHoveredIndex}
              onSelect={setSelectedIndex}
            />
          )}
        </div>

        {pickedPoint ? (
          <div className="mt-3 rounded-xl bg-stone-100 p-4 text-sm text-zinc-700" aria-live="polite">
            <p className="font-semibold text-zinc-900">
              {formatFullChartDate(pickedPoint.date)}
              {pickedPoint.inProgress ? " · In progress" : ""}
            </p>
            <p className="mt-1 text-base font-semibold text-zinc-900">
              {formatSetLabel(getHighlightSetForMetric(pickedPoint, metric))}
            </p>
            <p className="mt-1">{metricDetail(pickedPoint, metric)}</p>
            {pickedPoint.sets.length > 1 && (
              <p className="mt-1">
                All sets:{" "}
                {pickedPoint.sets
                  .map((set) => `${formatWeight(set.weight)}×${Math.round(set.reps)}`)
                  .join(", ")}
              </p>
            )}
          </div>
        ) : (
          chartPoints.length > 0 && (
            <p className="mt-3 text-sm text-zinc-500">Select a point to view weight × reps.</p>
          )
        )}

        <div className="mt-6 border-t border-stone-200 pt-5">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
            <FiAward className="h-5 w-5 text-amber-600" />
            Personal Records
          </h3>
          <dl className="mt-3 flex items-center justify-between text-sm">
            <dt className="text-zinc-600">Heaviest Weight</dt>
            <dd className="text-base font-semibold tabular-nums text-zinc-900">
              {personalRecord > 0 ? `${formatWeight(personalRecord)} kg` : "—"}
            </dd>
          </dl>
        </div>
      </section>

      <section className={card} aria-labelledby="exercise-history-title">
        <h2 id="exercise-history-title" className="text-2xl font-bold text-zinc-900">
          History
        </h2>

        {!result ? (
          <p className={stateText} role="status">
            Loading your history...
          </p>
        ) : result.failed ? (
          <p className={stateText} role="alert">
            Couldn&apos;t load progress history.
          </p>
        ) : historySessions.length === 0 ? (
          <p className={stateText}>Past sessions for this exercise will show up here.</p>
        ) : (
          <ul className="mt-4 space-y-5">
            {historySessions.map((session) => (
              <li key={session.workoutLogId}>
                <table className="w-full overflow-hidden rounded-xl border border-stone-200 bg-white text-sm">
                  <caption className="pb-2 text-left font-semibold text-zinc-900">
                    {formatHistorySessionDate(session.date)}
                    {session.inProgress ? " · In progress" : ""}
                  </caption>
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.08em] text-zinc-500">
                      <th scope="col" className="w-16 px-3 py-2 font-semibold">
                        Set
                      </th>
                      <th scope="col" className="px-3 py-2 font-semibold">
                        Weight &amp; reps
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {session.sets.map((set, setIndex) => (
                      <tr
                        key={`${set.setNumber}-${setIndex}`}
                        className={`border-t border-stone-200 ${setIndex % 2 === 1 ? "bg-stone-50" : ""}`}
                      >
                        <td className="px-3 py-2 tabular-nums text-zinc-700">{set.setNumber}</td>
                        <td className="px-3 py-2 tabular-nums text-zinc-900">
                          {formatWeight(set.weight)} kg x {Math.round(set.reps)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
