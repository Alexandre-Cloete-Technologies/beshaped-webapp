"use client";

import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiCalendar, FiCheckCircle, FiMoon, FiX } from "react-icons/fi";
import {
  ProgramExerciseCard,
  type ProgramExerciseCardData,
} from "../../components/ProgramExerciseCard";
import { ProtectedNavbar } from "../../components/ProtectedNavbar";
import { db } from "../../../lib/firebase";

type ProgramExercise = ProgramExerciseCardData;

type ProgramWorkout = {
  day: number;
  title: string;
  isRestDay: boolean;
  notes: string[];
  exercises: ProgramExercise[];
};

type ProgramPhase = {
  phase: number;
  information: string[];
  workouts: ProgramWorkout[];
};

type ProgramDetail = {
  id: string;
  name: string;
  description: string;
  phases: ProgramPhase[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
    if (typeof value === "number") {
      return String(value);
    }
  }

  return "";
};

const readNumber = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return 0;
};

const toStringArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => readString(item))
      .filter((item) => item.length > 0);
  }

  const singleValue = readString(value);
  return singleValue ? [singleValue] : [];
};

const readPrimaryMuscles = (value: unknown) => {
  if (Array.isArray(value)) {
    const items = toStringArray(value);
    return items.length > 0 ? items.join(", ") : "General";
  }

  return readString(value) || "General";
};

const readPrimaryMuscle = (value: string | string[] | undefined) => {
  if (Array.isArray(value) && value.length > 0) return value[0] ?? "N/A";
  if (typeof value === "string" && value.trim().length > 0) return value;
  return "N/A";
};

const readSecondaryMuscles = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    const filtered = value
      .filter((muscle) => typeof muscle === "string")
      .map((muscle) => String(muscle).trim())
      .filter((muscle) => muscle.length > 0);
    return filtered.length > 0 ? filtered : ["N/A"];
  }
  if (typeof value === "string" && value.trim().length > 0) return [value];
  return ["N/A"];
};

const readYoutubeUrl = (data: Record<string, unknown> | undefined) => {
  if (!data || typeof data !== "object") return null;
  const url =
    data.videoUrl ?? data.youtubeUrl ?? data.youtubeLink ?? data.video ?? data.youtube;
  if (typeof url === "string" && url.trim().length > 0) return url.trim();
  return null;
};

const getYoutubeEmbedUrl = (url: string): string | null => {
  try {
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
    const shortMatch = url.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    return null;
  } catch {
    return null;
  }
};

const normalizeExercise = (value: unknown, index: number): ProgramExercise | null => {
  if (!isRecord(value)) {
    return null;
  }

  const exerciseName =
    readString(value.exerciseName, value.name, value.title) || `Exercise ${index + 1}`;
  const targetSets = Math.max(1, readNumber(value.targetSets, value.sets, 3) || 3);

  return {
    id: readString(value.id, value.exerciseId) || `exercise-${index + 1}`,
    exerciseName,
    musclesInvolved: readPrimaryMuscles(value.musclesInvolved),
    targetReps: readString(value.targetReps, value.reps, value.repsRange) || "8-12",
    targetSets,
    description: readString(value.description, value.notes),
  };
};

const normalizeWorkout = (value: unknown, index: number): ProgramWorkout | null => {
  if (!isRecord(value)) {
    return null;
  }

  const day = Math.max(1, readNumber(value.day, value.dayNumber, index + 1) || index + 1);
  const exercisesSource = Array.isArray(value.exercises)
    ? value.exercises
    : Array.isArray(value.workout)
      ? value.workout
      : [];

  return {
    day,
    title: readString(value.title, value.name, value.dayName, value.workoutName) || `Day ${day}`,
    isRestDay: Boolean(value.isRestDay),
    notes: toStringArray(value.notes ?? value.instructions),
    exercises: exercisesSource
      .map((exercise, exerciseIndex) => normalizeExercise(exercise, exerciseIndex))
      .filter((exercise): exercise is ProgramExercise => exercise !== null),
  };
};

