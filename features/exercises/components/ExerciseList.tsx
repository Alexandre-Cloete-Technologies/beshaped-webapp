"use client";
import { ExerciseCard } from "@/components/ExerciseCard";
import { use } from "react";
import { Exercise } from "../types/exerciseTypes";

interface ExerciseListProps {
    exercisesPromise: Promise<Exercise[]>
}

export function ExerciseList({ exercisesPromise }: ExerciseListProps) {
    const exercises = use(exercisesPromise);

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {exercises.map((ex) => (
                <ExerciseCard key={ex.id} {...ex} />
            ))}
        </div>
    );
}
