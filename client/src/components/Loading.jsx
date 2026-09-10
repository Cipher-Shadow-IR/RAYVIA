export function Spinner({ className = "" }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function ProjectCardSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-soft border border-ink/10">
          <div className="aspect-video animate-pulse bg-surface-container" />
          <div className="space-y-3 p-6">
            <div className="h-5 w-3/4 animate-pulse rounded bg-surface-container" />
            <div className="h-3 w-full animate-pulse rounded bg-surface-container" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-surface-container" />
            <div className="h-6 w-full animate-pulse rounded bg-surface-container" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageLoader({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-32 text-ink-soft">
      <Spinner className="text-electric" />
      <span className="label-caps">{label}</span>
    </div>
  );
}