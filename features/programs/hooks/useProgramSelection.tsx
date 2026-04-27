"use client";

import { useEffect, useState } from "react";
import {
    calculateAvailableWeeks,
    calculateOverallDay,
    findWorkoutByDay,
    validateWorkoutSelection,
} from "../utils/workoutSelection.utils";
import { ProgramPhase } from "../types/programTypes";

type UseProgramSelectionProps = {
    phases: ProgramPhase[];
};

/**
 * Custom hook for managing program selection state
 * Handles phase, week, and day selection with validation
 */
export function useProgramSelection({ phases }: UseProgramSelectionProps) {
    const [selectedPhase, setSelectedPhase] = useState(phases[0]?.order ?? 0);
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [selectedDayInWeek, setSelectedDayInWeek] = useState(1);

    // Get current phase data
    const selectedPhaseData = phases.find((p) => p.order === selectedPhase) || phases[0];
    const availableWeeks = selectedPhaseData
        ? calculateAvailableWeeks(selectedPhaseData.workouts)
        : [];

    // Calculate overall day
    const selectedOverallDay = calculateOverallDay(selectedWeek, selectedDayInWeek);

    // Get current workout
    const selectedWorkout = selectedPhaseData
        ? findWorkoutByDay(selectedPhaseData.workouts, selectedOverallDay)
        : undefined;

    // Validate selection when phase changes
    useEffect(() => {
        if (!selectedPhaseData) return;

        const validated = validateWorkoutSelection(
            phases,
            selectedPhase,
            selectedWeek,
            selectedDayInWeek
        );

        if (
            validated.week !== selectedWeek ||
            validated.dayInWeek !== selectedDayInWeek
        ) {
            setSelectedWeek(validated.week);
            setSelectedDayInWeek(validated.dayInWeek);
        }
    }, [selectedPhase, phases]);

    const handlePhaseChange = (phase: number) => {
        setSelectedPhase(phase);
        setSelectedWeek(1);
        setSelectedDayInWeek(1);
    };

    const handleWeekChange = (week: number) => {
        setSelectedWeek(week);
        setSelectedDayInWeek(1);
    };

    const handleDayChange = (dayInWeek: number) => {
        setSelectedDayInWeek(dayInWeek);
    };

    return {
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
    };
}