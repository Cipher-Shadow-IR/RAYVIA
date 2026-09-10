import { Link } from "react-router-dom";
import { useState } from "react";
import { Clock, Users, ArrowUpRight } from "lucide-react";
import ProgressBar from "./ProgressBar";
import { fmtEth, ipfsUrl, timeLeftLabel } from "../lib/crowdfunding";

const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #161b26 0%, #1c2331 100%)",
  "linear-gradient(135deg, #0f131c 0%, #161b26 100%)",
  "linear-gradient(135deg, #161b26 0%, #1e293b 100%)",
];

export default function ProjectCard({ project, index = 0, isLarge = false }) {
  const [imgError, setImgError] = useState(false);
  const src = ipfsUrl(project.cid);
  const showImg = src && !imgError;

  const status =
    project.expired && project.goalMet
      ? { label: "Funded", cls: "text-[#34D399] border-[#34D399]/30 bg-[#34D399]/10" }
      : project.expired
        ? { label: "Ended", cls: "text-[#94A3B8] border-white/[0.1] bg-white/[0.04]" }
        : { label: "Live Campaign", cls: "text-[#FBBF24] border-[#FBBF24]/30 bg-[#FBBF24]/10" };

  const timeLabel = project.expired ? "Ended" : timeLeftLabel(project.secondsLeft);
  const percentVal = Math.min(100, Math.floor(project.percent || 0));

  const categories = ["Design & Tech", "Film", "Arts", "Games"];
  const categoryLabel = categories[Number(project.category)] || "Design & Tech";

  if (isLarge) {
    return (
      <Link
        to={`/project/${project.id}`}
        className="group flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#161B26] hover:bg-[#1C2331] transition-all duration-300 hover:border-white/[0.18] shadow-card hover:-translate-y-0.5 lg:grid lg:grid-cols-12 lg:items-stretch lg:h-[480px]"
      >
        {/* Large Image Column */}
        <div className="relative overflow-hidden border-b border-white/[0.08] lg:border-b-0 lg:border-r lg:col-span-7 h-64 lg:h-full bg-[#0A0D14]">
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
              className="h-full w-full flex flex-col justify-between p-8"
              style={{ background: FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length] }}
            >
              <span className="font-mono text-xs uppercase tracking-wider text-slate-400">{categoryLabel}</span>
              <div className="font-mono text-4xl font-bold text-white/40">RAYVIA/{project.id}</div>
            </div>
          )}
          <span className={`absolute right-4 top-4 rounded-md border px-2.5 py-1 text-xs font-mono font-semibold backdrop-blur-md ${status.cls}`}>
            {status.label}
          </span>
        </div>

        {/* Large Content Column */}
        <div className="flex flex-col justify-between p-8 lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="font-mono text-xs uppercase tracking-wider text-[#3B82F6] font-semibold">{categoryLabel}</div>
            
            <h3 className="font-display text-2xl md:text-3xl font-bold leading-tight text-white group-hover:text-[#3B82F6] transition-colors line-clamp-3">
              {project.name}
            </h3>

            <p className="line-clamp-3 text-sm leading-relaxed text-[#94A3B8]">
              {project.description}
            </p>

            <div className="text-xs text-[#94A3B8] font-mono">
              by <span className="text-white font-medium">{project.creatorName || "Anonymous Creator"}</span>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-white/[0.06]">
            <ProgressBar percent={project.percent} />

            <div className="flex items-baseline justify-between font-mono">
              <div className="text-lg font-bold text-white">
                {fmtEth(project.raised)} <span className="text-xs text-[#94A3B8] font-normal">of {fmtEth(project.goal)} ETH</span>
              </div>
              <div className="text-sm font-semibold text-[#34D399]">{percentVal}%</div>
            </div>

            <div className="flex justify-between items-center text-xs text-[#94A3B8] font-mono pt-1">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#94A3B8]" />
                {Array.isArray(project.contributors) ? project.contributors.length : project.totalContributors} Backers
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                {timeLabel}
              </span>
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
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#161B26] hover:bg-[#1C2331] transition-all duration-300 hover:border-white/[0.18] shadow-card hover:-translate-y-0.5"
    >
      {/* Standard Image Header */}
      <div className="relative aspect-video overflow-hidden border-b border-white/[0.08] bg-[#0A0D14]">
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
            className="h-full w-full flex flex-col justify-between p-6"
            style={{ background: FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length] }}
          >
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">{categoryLabel}</span>
            <div className="font-mono text-2xl font-bold text-white/40">RAYVIA/{project.id}</div>
          </div>
        )}
        <span className={`absolute right-3 top-3 rounded-md border px-2.5 py-0.5 text-[11px] font-mono font-semibold backdrop-blur-md ${status.cls}`}>
          {status.label}
        </span>
      </div>

      {/* Standard Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        <div className="space-y-2">
          <div className="font-mono text-[11px] text-[#3B82F6] uppercase tracking-wider font-semibold">{categoryLabel}</div>
          
          <h3 className="font-display text-base font-bold leading-snug text-white group-hover:text-[#3B82F6] transition-colors line-clamp-2">
            {project.name}
          </h3>

          <p className="line-clamp-2 text-xs leading-relaxed text-[#94A3B8]">
            {project.description}
          </p>

          <div className="text-[11px] text-[#94A3B8] font-mono pt-1">
            by <span className="text-white font-medium">{project.creatorName || "Anonymous Creator"}</span>
          </div>
        </div>

        {/* Card Footer: Progress & Stats */}
        <div className="space-y-3 pt-3 border-t border-white/[0.06]">
          <ProgressBar percent={project.percent} />

          <div className="flex items-baseline justify-between font-mono">
            <div className="text-sm font-bold text-white">
              {fmtEth(project.raised)} <span className="text-[11px] text-[#94A3B8] font-normal">of {fmtEth(project.goal)} ETH</span>
            </div>
            <div className="text-xs font-semibold text-[#34D399]">{percentVal}%</div>
          </div>

          <div className="flex justify-between items-center text-[11px] text-[#94A3B8] font-mono pt-0.5">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-[#94A3B8]" />
              {Array.isArray(project.contributors) ? project.contributors.length : project.totalContributors} Backers
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#94A3B8]" />
              {timeLabel}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}