import { policyLabel } from "../lib/crowdfunding";

export default function PolicyTag({ id, className = "" }) {
  const refundable = Number(id) === 0;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
        refundable
          ? "border border-purple/25 bg-purple/10 text-purple"
          : "bg-navy text-surface"
      } ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${refundable ? "bg-purple" : "bg-surface"}`}
      />
      {policyLabel(id)}
    </span>
  );
}