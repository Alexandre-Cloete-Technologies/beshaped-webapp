"use client";

import { useEffect, useState } from "react";
import {
    calculateAvailableWeeks,
    findWorkoutByWeekDay,
    validateWorkoutSelection,
} from "../utils/workoutSelection.utils";
import { ProgramPhase } from "../types/programTypes";

type UseProgramSelectionProps = {
    phases: ProgramPhase[];
};

/**
 * Manages phase / week / day selection for the program viewer.
 *
 * A program day is (phaseOrder, weekNumber, dayNumber) where weekNumber is
 * 1…durationWeeks restarting each phase, and dayNumber is 1–7 restarting
 * each week — matching how the coach portal writes and the mobile app reads.
 */
export function useProgramSelection({ phases }: UseProgramSelectionProps) {
    const [selectedPhaseOrder, setSelectedPhaseOrder] = useState(phases[0]?.order ?? 0);
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [selectedDayInWeek, setSelectedDayInWeek] = useState(1);

    // Resolve current phase data.
    const selectedPhaseData =
        phases.find((p) => p.order === selectedPhaseOrder) ?? phases[0];

    const availableWeeks = selectedPhaseData
        ? calculateAvailableWeeks(selectedPhaseData)
        : [];

    // Resolve the workout for the current selection.
    const selectedWorkout = selectedPhaseData
        ? findWorkoutByWeekDay(
              selectedPhaseData.workouts,
              selectedWeek,
              selectedDayInWeek
          )
        : undefined;

    // When the phase changes, snap week/day back to a valid position.
    useEffect(() => {
        if (!selectedPhaseData) return;
        const validated = validateWorkoutSelection(
            phases,
            selectedPhaseOrder,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPhaseOrder, phases]);

    const handlePhaseChange = (phaseOrder: number) => {
        setSelectedPhaseOrder(phaseOrder);
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
        selectedPhase: selectedPhaseOrder,
        selectedWeek,
        selectedDayInWeek,
        selectedPhaseData,
        selectedWorkout,
        availableWeeks,
        handlePhaseChange,
        handleWeekChange,
        handleDayChange,
    };
}
