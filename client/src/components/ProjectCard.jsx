import { Link } from "react-router-dom";
import { useState } from "react";
import ProgressBar from "./ProgressBar";
import CategoryChip from "./CategoryChip";
import {
  fmtEth,
  ipfsUrl,
  timeLeftLabel,
} from "../lib/crowdfunding";

const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #161b2b 0%, #20263c 100%)",
  "linear-gradient(135deg, #0f1322 0%, #1c2236 100%)",
  "linear-gradient(135deg, #161b2b 0%, #2e2f69 100%)",
];

export default function ProjectCard({ project, index = 0, isLarge = false }) {
  const [imgError, setImgError] = useState(false);
  const src = ipfsUrl(project.cid);
  const showImg = src && !imgError;

  const status =
    project.expired && project.goalMet
      ? { label: "Funded", cls: "text-cyan border-cyan/25 bg-cyan/10" }
      : project.expired
        ? { label: "Ended", cls: "text-ink-faint border-outline-soft bg-surface-container" }
        : { label: "Live", cls: "text-success border-success/25 bg-success/10" };

  const timeLabel = project.expired ? "Ended" : timeLeftLabel(project.secondsLeft);
  const percentVal = Math.min(100, Math.floor(project.percent || 0));

  const categories = ["Design & Tech", "Film", "Arts", "Games"];
  const categoryLabel = categories[Number(project.category)] || "Design & Tech";

  if (isLarge) {
    return (
      <Link
        to={`/project/${project.id}`}
        className="group flex flex-col overflow-hidden rounded-cards border border-outline-soft bg-surface-bright transition-all duration-300 hover:border-ink/20 hover:shadow-card hover:-translate-y-0.5 lg:grid lg:grid-cols-12 lg:items-stretch lg:h-[480px]"
      >
        {/* Large Image Column */}
        <div className="relative overflow-hidden border-b border-outline-soft lg:border-b-0 lg:border-r lg:col-span-7 h-64 lg:h-full bg-surface-container-high">
          {showImg ? (
            <img
              src={src}
              alt={project.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{ background: FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length] }}
            >
              <div className="flex h-full flex-col justify-between p-8">
                <span className="label-caps tracking-widest text-surface-bright/70">{categoryLabel}</span>
                <div className="font-mono text-4xl font-bold text-surface-bright/80">RAYVIA/{project.id}</div>
              </div>
            </div>
          )}
          <span className={`absolute right-4 top-4 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm ${status.cls}`}>
            {status.label}
          </span>
        </div>

        {/* Large Content Column */}
        <div className="flex flex-col justify-between p-8 lg:col-span-5">
          <div className="space-y-4">
            <div className="label-caps text-electric tracking-widest font-semibold">{categoryLabel}</div>
            
            <h3 className="font-display text-2xl md:text-3xl font-black leading-tight text-ink group-hover:text-electric transition-colors line-clamp-3 uppercase">
              {project.name}
            </h3>

            <p className="line-clamp-4 text-sm leading-relaxed text-ink-soft">
              {project.description}
            </p>

            <div className="text-xs text-ink-faint">
              by <strong className="text-ink font-medium">{project.creatorName || "Anonymous Creator"}</strong>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-outline-soft">
            <ProgressBar percent={project.percent} />

            <div className="flex items-baseline justify-between">
              <div className="font-mono text-xl font-bold text-ink">
                {fmtEth(project.raised)} <span className="text-xs text-ink-soft font-sans font-normal">raised of {fmtEth(project.goal)}</span>
              </div>
              <div className="font-mono text-sm font-semibold text-electric">{percentVal}%</div>
            </div>

            <div className="flex justify-between items-center text-xs text-ink-faint font-sans uppercase tracking-wider">
              <span>{Array.isArray(project.contributors) ? project.contributors.length : project.totalContributors} Backers</span>
              <span className="font-mono text-ink-soft">{timeLabel}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Standard vertical card (used in Home secondary section and Discover grid)
  return (
    <Link
      to={`/project/${project.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-cards border border-outline-soft bg-surface-bright transition-all duration-300 hover:border-ink/20 hover:shadow-card hover:-translate-y-0.5"
    >
      {/* Standard Image Header */}
      <div className="relative aspect-video overflow-hidden border-b border-outline-soft bg-surface-container-high">
        {showImg ? (
          <img
            src={src}
            alt={project.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length] }}
          >
            <div className="flex h-full flex-col justify-between p-6">
              <span className="label-caps tracking-widest text-surface-bright/70">{categoryLabel}</span>
              <div className="font-mono text-2xl font-bold text-surface-bright/75">RAYVIA/{project.id}</div>
            </div>
          </div>
        )}
        <span className={`absolute right-4 top-4 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm ${status.cls}`}>
          {status.label}
        </span>
      </div>

      {/* Standard Card Body */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div className="space-y-3 mb-6">
          <div className="label-caps text-electric tracking-widest text-[11px] font-semibold">{categoryLabel}</div>
          
          <h3 className="font-display text-lg font-black leading-snug text-ink group-hover:text-electric transition-colors line-clamp-2 uppercase">
            {project.name}
          </h3>

          <p className="line-clamp-2 text-xs leading-relaxed text-ink-soft">
            {project.description}
          </p>

          <div className="text-xs text-ink-faint">
            by <strong className="text-ink font-medium">{project.creatorName || "Anonymous Creator"}</strong>
          </div>
        </div>

        {/* Card Footer: Progress & Stats */}
        <div className="space-y-3 pt-4 border-t border-outline-soft">
          <ProgressBar percent={project.percent} />

          <div className="flex items-baseline justify-between">
            <div className="font-mono text-base font-bold text-ink">
              {fmtEth(project.raised)} <span className="text-[10px] text-ink-soft font-sans font-normal">of {fmtEth(project.goal)}</span>
            </div>
            <div className="font-mono text-xs font-semibold text-electric">{percentVal}%</div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-ink-faint font-sans uppercase tracking-wider">
            <span>{Array.isArray(project.contributors) ? project.contributors.length : project.totalContributors} Backers</span>
            <span className="font-mono text-ink-soft">{timeLabel}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}