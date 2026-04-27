import { Exercise } from "@/features/exercises/types/exerciseTypes";

export interface Program {
    id: string;
    assignedTo: string;
    coverImage: string;
    createdAt: string;
    createdBy: string;
    daysPerWeek: number;
    description: string;
    isActive: boolean;
    name: string;
    phases: ProgramPhase[];
    price: number | null;
    totalDuration: number;
}

export interface ProgramPhase {
    description: string;
    durationWeeks: number;
    name: string;
    order: number;
    phaseId: string;
    workouts: Workout[];
}

export interface Workout {
    dayNumber: number;
    description: string;
    estimatedDuration: number;
    exercises: ProgramExercise[];
    isRestDay: boolean;
    weekNumber: number;
    workoutId: string;
    workoutName: string;
}

export interface ProgramExercise {
    exerciseId: string;
    exerciseName: string;
    musclesInvolved: string[];
    notes?: string;
    order: number;
    repsRange: string;
    restPeriod: string;
    sets: number;
}

export type ProgramListItem = Pick<Program, "id" | "name" | "description" | "createdAt" >;




