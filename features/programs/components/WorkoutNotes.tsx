import { FiCheckCircle } from "react-icons/fi";

interface WorkoutNotesProps {
    notes: string;
};


export function WorkoutNotes({ notes }: WorkoutNotesProps) {
    return (
        <div className="rounded-2xl border border-beshaped-green/30 bg-beshaped-green/10 p-5 shadow-sm">
            <div className="flex items-start gap-3">
                <FiCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-beshaped-green" />
                <div className="space-y-1 text-sm text-zinc-700">
                    <p className="font-semibold text-beshaped-green">Workout notes</p>
                    <p>{notes}</p>
                </div>
            </div>
        </div>
    );
}