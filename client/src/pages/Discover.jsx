import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import ProjectCard from "../components/ProjectCard";
import Reveal from "../components/Reveal";
import ErrorState from "../components/StateViews";
import { ProjectCardSkeleton } from "../components/Loading";
import { CATEGORIES, categoryLabel } from "../lib/crowdfunding";

export default function Discover() {
  const { projects, loading, error, refresh } = useProjects();
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) setQuery(q);
  }, [searchParams]);

  const filterCls = (active) =>
    `rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
      active
        ? "border-ink bg-navy text-surface-bright shadow-sm"
        : "border-outline-soft bg-surface-bright text-ink-soft hover:border-ink/30 hover:text-ink"
    }`;

  const filteredAndSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    
    // Filter
    let result = projects.filter((p) => {
      const matchCategory = category === "all" || String(p.category) === String(category);
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.creatorName.toLowerCase().includes(q) ||
        categoryLabel(p.category).toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });

    // Sort
    if (sortBy === "newest") {
      result.sort((a, b) => b.id - a.id);
    } else if (sortBy === "most_funded") {
      result.sort((a, b) => b.raised - a.raised);
    } else if (sortBy === "ending_soon") {
      result.sort((a, b) => {
        // Live first, then ends sooner
        if (a.expired && !b.expired) return 1;
        if (!a.expired && b.expired) return -1;
        return a.secondsLeft - b.secondsLeft;
      });
    }

    return result;
  }, [projects, category, query, sortBy]);

  return (
    <div className="container-page py-16 md:py-24">
      {/* Editorial Header */}
      <Reveal className="mb-12 border-b border-ink/10 pb-8">
        <div className="label-caps text-electric tracking-widest text-[11px]">Editorial Archive</div>
        <h1 className="mt-4 font-display font-black text-[clamp(2.5rem,6vw,4.5rem)] tracking-tight text-ink uppercase leading-none">
          Discover Projects
        </h1>
        <p className="mt-4 text-base text-ink-soft max-w-xl font-sans">
          Find something worth backing. Explore decentralized campaigns straight from the immutable smart contract.
        </p>
      </Reveal>

      {/* Toolbar */}
      <Reveal className="mb-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-ink/10 pb-6">
          {/* Categories left */}
          <div className="flex flex-wrap items-center gap-2">
            {["all", ...CATEGORIES.map((c) => c.id)].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setCategory(id)}
                className={filterCls(String(category) === String(id))}
              >
                {id === "all" ? "ALL" : categoryLabel(id).toUpperCase()}
              </button>
            ))}
          </div>

          {/* Search & Sort right */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Search Box */}
            <div className="relative flex items-center gap-2 rounded-full border border-ink/10 bg-surface-container px-4 py-2 w-64">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-ink-faint" aria-hidden="true">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects..."
                className="bg-transparent text-xs text-ink outline-none placeholder:text-ink-faint/50 w-full"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-full border border-ink/10 bg-surface-container px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink-soft outline-none cursor-pointer"
            >
              <option value="newest">NEWEST</option>
              <option value="most_funded">MOST FUNDED</option>
              <option value="ending_soon">ENDING SOON</option>
            </select>
          </div>
        </div>
      </Reveal>

      {/* Main Content Area */}
      {loading ? (
        <ProjectCardSkeleton count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : filteredAndSorted.length === 0 ? (
        /* Explicit Empty State */
        <Reveal className="flex flex-col items-center gap-6 py-24 px-8 text-center border border-dashed border-ink/10 rounded-soft bg-surface-container/30">
          <span className="label-caps text-ink-faint tracking-widest text-xs font-bold">NOTHING HERE YET</span>
          <p className="max-w-md text-lg text-ink-soft font-sans">
            New ideas will appear here as creators bring them on-chain.
          </p>
          <Link to="/start-project" className="btn-primary btn-md">Start a Project</Link>
        </Reveal>
      ) : (
        /* Grid with asymmetry/editorial variation based on index */
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSorted.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 0.06} y={20} className="h-full">
              <ProjectCard project={p} index={i} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}