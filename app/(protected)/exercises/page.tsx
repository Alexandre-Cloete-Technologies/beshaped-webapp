import { requireAuth } from "@/features/auth/api/getServerAuth";
import { ExerciseLibrary } from "@/features/exercises/components/ExerciseLibrary";

export default async function ExercisesPage() {
  await requireAuth();

  return <ExerciseLibrary />;
}
