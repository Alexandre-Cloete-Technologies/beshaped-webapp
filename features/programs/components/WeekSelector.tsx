"use client";

interface WeekSelectorProps {
    availableWeeks: number[];
    selectedWeek: number;
    onWeekChange: (week: number) => void;
};


export function WeekSelector({ availableWeeks, selectedWeek, onWeekChange }: WeekSelectorProps) {
    if (availableWeeks.length <= 1) {
        return null;
    }

    return (
        <div className="space-y-3">
            <p className="text-xs font-medium text-zinc-600">Week</p>
            <div className="flex flex-wrap gap-2">
                {availableWeeks.map((week) => (
                    <button
                        key={week}
                        type="button"
                        onClick={() => onWeekChange(week)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${week === selectedWeek
                            ? "border-beshaped-green bg-beshaped-green text-white"
                            : "border-stone-300 bg-white text-zinc-700 hover:bg-stone-100"
                            }`}
                    >
                        Week {week}
                    </button>
                ))}
            </div>
        </div>
    );
}