import { Timestamp } from 'firebase/firestore';

/**
 * Exercise instructions breakdown
 */
export type ExerciseInstructions = {
  setup: string;
  posture?: string;
  execution: string;
  breathing?: string;
  control?: string;
};

/**
 * Exercise document from Firestore
 * Collection: exercises/{exerciseId}
 */
export type Exercise = {
  name: string;
  description: string;
  difficulty: string;
  equipment: string;
  instructions: ExerciseInstructions;
  videoUrl: string;
  thumbnailUrl: string;
  anatomicalIllustration: string;
  anatomyExerciseWalkthrough: string;
  muscleGroup: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  tips: string[];
  createdAt: Timestamp;
  createdBy: string;
};

/**
 * Exercise with Firestore document ID included
 */
export type ExerciseWithId = Exercise & {
  id: string;
};

/**
 * Partial exercise for updates
 */
export type ExerciseUpdate = Partial<Exercise>;

/**
 * Exercise creation payload (without createdAt)
 */
export type ExerciseCreate = Omit<Exercise, 'createdAt'> & {
  createdAt?: Timestamp;
};