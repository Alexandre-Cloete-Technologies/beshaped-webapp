/** Completed sets per primary muscle, as labelled bars (longest bar = most sets). */
export function MuscleSetsBars({ rows }: { rows: { muscle: string; sets: number }[] }) {
  const maxSets = Math.max(1, ...rows.map((row) => row.sets));

  return (
    <ul className="space-y-3">
      {rows.map(({ muscle, sets }) => (
        <li key={muscle} className="space-y-1">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-semibold uppercase tracking-[0.06em] text-zinc-800">{muscle}</span>
            <span className="tabular-nums text-zinc-600">
              {sets} {sets === 1 ? "set" : "sets"}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-stone-200">
            {sets > 0 && (
              <div
                className="h-full rounded-full bg-beshaped-dark-green"
                style={{ width: `${(sets / maxSets) * 100}%` }}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
