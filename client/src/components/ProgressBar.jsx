import { useInView } from "../hooks/useInView";

export default function ProgressBar({ percent, className = "", showLabel = false }) {
  const [ref, inView] = useInView();
  const width = Math.max(0, Math.min(100, Number(percent) || 0));

  return (
    <div ref={ref} className={className}>
      {showLabel && (
        <div className="mb-2 flex items-center justify-between font-mono text-xs text-ink-soft">
          <span>{width}%</span>
          <span>target</span>
        </div>
      )}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: inView ? `${width}%` : "0%" }} />
      </div>
    </div>
  );
}