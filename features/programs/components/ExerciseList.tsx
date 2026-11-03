"use client";

import { ProgramExerciseCard } from "@/features/programs/components/ProgramExerciseCard";
import { ProgramExercise } from "../types/programTypes";

type ExerciseListProps = {
    exercises: ProgramExercise[];
    selectedPhase: number;
    selectedWeek: number;
    selectedDayInWeek: number;
    onViewDetails: (exerciseId: string) => void;
};


export function ExerciseList({
    exercises,
    selectedPhase,
    selectedWeek,
    selectedDayInWeek,
    onViewDetails,
}: ExerciseListProps) {
    if (!exercises || exercises.length === 0) {
        return (
            <p className="rounded-2xl border border-stone-200 bg-white p-6 text-zinc-600 shadow-sm">
                No exercises assigned to this workout yet.
            </p>
        );
    }

    return (
        <>
            {exercises.map((exercise, exerciseIndex) => {
                const exerciseKey = `${selectedPhase}-w${selectedWeek}d${selectedDayInWeek}-${exerciseIndex}-${exercise.exerciseId}`;

                return (
                    <ProgramExerciseCard
                        key={exerciseKey}
                        exercise={exercise}
                        onViewExerciseDetails={onViewDetails}
                    />
                );
            })}
        </>
    );
}