const normalizePhase = (value: unknown, index: number): ProgramPhase | null => {
  if (!isRecord(value)) {
    return null;
  }

  const workoutsSource = Array.isArray(value.workouts)
    ? value.workouts
    : Array.isArray(value.days)
      ? value.days
      : [];

  return {
    phase: Math.max(1, readNumber(value.phase, value.phaseNumber, value.number, index + 1) || index + 1),
    information: toStringArray(value.information ?? value.phaseInfo ?? value.notes),
    workouts: workoutsSource
      .map((workout, workoutIndex) => normalizeWorkout(workout, workoutIndex))
      .filter((workout): workout is ProgramWorkout => workout !== null),
  };
};

const normalizeProgram = (programId: string, value: unknown): ProgramDetail => {
  const data = isRecord(value) ? value : {};

  const phasesSource = Array.isArray(data.phases)
    ? data.phases
    : Array.isArray(data.workouts)
      ? [{ phase: 1, workouts: data.workouts, information: data.phaseInfo ?? data.notes }]
      : Array.isArray(data.days)
        ? [{ phase: 1, days: data.days, information: data.phaseInfo ?? data.notes }]
        : Array.isArray(data.exercises)
          ? [{ phase: 1, days: [{ day: 1, title: "Day 1", exercises: data.exercises }] }]
          : [];

  const normalizedPhases = phasesSource
    .map((phase, phaseIndex) => normalizePhase(phase, phaseIndex))
    .filter((phase): phase is ProgramPhase => phase !== null);

  return {
    id: programId,
    name: readString(data.name, data.title) || programId,
    description:
      readString(data.description, data.summary) || "Program details will be available soon.",
    phases:
      normalizedPhases.length > 0
        ? normalizedPhases
        : [
            {
              phase: 1,
              information: [],
              workouts: [],
            },
          ],
  };
};

