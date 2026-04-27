"use client";

import type { ProgramPhase } from "../types/programTypes";


type PhaseSelectorProps = {
    phases: ProgramPhase[];
    selectedPhase: number;
    onPhaseChange: (phase: number) => void;
};

/**
 * Client Component - Phase selector with tabs
 */
export function PhaseSelector({ phases, selectedPhase, onPhaseChange }: PhaseSelectorProps) {
    if (phases.length <= 1) {
        return null;
    }

    return (
        <div className="space-y-3">
            <p className="text-xs font-medium text-zinc-600">Phase</p>
            <div className="flex flex-wrap gap-2">
                {phases.map((phase, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => onPhaseChange(phase.order)}
                        className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${phase.order === selectedPhase
                            ? "border-beshaped-green bg-beshaped-green text-white"
                            : "border-stone-300 bg-white text-zinc-700 hover:bg-stone-100"
                            }`}
                    >
                        Phase {phase.order + 1}
                    </button>
                ))}
            </div>
        </div>
    );
}