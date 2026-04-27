"use client";

import { use, useMemo, useState } from "react";
import { ProgramListItem } from "../types/programTypes";
import { FiSearch } from "react-icons/fi";
import Link from "next/link";

interface ProgramsListProps {
    programsPromise: Promise<ProgramListItem[]>;
}

export default function ProgramsList({ programsPromise }: ProgramsListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const initialPrograms = use(programsPromise);

    const filteredPrograms = useMemo(() => {
        if (!searchQuery.trim()) return initialPrograms;
        const query = searchQuery.trim().toLowerCase();
        return initialPrograms.filter(
            (program) =>
                program.name.toLowerCase().includes(query) ||
                program.description.toLowerCase().includes(query)
        );
    }, [searchQuery, initialPrograms]);

    return (
        <div className="mb-8 flex flex-col gap-4 sm:items-end sm:justify-between">

            <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search programs..."
                    className="w-full min-w-64 rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-beshaped-green focus:outline-none focus:ring-2 focus:ring-beshaped-green/20 sm:w-72"
                    aria-label="Search programs"
                />
            </div>
            {filteredPrograms.length === 0 ? (
                <p className="rounded-xl border border-stone-200 bg-white px-4 py-8 text-center text-zinc-600">
                    {searchQuery.trim()
                        ? "No programs match your search."
                        : "No programs available yet."}
                </p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {filteredPrograms.map((program) => (
                        <article key={program.id} className="rounded-xl border border-stone-200 bg-stone-50 p-5 shadow-sm">
                            <h2 className="text-xl font-semibold text-zinc-900">{program.name}</h2>
                            <p className="mt-2 text-zinc-600">{program.description}</p>
                            <Link
                                href={`/programs/${program.id}`}
                                className="mt-4 inline-block rounded-md bg-beshaped-dark-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-beshaped-green"
                            >
                                View Program
                            </Link>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}