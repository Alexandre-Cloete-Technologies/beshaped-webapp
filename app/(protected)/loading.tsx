export default function ProtectedLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-emerald-500" />
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    </div>
  );
}
