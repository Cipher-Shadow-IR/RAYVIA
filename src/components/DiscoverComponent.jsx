import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import ProjectCard from "./ProjectCard";
import { CATEGORIES, getLatestChainTimestamp, loadAllProjects } from "../utils/projects";

export default function DiscoverComponent({ contract }) {
  const [projects, setProjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState("trending");
  const [chainNow, setChainNow] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const getProjects = useCallback(async () => {
    if (!contract) return;
    setIsLoading(true);

    try {
      const [loadedProjects, latestTimestamp] = await Promise.all([
        loadAllProjects(contract, true),
        getLatestChainTimestamp(contract),
      ]);
      setProjects(loadedProjects);
      setChainNow(latestTimestamp);
    } catch (error) {
      console.error("Error loading discover projects:", error);
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    getProjects();
  }, [getProjects]);

  const filteredProjects = [...projects]
    .filter((project) =>
      selectedCategory === "all" ? true : project.category === Number(selectedCategory)
    )
    .filter((project) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;

      return [project.projectName, project.projectDescription, project.creatorName, project.creatorAddress]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    })
    .sort((a, b) => {
      if (sortMode === "newest") return b.creationTime - a.creationTime;
      if (sortMode === "most_funded") {
        return Number(ethers.utils.formatEther(b.amountRaised)) - Number(ethers.utils.formatEther(a.amountRaised));
      }
      return b.totalContributors - a.totalContributors;
    });

  return (
    <div className="page-shell">
      <div className="container-max">
        <header className="archive-header">
          <h1 className="archive-title">DISCOVER</h1>
          <p className="body-lg muted" style={{ marginTop: 18 }}>
            Find something worth backing.
          </p>
        </header>

        <section className="filter-bar" aria-label="Project filters">
          <label className="search-field" htmlFor="discover-search-input">
            <span className="material-symbols-outlined" aria-hidden="true">
              search
            </span>
            <input
              id="discover-search-input"
              type="search"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>

          <div className="pill-row">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                className={`filter-pill font-label-caps ${selectedCategory === category.id ? "active" : ""}`}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </button>
            ))}

            <select
              className="filter-pill font-label-caps"
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value)}
              aria-label="Sort projects"
            >
              <option value="trending">TRENDING</option>
              <option value="newest">NEWEST</option>
              <option value="most_funded">MOST FUNDED</option>
            </select>
          </div>
        </section>

        {!isLoading && (
          <p className="eyebrow muted" style={{ marginTop: 24 }}>
            {filteredProjects.length} PROJECT{filteredProjects.length === 1 ? "" : "S"} FOUND
          </p>
        )}

        {isLoading ? (
          <div className="skeleton-grid" style={{ marginTop: 48 }}>
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        ) : filteredProjects.length ? (
          <section className="archive-grid">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.index}
                project={project}
                aspect={index % 5 === 0 ? "4 / 3" : "16 / 10"}
                chainNow={chainNow}
              />
            ))}
          </section>
        ) : (
          <section className="empty-state" style={{ marginTop: 48 }}>
            <div>
              <p className="eyebrow muted">NOTHING HERE YET.</p>
              <h2 className="headline-sm" style={{ marginTop: 12 }}>
                New ideas will appear here as creators bring them on-chain.
              </h2>
              <p className="body-md muted" style={{ maxWidth: 460, margin: "14px auto 24px" }}>
                Try another category or search term, or be the creator who starts the next one.
              </p>
              <Link to="/start-project" className="btn-rayvia-primary">
                START A PROJECT
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
