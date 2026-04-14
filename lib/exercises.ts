import { fetchDocument, fetchDocumentWithId } from './fetchDocument';
import type { Exercise, ExerciseWithId } from '@/types/exercise';

/**
 * Fetch a single exercise by ID
 * @param exerciseId - The exercise document ID
 * @returns Exercise data or null if not found
 */
export async function fetchExercise(exerciseId: string): Promise<Exercise | null> {
  return fetchDocument<Exercise>('exercises', exerciseId);
}

/**
 * Fetch a single exercise by ID with document ID included
 * @param exerciseId - The exercise document ID
 * @returns Exercise data with id or null if not found
 */
export async function fetchExerciseWithId(exerciseId: string): Promise<ExerciseWithId | null> {
  return fetchDocumentWithId<Exercise>('exercises', exerciseId);
}