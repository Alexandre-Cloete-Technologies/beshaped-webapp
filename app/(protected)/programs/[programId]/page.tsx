

import { getProgramById } from "@/features/programs/api/getPrograms";
import { ProgramHeader } from "@/features/programs/components/ProgramHeader";
import { ProgramExercise } from "@/features/programs/types/programTypes";
import { ProgramWorkoutViewer } from "@/features/programs/components/ProgramWorkoutViewer";


type ProgramWorkout = {
  day: number
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

  // return readString(value) || "General";
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


const normalizeExercise = (value: unknown, index: number): ProgramExercise | null => {
  if (!isRecord(value)) {
    return null;
  }

  const exerciseName =
    readString(value.exerciseName, value.name, value.title) || `Exercise ${index + 1}`;


  return {
    exerciseId: readString(value.id, value.exerciseId) || `exercise-${index + 1}`,
    exerciseName,
    musclesInvolved: value.musclesInvolved as string[],
    repsRange: readString(value.targetReps, value.reps, value.repsRange) || "8-12",
    sets: value.sets as number,
    notes: value.notes as string,
    order: value.order as number,
    restPeriod: value.restPeriod as string,
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
    information: toStringArray(value.description ?? value.information ?? value.phaseInfo ?? value.notes),
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


interface ProgramDetailPageProps {
  params: Promise<{ programId: string }>;
}


export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const { programId } = await params;
  const program = await getProgramById(programId);
  // const [program, setProgram] = useState<ProgramDetail | null>(null);
  // const [isLoading, setIsLoading] = useState(true);
  // const [errorMessage, setErrorMessage] = useState("");
  // const [selectedPhase, setSelectedPhase] = useState<number>(1);
  // const [selectedWeek, setSelectedWeek] = useState<number>(1);
  // const [selectedDayInWeek, setSelectedDayInWeek] = useState<number>(1);
  // const [selectedExerciseInfo, setSelectedExerciseInfo] = useState<ProgramExercise | null>(null);
  // const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  // const [modalExerciseDetail, setModalExerciseDetail] = useState<{
  //   name: string;
  //   primaryMuscles: string[];
  //   secondaryMuscles: string[];
  //   anatomyGifUrl: string | null;
  // } | null>(null);
  // const [modalExerciseLoading, setModalExerciseLoading] = useState(false);

  // useEffect(() => {
  //   if (!selectedExerciseInfo?.exerciseId || !isInfoModalVisible) {
  //     setModalExerciseDetail(null);
  //     return;
  //   }

  //   const fetchExerciseDetail = async () => {
  //     setModalExerciseLoading(true);
  //     setModalExerciseDetail(null);
  //     try {
  //       const snapshot = await getDoc(doc(db, "exercises", selectedExerciseInfo.exerciseId));
  //       if (!snapshot.exists()) {
  //         setModalExerciseDetail({
  //           name: selectedExerciseInfo.exerciseName,
  //           primaryMuscles: selectedExerciseInfo.musclesInvolved,
  //           secondaryMuscles: ["N/A"],
  //           anatomyGifUrl: null,
  //         });
  //         return;
  //       }
  //       const data = snapshot.data();

  //       const anatomyGifUrl = await resolveGifUrl(data.anatomyExerciseWalkthrough);
  //       setModalExerciseDetail({
  //         name: (typeof data.name === "string" && data.name.trim() ? data.name : selectedExerciseInfo.exerciseName) as string,
  //         primaryMuscles: data.primaryMuscles,
  //         secondaryMuscles: readSecondaryMuscles(data.secondaryMuscles),
  //         anatomyGifUrl,
  //       });
  //     } catch {
  //       setModalExerciseDetail({
  //         name: selectedExerciseInfo.exerciseName,
  //         primaryMuscles: selectedExerciseInfo.musclesInvolved,
  //         secondaryMuscles: ["N/A"],
  //         anatomyGifUrl: null,
  //       });
  //     } finally {
  //       setModalExerciseLoading(false);
  //     }
  //   };

  //   void fetchExerciseDetail();
  // }, [selectedExerciseInfo?.exerciseId, selectedExerciseInfo?.exerciseName, selectedExerciseInfo?.musclesInvolved, isInfoModalVisible]);

  // useEffect(() => {
  //   if (!programId) {
  //     return;
  //   }

  //   const fetchProgram = async () => {
  //     try {
  //       setIsLoading(true);
  //       setErrorMessage("");

  //       const program = await getProgramById(programId);

  //       if (!program) {
  //         setProgram(null);
  //         setErrorMessage("We couldn't find that program.");
  //         return;
  //       }

  //       setProgram(normalizeProgram(program.id, program));
  //     } catch {
  //       setErrorMessage("We couldn't load this program right now. Please try again.");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   void fetchProgram();
  // }, [programId]);

  // const availablePhases = useMemo(() => program?.phases ?? [], [program]);

  // const selectedPhaseData = useMemo(() => {
  //   if (!availablePhases.length) {
  //     return null;
  //   }

  //   return availablePhases.find((phase) => phase.phase === selectedPhase) ?? availablePhases[0];
  // }, [availablePhases, selectedPhase]);

  // const availableWeeks = useMemo(() => {
  //   if (!selectedPhaseData?.workouts.length) {
  //     return [];
  //   }
  //   const maxDay = Math.max(...selectedPhaseData.workouts.map((w) => w.day));
  //   const weekCount = Math.ceil(maxDay / 7);
  //   return Array.from({ length: weekCount }, (_, i) => i + 1);
  // }, [selectedPhaseData]);

  // const selectedOverallDay = (selectedWeek - 1) * 7 + selectedDayInWeek;

  // const selectedWorkout = useMemo(() => {
  //   if (!selectedPhaseData) {
  //     return null;
  //   }

  //   return (
  //     selectedPhaseData.workouts.find((workout) => workout.day === selectedOverallDay) ??
  //     selectedPhaseData.workouts[0] ??
  //     null
  //   );
  // }, [selectedOverallDay, selectedPhaseData]);

  // useEffect(() => {
  //   if (selectedWorkout && selectedWorkout.day !== selectedOverallDay) {
  //     setSelectedWeek(Math.ceil(selectedWorkout.day / 7));
  //     setSelectedDayInWeek(((selectedWorkout.day - 1) % 7) + 1);
  //   }
  // }, [selectedWorkout, selectedOverallDay]);

  // useEffect(() => {
  //   if (availablePhases.length > 0) {
  //     setSelectedPhase((current) => {
  //       const nextPhase = availablePhases.find((phase) => phase.phase === current);
  //       return nextPhase ? current : availablePhases[0].phase;
  //     });
  //   }
  // }, [availablePhases]);

  // useEffect(() => {
  //   if (selectedPhaseData?.workouts.length && availableWeeks.length) {
  //     const firstDay = selectedPhaseData.workouts[0].day;
  //     setSelectedWeek(Math.ceil(firstDay / 7));
  //     setSelectedDayInWeek(((firstDay - 1) % 7) + 1);
  //   }
  // }, [selectedPhaseData, availableWeeks]);

  return (
    <div className="min-h-screen bg-stone-100">
      <main className="px-6 py-2">
        <div className="mx-auto max-w-7xl space-y-4">




          <ProgramHeader name={program.name} description={program.description} />
          <ProgramWorkoutViewer program={program} />









        </div>
      </main>


    </div>
  );
}
