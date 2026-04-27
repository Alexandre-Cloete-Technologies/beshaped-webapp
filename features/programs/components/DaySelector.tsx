"use client";

import type { Workout } from "../types/programTypes";

interface DaySelectorProps {
    selectedWeek: number;
    selectedDayInWeek: number;
    workouts: Workout[];
    onDayChange: (dayInWeek: number) => void;
};


export function DaySelector({
    selectedWeek,
    selectedDayInWeek,
    workouts,
    onDayChange,
}: DaySelectorProps) {
    return (
        <div className="space-y-3">
            <p className="mb-2 text-xs font-medium text-zinc-600">
                Day (Week {selectedWeek})
            </p>
            <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((dayInWeek) => {
                    const overallDay = (selectedWeek - 1) * 7 + dayInWeek;
                    const hasWorkout = workouts.some((w) => w.dayNumber === overallDay);

                    return (
                        <button
                            key={dayInWeek}
                            type="button"
                            onClick={() => onDayChange(dayInWeek)}
                            disabled={!hasWorkout}
                            className={`min-w-14 rounded-xl border px-3 py-2 text-sm font-semibold transition ${dayInWeek === selectedDayInWeek
                                ? "border-beshaped-green bg-beshaped-green text-white"
                                : hasWorkout
                                    ? "border-stone-300 bg-white text-zinc-700 hover:bg-stone-100"
                                    : "cursor-not-allowed border-stone-200 bg-stone-100 text-zinc-400"
                                }`}
                        >
                            Day {dayInWeek}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}