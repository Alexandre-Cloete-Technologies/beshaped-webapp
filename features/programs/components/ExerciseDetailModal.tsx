"use client";

import { FiX } from "react-icons/fi";
import OptimizedImage from "@/components/OptimizedImage";
import { Exercise } from "@/features/exercises/types/exerciseTypes";

type ExerciseDetailModalProps = {
    isVisible: boolean;
    selectedExerciseId: string | null;
    exerciseDetail: Exercise | null;
    isLoading: boolean;
    onClose: () => void;
};


export function ExerciseDetailModal({
    isVisible,
    selectedExerciseId,
    exerciseDetail,
    isLoading,
    onClose,
}: ExerciseDetailModalProps) {
    if (!isVisible || !selectedExerciseId) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={onClose}
        >
            <div
                className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between border-b border-stone-200 px-6 py-5">
                    <h2 className="text-xl font-semibold text-zinc-900">Exercise details</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-300 text-zinc-600 transition hover:bg-stone-100"
                        aria-label="Close exercise info"
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                </div>

                <div className="overflow-y-auto px-6 py-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16 text-zinc-500">
                            Loading exercise...
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
                            <div className="min-w-0 flex-1 space-y-5">
                                <div>
                                    <h3 className="text-2xl font-bold text-zinc-900">
                                        {exerciseDetail?.name}
                                    </h3>
                                    <div className="mt-3 flex flex-col gap-1">
                                        <p className="text-zinc-600">
                                            <span className="font-medium">Primary muscle:</span>{" "}
                                            {exerciseDetail?.primaryMuscles}
                                        </p>
                                        <p className="text-zinc-600">
                                            <span className="font-medium">Secondary muscles:</span>{" "}
                                            {exerciseDetail?.secondaryMuscles?.join(", ") ?? "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {exerciseDetail?.anatomyExerciseWalkthrough && (
                                <div className="shrink-0">
                                    <OptimizedImage
                                        src={exerciseDetail.anatomyExerciseWalkthrough}
                                        width={280}
                                        height={280}
                                        alt="Exercise demonstration"
                                        className="w-full max-w-[280px] rounded-xl border border-stone-200 object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}