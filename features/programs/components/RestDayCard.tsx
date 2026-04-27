import { FiMoon } from "react-icons/fi";

export default function RestDayCard() {
    return (
        <section className="rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-stone-100 text-zinc-500">
                <FiMoon className="h-10 w-10" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-zinc-900">Rest Day</h2>
            <p className="mt-3 text-zinc-600">
                Take it easy today. Recovery is just as important as training.
            </p>
        </section>
    );
}