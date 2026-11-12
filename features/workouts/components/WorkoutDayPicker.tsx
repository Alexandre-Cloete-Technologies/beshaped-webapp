"use client";

import { weekAndDayFromIndex, type ProgramDaySlot } from "../utils/program-days";
import type { DaySelection } from "../hooks/useProgramWorkout";

type WorkoutDayPickerProps = {
  days: ProgramDaySlot[];
  selected: ProgramDaySlot;
  onSelect: (selection: DaySelection) => void;
};

const pill = (isSelected: boolean) =>
  `min-h-11 rounded-full px-4 text-sm font-semibold transition ${
    isSelected
      ? "bg-beshaped-dark-green text-white"
      : "border border-stone-300 bg-white text-zinc-700 hover:bg-stone-100"
  }`;

const label = "text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500";

/** Phase, week and day pills. Picking a phase or a week opens its first day. */
export function WorkoutDayPicker({ days, selected, onSelect }: WorkoutDayPickerProps) {
  const phases = [...new Set(days.map((day) => day.phaseNumber))].sort((a, b) => a - b);
  const phaseDays = days.filter((day) => day.phaseNumber === selected.phaseNumber);
  const weeks = [...new Set(phaseDays.map((day) => day.weekNumber))].sort((a, b) => a - b);
  const weekDays = phaseDays.filter((day) => day.weekNumber === selected.weekNumber);

  const openFirst = (candidates: ProgramDaySlot[]) => {
    const first = candidates[0];
    if (first) onSelect({ phaseNumber: first.phaseNumber, dayIndex: first.dayIndex });
  };

  return (
    <section
      aria-label="Select workout"
      className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
    >
      {phases.length > 1 && (
        <div className="space-y-2">
          <p className={label}>Phase</p>
          <div className="flex flex-wrap gap-2">
            {phases.map((phase) => (
              <button
                key={phase}
                type="button"
                aria-pressed={phase === selected.phaseNumber}
                className={pill(phase === selected.phaseNumber)}
                onClick={() => openFirst(days.filter((day) => day.phaseNumber === phase))}
              >
                Phase {phase}
              </button>
            ))}
          </div>
        </div>
      )}

      {weeks.length > 1 && (
        <div className="space-y-2">
          <p className={label}>Week</p>
          <div className="flex flex-wrap gap-2">
            {weeks.map((week) => (
              <button
                key={week}
                type="button"
                aria-pressed={week === selected.weekNumber}
                className={pill(week === selected.weekNumber)}
                onClick={() => openFirst(phaseDays.filter((day) => day.weekNumber === week))}
              >
                Week {week}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className={label}>Day</p>
        <div className="flex flex-wrap gap-2">
          {weekDays.map((day) => (
            <button
              key={day.dayIndex}
              type="button"
              aria-pressed={day.dayIndex === selected.dayIndex}
              className={pill(day.dayIndex === selected.dayIndex)}
              onClick={() => onSelect({ phaseNumber: day.phaseNumber, dayIndex: day.dayIndex })}
            >
              Day {weekAndDayFromIndex(day.dayIndex).dayNumber}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
