import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

interface ProgramHeaderProps {
    name: string;
    description: string;
};


export function ProgramHeader({ name, description }: ProgramHeaderProps) {
    return (
        <header className="space-y-4 border-b border-stone-200 bg-white p-5 shadow-sm rounded-2xl">
            <Link
                href="/programs"
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
                <FiArrowLeft className="h-4 w-4" />
                Back to programs
            </Link>
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">{name}</h1>
                {description && (
                    <p className="text-base leading-relaxed text-zinc-600 sm:text-lg">
                        {description}
                    </p>
                )}
            </div>
        </header>
    );
}