const formatDate = (value: string) => {
  if (!value) {
    return "No date selected";
  }

  const parsed = new Date(`${value}T00:00:00`);
  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function ProgramDetailPage() {
  const params = useParams<{ programId: string }>();
  const programId = Array.isArray(params?.programId) ? params.programId[0] : params?.programId;

  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedPhase, setSelectedPhase] = useState<number>(1);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedDayInWeek, setSelectedDayInWeek] = useState<number>(1);
  const [selectedExerciseInfo, setSelectedExerciseInfo] = useState<ProgramExercise | null>(null);
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [modalExerciseDetail, setModalExerciseDetail] = useState<{
    name: string;
    primaryMuscles: string;
    secondaryMuscles: string[];
    embedUrl: string | null;
  } | null>(null);
  const [modalExerciseLoading, setModalExerciseLoading] = useState(false);

  useEffect(() => {
    if (!selectedExerciseInfo?.id || !isInfoModalVisible) {
      setModalExerciseDetail(null);
      return;
    }

    const fetchExerciseDetail = async () => {
      setModalExerciseLoading(true);
      setModalExerciseDetail(null);
      try {
        const snapshot = await getDoc(doc(db, "exercises", selectedExerciseInfo.id));
        if (!snapshot.exists()) {
          setModalExerciseDetail({
            name: selectedExerciseInfo.exerciseName,
            primaryMuscles: selectedExerciseInfo.musclesInvolved,
            secondaryMuscles: ["N/A"],
            embedUrl: null,
          });
          return;
        }
        const data = snapshot.data();
        const youtubeUrl = readYoutubeUrl(data as Record<string, unknown>);
        setModalExerciseDetail({
          name: (typeof data.name === "string" && data.name.trim() ? data.name : selectedExerciseInfo.exerciseName) as string,
          primaryMuscles: readPrimaryMuscle(data.primaryMuscles),
          secondaryMuscles: readSecondaryMuscles(data.secondaryMuscles),
          embedUrl: youtubeUrl ? getYoutubeEmbedUrl(youtubeUrl) : null,
        });
      } catch {
        setModalExerciseDetail({
          name: selectedExerciseInfo.exerciseName,
          primaryMuscles: selectedExerciseInfo.musclesInvolved,
          secondaryMuscles: ["N/A"],
          embedUrl: null,
        });
      } finally {
        setModalExerciseLoading(false);
      }
    };

    void fetchExerciseDetail();
  }, [selectedExerciseInfo?.id, selectedExerciseInfo?.exerciseName, selectedExerciseInfo?.musclesInvolved, isInfoModalVisible]);

  useEffect(() => {
    if (!programId) {
      return;
    }

    const fetchProgram = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const snapshot = await getDoc(doc(db, "programs", programId));

        if (!snapshot.exists()) {
          setProgram(null);
          setErrorMessage("We couldn't find that program.");
          return;
        }

        setProgram(normalizeProgram(programId, snapshot.data()));
      } catch {
        setErrorMessage("We couldn't load this program right now. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProgram();
  }, [programId]);

  const availablePhases = useMemo(() => program?.phases ?? [], [program]);

  const selectedPhaseData = useMemo(() => {
    if (!availablePhases.length) {
      return null;
    }

    return availablePhases.find((phase) => phase.phase === selectedPhase) ?? availablePhases[0];
  }, [availablePhases, selectedPhase]);

  const availableWeeks = useMemo(() => {
    if (!selectedPhaseData?.workouts.length) {
      return [];
    }
    const maxDay = Math.max(...selectedPhaseData.workouts.map((w) => w.day));
    const weekCount = Math.ceil(maxDay / 7);
    return Array.from({ length: weekCount }, (_, i) => i + 1);
  }, [selectedPhaseData]);

  const selectedOverallDay = (selectedWeek - 1) * 7 + selectedDayInWeek;

  const selectedWorkout = useMemo(() => {
    if (!selectedPhaseData) {
      return null;
    }

    return (
      selectedPhaseData.workouts.find((workout) => workout.day === selectedOverallDay) ??
      selectedPhaseData.workouts[0] ??
      null
    );
  }, [selectedOverallDay, selectedPhaseData]);

  useEffect(() => {
    if (selectedWorkout && selectedWorkout.day !== selectedOverallDay) {
      setSelectedWeek(Math.ceil(selectedWorkout.day / 7));
      setSelectedDayInWeek(((selectedWorkout.day - 1) % 7) + 1);
    }
  }, [selectedWorkout, selectedOverallDay]);

  useEffect(() => {
    if (availablePhases.length > 0) {
      setSelectedPhase((current) => {
        const nextPhase = availablePhases.find((phase) => phase.phase === current);
        return nextPhase ? current : availablePhases[0].phase;
      });
    }
  }, [availablePhases]);

  useEffect(() => {
    if (selectedPhaseData?.workouts.length && availableWeeks.length) {
      const firstDay = selectedPhaseData.workouts[0].day;
      setSelectedWeek(Math.ceil(firstDay / 7));
      setSelectedDayInWeek(((firstDay - 1) % 7) + 1);
    }
  }, [selectedPhaseData, availableWeeks]);

  return (
    <div className="min-h-screen bg-stone-100">
        <ProtectedNavbar />
        <main className="px-6 py-2">
          <div className="mx-auto max-w-7xl space-y-4">
            {isLoading ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
                Loading program...
              </div>
            ) : null}

            {!isLoading && errorMessage ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
                {errorMessage}
              </div>
            ) : null}

            {!isLoading && !errorMessage && program ? (
              <>
                <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      <Link
                        href="/programs"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 text-zinc-700 transition hover:bg-stone-100"
                        aria-label="Back to programs"
                      >
                        <FiArrowLeft className="h-5 w-5" />
                      </Link>

                      <div>
                        <h1 className="text-3xl font-bold text-zinc-900">{program.name}</h1>
                        <p className="mt-2 max-w-3xl text-zinc-600">{program.description}</p>
                      </div>
                    </div>

                  </div>
                </section>

                <section className="rounded-2xl border border-stone-200 bg-stone-50 p-5 shadow-sm">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
                    <div className="flex-1">
                      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">
                        Phases
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {availablePhases.map((phase) => (
                          <button
                            key={phase.phase}
                            type="button"
                            onClick={() => setSelectedPhase(phase.phase)}
                            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                              phase.phase === selectedPhase
                                ? "border-beshaped-green bg-beshaped-green text-white"
                                : "border-stone-300 bg-white text-zinc-700 hover:bg-stone-100"
                            }`}
                          >
                            Phase {phase.phase}
                          </button>
                        ))}
                      </div>

                      <details className="mt-5 rounded-xl border border-stone-200 bg-white" open>
                        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-zinc-900">
                          Phase information
                        </summary>
                        <div className="border-t border-stone-200 px-4 py-4 text-sm text-zinc-600">
                          {selectedPhaseData?.information.length ? (
                            <div className="space-y-2">
                              {selectedPhaseData.information.map((item) => (
                                <p key={item}>• {item}</p>
                              ))}
                            </div>
                          ) : (
                            <p>No extra phase information is available yet.</p>
                          )}
                        </div>
                      </details>
                    </div>

                    {availableWeeks.length > 0 ? (
                      <div className="lg:min-w-64 lg:border-l lg:border-stone-200 lg:pl-8">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">
                          Weeks & Days
                        </p>
                        <div className="space-y-4">
                          <div>
                            <p className="mb-2 text-xs font-medium text-zinc-600">Week</p>
                            <div className="flex flex-wrap gap-2">
                              {availableWeeks.map((week) => (
                                <button
                                  key={week}
                                  type="button"
                                  onClick={() => {
                                    setSelectedWeek(week);
                                    setSelectedDayInWeek(1);
                                  }}
                                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                                    week === selectedWeek
                                      ? "border-beshaped-green bg-beshaped-green text-white"
                                      : "border-stone-300 bg-white text-zinc-700 hover:bg-stone-100"
                                  }`}
                                >
                                  Week {week}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="mb-2 text-xs font-medium text-zinc-600">
                              Day (Week {selectedWeek})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {[1, 2, 3, 4, 5, 6, 7].map((dayInWeek) => {
                                const overallDay = (selectedWeek - 1) * 7 + dayInWeek;
                                const hasWorkout = selectedPhaseData?.workouts.some(
                                  (w) => w.day === overallDay
                                );
                                return (
                                  <button
                                    key={dayInWeek}
                                    type="button"
                                    onClick={() => setSelectedDayInWeek(dayInWeek)}
                                    disabled={!hasWorkout}
                                    className={`min-w-14 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                                      dayInWeek === selectedDayInWeek
                                        ? "border-beshaped-green bg-beshaped-green text-white"
                                        : hasWorkout
                                          ? "border-stone-300 bg-white text-zinc-700 hover:bg-stone-100"
                                          : "cursor-not-allowed border-stone-200 bg-stone-100 text-zinc-400"
                                    }`}
                                  >
                                    Day {dayInWeek}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </section>

                {selectedWorkout?.isRestDay ? (
                  <section className="rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-sm">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-stone-100 text-zinc-500">
                      <FiMoon className="h-10 w-10" />
                    </div>
                    <h2 className="mt-5 text-2xl font-semibold text-zinc-900">Rest Day</h2>
                    <p className="mt-3 text-zinc-600">
                      Take it easy today. Recovery is just as important as training.
                    </p>
                  </section>
                ) : null}

                {!selectedWorkout?.isRestDay && selectedWorkout ? (
                  <section className="space-y-5">
                    <h2 className="text-xl font-semibold text-zinc-900">
                      {selectedWorkout.title}
                    </h2>
                    {selectedWorkout.notes.length ? (
                      <div className="rounded-2xl border border-beshaped-green/30 bg-beshaped-green/10 p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                          <FiCheckCircle className="mt-0.5 h-5 w-5 text-beshaped-green" />
                          <div className="space-y-1 text-sm text-zinc-700">
                            <p className="font-semibold text-beshaped-green">Workout notes</p>
                            {selectedWorkout.notes.map((note) => (
                              <p key={note}>{note}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {selectedWorkout.exercises.length > 0 ? (
                      selectedWorkout.exercises.map((exercise, exerciseIndex) => {
                        const exerciseKey = `${selectedPhase}-${selectedOverallDay}-${exerciseIndex}-${exercise.id || "ex"}`;

                        return (
                          <ProgramExerciseCard
                            key={exerciseKey}
                            exercise={exercise}
                            exerciseIndex={exerciseIndex}
                            onViewDetails={(selectedExercise) => {
                              setSelectedExerciseInfo(selectedExercise);
                              setInfoModalVisible(true);
                            }}
                          />
                        );
                      })
                    ) : (
                      <p className="rounded-2xl border border-stone-200 bg-white p-6 text-zinc-600 shadow-sm">
                        No exercises assigned to this workout yet.
                      </p>
                    )}
                  </section>
                ) : null}

                <section className="flex gap-3">
                  <Link
                    href="/programs"
                    className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-stone-100"
                  >
                    Back to Programs
                  </Link>
                  <Link
                    href="/exercises"
                    className="rounded-md bg-beshaped-green px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Browse Exercises
                  </Link>
                </section>
              </>
            ) : null}
          </div>
        </main>

        {isInfoModalVisible && selectedExerciseInfo ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => {
              setInfoModalVisible(false);
              setSelectedExerciseInfo(null);
              setModalExerciseDetail(null);
            }}
          >
            <div
              className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-stone-200 px-6 py-5">
                <h2 className="text-xl font-semibold text-zinc-900">Exercise details</h2>
                <button
                  type="button"
                  onClick={() => {
                    setInfoModalVisible(false);
                    setSelectedExerciseInfo(null);
                    setModalExerciseDetail(null);
                  }}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-300 text-zinc-600 transition hover:bg-stone-100"
                  aria-label="Close exercise info"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-y-auto px-6 py-6">
                {modalExerciseLoading ? (
                  <div className="flex items-center justify-center py-16 text-zinc-500">
                    Loading exercise...
                  </div>
                ) : (
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
                    <div className="flex-1 min-w-0 space-y-5">
                      <div>
                        <h3 className="text-2xl font-bold text-zinc-900">
                          {modalExerciseDetail?.name ?? selectedExerciseInfo.exerciseName}
                        </h3>
                        <div className="mt-3 flex flex-col gap-1">
                          <p className="text-zinc-600">
                            <span className="font-medium">Primary muscle:</span>{" "}
                            {modalExerciseDetail?.primaryMuscles ?? selectedExerciseInfo.musclesInvolved}
                          </p>
                          <p className="text-zinc-600">
                            <span className="font-medium">Secondary muscles:</span>{" "}
                            {modalExerciseDetail?.secondaryMuscles?.join(", ") ?? "N/A"}
                          </p>
                        </div>
                      </div>

                      <p className="text-zinc-600">
                        {selectedExerciseInfo.description ||
                          "Add form tips, reps, sets, and progression rules here."}
                      </p>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                            Target reps
                          </p>
                          <p className="mt-2 text-lg font-semibold text-zinc-900">
                            {selectedExerciseInfo.targetReps}
                          </p>
                        </div>
                        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                            Target sets
                          </p>
                          <p className="mt-2 text-lg font-semibold text-zinc-900">
                            {selectedExerciseInfo.targetSets}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/exercises/${selectedExerciseInfo.id}`}
                          className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-stone-100"
                        >
                          Open Exercise Page
                        </Link>
                        <Link
                          href="/exercises"
                          className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-stone-100"
                        >
                          Back to Exercises
                        </Link>
                        <Link
                          href="/programs"
                          className="rounded-md bg-beshaped-green px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                          View Programs
                        </Link>
                      </div>

                      {modalExerciseDetail?.embedUrl ? (
                        <div className="border-t border-stone-200 pt-6">
                          <h4 className="text-lg font-semibold text-zinc-900">Video tutorial</h4>
                          <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl border border-stone-200">
                            <iframe
                              src={modalExerciseDetail.embedUrl}
                              title="Exercise video tutorial"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="h-full w-full"
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="shrink-0">
                      <img
                        src="/00321201-Barbell-Deadlift_Hips-FIX.gif"
                        alt="Exercise demonstration"
                        className="rounded-xl border border-stone-200 object-cover max-w-[280px] w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
  );
}
