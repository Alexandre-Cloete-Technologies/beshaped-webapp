"use client";

import { FallbackProps } from "react-error-boundary";

export function ListErrorFallback({ error, resetErrorBoundary }: FallbackProps) {

    const displayError =
        error instanceof Error ? error.message : "An unknown error occurred.";

    return (
        <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-center">
            <h3 className="text-lg font-semibold text-red-800">Oops!</h3>
            <p className="text-red-600 mb-4">{displayError}</p>
            <button
                onClick={resetErrorBoundary}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
                Try Again
            </button>
        </div>
    );
}
