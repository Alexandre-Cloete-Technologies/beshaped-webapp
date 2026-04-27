"use client";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {

    return (
        <div className="flex flex-col items-center justify-center py-20">
            <h2 className="text-xl font-bold">Something went wrong!</h2>
            <p className="text-zinc-600 mb-6">{error.message}</p>
            <button
                onClick={() => reset()} // Next.js will try to re-render the segment
                className="rounded-md bg-zinc-900 px-4 py-2 text-white"
            >
                Try again
            </button>
        </div>
    );
}
