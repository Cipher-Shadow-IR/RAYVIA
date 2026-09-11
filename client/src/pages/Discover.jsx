import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Plus, ArrowRight } from "lucide-react";
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
    `rounded-lg border px-3.5 py-1.5 text-xs font-mono font-medium transition-all whitespace-nowrap shrink-0 ${
      active
        ? "border-[#3B82F6] bg-[#3B82F6] text-white shadow-sm font-semibold"
        : "border-white/[0.08] bg-[#161B26] text-[#94A3B8] hover:border-white/[0.18] hover:text-white"
    }`;

  const filteredAndSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    
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

    if (sortBy === "newest") {
      result.sort((a, b) => b.id - a.id);
    } else if (sortBy === "most_funded") {
      result.sort((a, b) => b.raised - a.raised);
    } else if (sortBy === "ending_soon") {
      result.sort((a, b) => {
        if (a.expired && !b.expired) return 1;
        if (!a.expired && b.expired) return -1;
        return a.secondsLeft - b.secondsLeft;
      });
    }

    return result;
  }, [projects, category, query, sortBy]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      <div className="space-y-2 border-b border-white/[0.06] pb-6">
        <span className="font-mono text-xs uppercase tracking-wider text-[#3B82F6] font-semibold">
          Decentralized Registry
        </span>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
          Discover Campaigns
        </h1>
        <p className="text-sm text-[#94A3B8] max-w-xl">
          Explore and back live decentralized initiatives straight from the verified Ethereum smart contract.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/[0.06] pb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["all", ...CATEGORIES.map((c) => c.id)].map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setCategory(id)}
              className={filterCls(String(category) === String(id))}
            >
              {id === "all" ? "All Categories" : categoryLabel(id)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#161B26] px-3 py-1.5 w-full sm:w-64 focus-within:border-[#3B82F6]">
            <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by keyword..."
              className="bg-transparent text-xs text-white outline-none placeholder:text-[#94A3B8]/60 w-full font-sans"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-white/[0.08] bg-[#161B26] px-3 py-1.5 text-xs font-mono font-medium text-slate-200 outline-none cursor-pointer focus:border-[#3B82F6] flex-1 min-w-[128px] sm:flex-none"
          >
            <option value="newest" className="bg-[#161B26]">Newest First</option>
            <option value="most_funded" className="bg-[#161B26]">Most Funded</option>
            <option value="ending_soon" className="bg-[#161B26]">Ending Soon</option>
          </select>
        </div>
      </div>

      {loading ? (
        <ProjectCardSkeleton count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : filteredAndSorted.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 px-8 text-center border border-dashed border-white/[0.08] rounded-xl bg-[#161B26] max-w-lg mx-auto">
          <span className="font-mono text-xs uppercase tracking-wider text-[#94A3B8]">
            No matching campaigns found
          </span>
          <p className="text-xs text-[#94A3B8]">
            Try adjusting your search terms or launch the first campaign in this category.
          </p>
          <Link
            to="/start-project"
            className="btn-sheen inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Launch Campaign</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSorted.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      )}

    </div>
  );
}