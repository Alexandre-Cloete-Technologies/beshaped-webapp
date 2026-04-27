export interface Exercise {
    id: string;
    anatomicalIllustration: string;
    anatomyExerciseWalkthrough: string;
    category: string;
    createdAt: string;
    createdBy: string;
    description: string;
    equipment: string;
    instructions: ExerciseInstructions;
    muscleGroup: string;
    musclesInvolved: string[];
    name: string;
    primaryMuscles: string[];
    secondaryMuscles: string[];
    thumbnailUrl: string;
    tips: string[];
    updatedAt?: string;
    videoUrl: string;
}

interface ExerciseInstructions {
    setup: string;
    posture?: string;
    execution: string;
    breathing?: string;
    control?: string;
};

export type ExerciseListItem = Pick<Exercise, "id" | "name" | "primaryMuscles" | "secondaryMuscles">;
export type ExerciseUpdate = Partial<Exercise>;
export type ExerciseCreate = Omit<Exercise, "createdAt" | "updatedAt" | "id">;