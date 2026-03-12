"use client";

import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiCalendar, FiCheckCircle, FiMoon, FiX } from "react-icons/fi";
import { AuthGuard } from "../../components/AuthGuard";
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

const readMuscleGroup = (value: unknown) => {
  if (Array.isArray(value)) {
    return toStringArray(value)[0] ?? "General";
  }

  return readString(value) || "General";
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
    muscleGroup: readMuscleGroup(value.muscleGroup ?? value.primaryMuscles),
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
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedExerciseInfo, setSelectedExerciseInfo] = useState<ProgramExercise | null>(null);
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);

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

  const availableDays = useMemo(
    () => selectedPhaseData?.workouts.map((workout) => workout.day) ?? [],
    [selectedPhaseData],
  );

  const selectedWorkout = useMemo(() => {
    if (!selectedPhaseData) {
      return null;
    }

    return (
      selectedPhaseData.workouts.find((workout) => workout.day === selectedDay) ??
      selectedPhaseData.workouts[0] ??
      null
    );
  }, [selectedDay, selectedPhaseData]);

  useEffect(() => {
    if (availablePhases.length > 0) {
      setSelectedPhase((current) => {
        const nextPhase = availablePhases.find((phase) => phase.phase === current);
        return nextPhase ? current : availablePhases[0].phase;
      });
    }
  }, [availablePhases]);

  useEffect(() => {
    if (selectedPhaseData?.workouts.length) {
      setSelectedDay((current) => {
        const nextDay = selectedPhaseData.workouts.find((workout) => workout.day === current);
        return nextDay ? current : selectedPhaseData.workouts[0].day;
      });
    }
  }, [selectedPhaseData]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-stone-100">
        <ProtectedNavbar />
        <main className="px-6 py-10">
          <div className="mx-auto max-w-7xl space-y-8">
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
                        <button onClick={() => console.log(program)}>See program data</button>
                      </div>
                    </div>


                  </div>
                </section>

                <section className="rounded-2xl border border-stone-200 bg-stone-50 p-5 shadow-sm">
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
                </section>

                {availableDays.length > 1 ? (
                  <section className="rounded-2xl border border-stone-200 bg-stone-50 p-5 shadow-sm">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">
                      Days
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {availableDays.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setSelectedDay(day)}
                          className={`min-w-24 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                            day === selectedDay
                              ? "border-beshaped-green bg-beshaped-green text-white"
                              : "border-stone-300 bg-white text-zinc-700 hover:bg-stone-100"
                          }`}
                        >
                          Day {day}
                        </button>
                      ))}
                    </div>
                  </section>
                ) : null}

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
                        const exerciseKey = `${selectedPhase}-${selectedWorkout.day}-${exerciseIndex}-${exercise.id || "ex"}`;

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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-stone-200 px-6 py-5">
                <div>
                  <h2 className="text-2xl font-semibold text-zinc-900">
                    {selectedExerciseInfo.exerciseName}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Target muscle: {selectedExerciseInfo.muscleGroup}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setInfoModalVisible(false);
                    setSelectedExerciseInfo(null);
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 text-zinc-600 transition hover:bg-stone-100"
                  aria-label="Close exercise info"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 overflow-y-auto px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                    Exercise details
                  </p>
                  <p className="mt-2 text-zinc-700">
                    {selectedExerciseInfo.description || "No extra exercise information is available yet."}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
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
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AuthGuard>
  );
}
