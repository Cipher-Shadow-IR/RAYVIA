import { categoryInfo } from "../lib/crowdfunding";

const TONES = {
  purple: "bg-purple/10 text-purple border-purple/25",
  blue: "bg-blue/10 text-blue border-blue/25",
  cyan: "bg-cyan/10 text-cyan border-cyan/25",
  electric: "bg-electric/10 text-electric border-electric/25",
};

export default function CategoryChip({ id, variant = "soft", className = "" }) {
  const info = categoryInfo(id);
  const tone = variant === "glass" ? "" : TONES[info.tone] || TONES.electric;
  const glass = variant === "glass" ? "border-surface/40 bg-surface/15 text-surface backdrop-blur-sm" : "";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${tone} ${glass} ${className}`}
    >
      {info.label}
    </span>
  );
}

export const CATEGORY_TONES = TONES;