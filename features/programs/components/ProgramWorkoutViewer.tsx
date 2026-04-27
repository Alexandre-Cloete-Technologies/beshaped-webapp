"use client";

import { useProgramSelection } from "../hooks/useProgramSelection";
import { useExerciseModal } from "../hooks/useExerciseModal";
import { PhaseSelector } from "./PhaseSelector";
import { WeekSelector } from "./WeekSelector";
import { DaySelector } from "./DaySelector";
import { PhaseInfo } from "./PhaseInfo";
import { WorkoutNotes } from "./WorkoutNotes";
import type { Program } from "../types/programTypes";
import { ExerciseList } from "./ExerciseList";
import { ExerciseDetailModal } from "./ExerciseDetailModal";
import RestDayCard from "./RestDayCard";


type ProgramWorkoutViewerProps = {
    program: Program;
};

export function ProgramWorkoutViewer({ program }: ProgramWorkoutViewerProps) {
    const {
        selectedPhase,
        selectedWeek,
        selectedDayInWeek,
        selectedOverallDay,
        selectedPhaseData,
        selectedWorkout,
        availableWeeks,
        handlePhaseChange,
        handleWeekChange,
        handleDayChange,
    } = useProgramSelection({ phases: program.phases });

    const {
        isInfoModalVisible,
        selectedExerciseId,
        modalExerciseDetail,
        modalExerciseLoading,
        openModal,
        closeModal,
    } = useExerciseModal();

    if (!selectedPhaseData) {
        return (
            <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
                <p className="text-zinc-600">No workout data available for this program.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Navigation Section */}
            <section className="space-y-5">
                <h2 className="text-xl font-semibold text-zinc-900">Select workout</h2>


                {/* Selection Controls */}
                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                    <div className="space-y-6">
                        <PhaseSelector
                            phases={program.phases}
                            selectedPhase={selectedPhase}
                            onPhaseChange={handlePhaseChange}
                        />

                        {availableWeeks.length > 1 && (
                            <div className="space-y-6">
                                <WeekSelector
                                    availableWeeks={availableWeeks}
                                    selectedWeek={selectedWeek}
                                    onWeekChange={handleWeekChange}
                                />
                                <DaySelector
                                    selectedWeek={selectedWeek}
                                    selectedDayInWeek={selectedDayInWeek}
                                    workouts={selectedPhaseData.workouts}
                                    onDayChange={handleDayChange}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <PhaseInfo
                    phaseNumber={selectedPhaseData.order}
                    description={selectedPhaseData.description}
                />
            </section>

            {/* Workout Content */}
            {selectedWorkout?.isRestDay && <RestDayCard />}

            {!selectedWorkout?.isRestDay && selectedWorkout && (
                <section className="space-y-5">
                    <h2 className="text-xl font-semibold text-zinc-900">
                        {selectedWorkout.workoutName}
                    </h2>

                    {selectedWorkout.description && <WorkoutNotes notes={selectedWorkout.description} />}

                    <ExerciseList
                        exercises={selectedWorkout.exercises}
                        selectedPhase={selectedPhase}
                        selectedOverallDay={selectedOverallDay}
                        onViewDetails={openModal}
                    />
                </section>
            )}

            {/* Exercise Detail Modal */}
            <ExerciseDetailModal
                isVisible={isInfoModalVisible}
                selectedExerciseId={selectedExerciseId}
                exerciseDetail={modalExerciseDetail}
                isLoading={modalExerciseLoading}
                onClose={closeModal}
            />
        </div>
    );
}