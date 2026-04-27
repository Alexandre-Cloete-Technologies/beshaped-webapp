
export default function Loading() {
  return (
    <div className="min-h-screen bg-stone-100">

      <main className="px-6 py-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-stone-200 bg-stone-50 p-8 shadow-sm">
          <div className="flex-1 min-w-0">

            {/* Title */}
            <div className="mb-6 h-9 w-64 animate-pulse rounded-md bg-stone-200"></div>

            <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Video Section Skeleton */}
              <div className="aspect-video w-full animate-pulse rounded-xl bg-stone-200"></div>

              {/* Details Section Skeleton */}
              <div className="flex w-full flex-col gap-4">
                {/* Description */}
                <div>
                  <div className="mb-2 h-6 w-32 animate-pulse rounded-md bg-stone-200"></div>
                  <div className="mb-1 h-4 w-full animate-pulse rounded-md bg-stone-200"></div>
                  <div className="mb-1 h-4 w-full animate-pulse rounded-md bg-stone-200"></div>
                  <div className="h-4 w-2/3 animate-pulse rounded-md bg-stone-200"></div>
                </div>

                {/* Equipment */}
                <div>
                  <div className="mb-2 h-5 w-36 animate-pulse rounded-md bg-stone-200"></div>
                  <div className="h-4 w-48 animate-pulse rounded-md bg-stone-200"></div>
                </div>

                {/* Muscle Group */}
                <div>
                  <div className="mb-2 h-5 w-28 animate-pulse rounded-md bg-stone-200"></div>
                  <div className="h-6 w-24 animate-pulse rounded-full bg-stone-200"></div>
                </div>

                {/* Primary Muscles */}
                <div>
                  <div className="mb-2 h-5 w-32 animate-pulse rounded-md bg-stone-200"></div>
                  <div className="flex gap-2">
                    <div className="h-6 w-20 animate-pulse rounded-full bg-stone-200"></div>
                    <div className="h-6 w-24 animate-pulse rounded-full bg-stone-200"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions Section Skeleton */}
            <div className="mt-8 space-y-6">
              <div className="h-8 w-40 animate-pulse rounded-md bg-stone-200"></div>

              <div className="space-y-4">
                {/* Setup */}
                <div>
                  <div className="mb-2 h-6 w-20 animate-pulse rounded-md bg-stone-200"></div>
                  <div className="mb-1 h-4 w-full animate-pulse rounded-md bg-stone-200"></div>
                  <div className="h-4 w-5/6 animate-pulse rounded-md bg-stone-200"></div>
                </div>

                {/* Execution */}
                <div>
                  <div className="mb-2 h-6 w-24 animate-pulse rounded-md bg-stone-200"></div>
                  <div className="mb-1 h-4 w-full animate-pulse rounded-md bg-stone-200"></div>
                  <div className="mb-1 h-4 w-full animate-pulse rounded-md bg-stone-200"></div>
                  <div className="h-4 w-4/5 animate-pulse rounded-md bg-stone-200"></div>
                </div>
              </div>
            </div>

            {/* Illustrations section */}
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <div className="mb-2 h-5 w-48 animate-pulse rounded-md bg-stone-200"></div>
                <div className="aspect-square w-full animate-pulse rounded-lg bg-stone-200"></div>
              </div>
              <div>
                <div className="mb-2 h-5 w-48 animate-pulse rounded-md bg-stone-200"></div>
                <div className="aspect-square w-full animate-pulse rounded-lg bg-stone-200"></div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex gap-3">
              <div className="h-10 w-32 animate-pulse rounded-md bg-stone-200"></div>
              <div className="h-10 w-32 animate-pulse rounded-md bg-stone-200"></div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}