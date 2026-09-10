export default function EmptyState({ icon, title, body, action }) {
  return (
    <div className="card mx-auto max-w-md px-8 py-12 text-center">
      {icon && <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center text-ink-faint">{icon}</div>}
      <h3 className="text-xl font-semibold text-ink">{title}</h3>
      {body && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <div className="label-caps text-danger">Something went wrong</div>
      <p className="mt-3 font-mono text-sm text-ink-soft">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-outline mt-6">
          Try again
        </button>
      )}
    </div>
  );
}