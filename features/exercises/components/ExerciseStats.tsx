"use client";
import { use } from "react";
import { Exercise } from "../types/exerciseTypes";

export function ExerciseStats({ promise }: { promise: Promise<Exercise[]> }) {
    const exercises = use(promise);
    return (
        <div className="rounded-lg border border-stone-200 bg-white px-4 py-2">
            <p className="text-xs text-zinc-500">Total Exercises</p>
            <p className="text-lg font-bold text-zinc-900">{exercises.length}</p>
        </div>
    );
}
