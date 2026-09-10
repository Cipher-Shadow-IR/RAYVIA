import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import ProjectCard from "./ProjectCard";
import { getLatestChainTimestamp, loadAllProjects } from "../utils/projects";

export default function HomeComponent({ contract }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ projects: 0, raised: "0.00", backings: 0 });
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [chainNow, setChainNow] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const getHomeData = useCallback(async () => {
    if (!contract) return;
    setIsLoading(true);

    try {
      const [projects, latestTimestamp] = await Promise.all([
        loadAllProjects(contract, true),
        getLatestChainTimestamp(contract),
      ]);

      const totalRaised = projects.reduce(
        (total, project) => total.add(project.amountRaised),
        ethers.BigNumber.from(0)
      );
      const totalBackings = projects.reduce(
        (total, project) => total + Number(project.totalContributors || 0),
        0
      );
      const bySignal = [...projects].sort((a, b) => {
        const bRaised = Number(ethers.utils.formatEther(b.amountRaised));
        const aRaised = Number(ethers.utils.formatEther(a.amountRaised));
        return b.totalContributors - a.totalContributors || bRaised - aRaised;
      });
      const byRecent = [...projects].sort((a, b) => b.creationTime - a.creationTime);

      setChainNow(latestTimestamp);
      setStats({
        projects: projects.length,
        raised: Number(ethers.utils.formatEther(totalRaised)).toFixed(2),
        backings: totalBackings,
      });
      setFeaturedProjects(bySignal.slice(0, 3));
      setRecentProjects(byRecent.slice(0, 6));
    } catch (error) {
      console.error("Error loading home data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    getHomeData();
  }, [getHomeData]);

  return (
    <div>
      <section className="container-max hero-editorial">
        <div>
          <p className="eyebrow muted">ON-CHAIN CROWDFUNDING</p>
          <h1 className="hero-title" style={{ marginTop: 22 }}>
            Back the<br />ideas worth<br />building.
          </h1>
          <p className="hero-copy body-lg">
            RAYVIA is a decentralized crowdfunding platform for people building things worth
            believing in.
          </p>
          <div className="hero-actions">
            <button className="btn-rayvia-primary" type="button" onClick={() => navigate("/discover")}>
              EXPLORE PROJECTS
            </button>
            <button className="btn-rayvia-outline" type="button" onClick={() => navigate("/start-project")}>
              START A PROJECT
            </button>
          </div>
          <div className="hero-meta">
            {["ETHEREUM", "TRANSPARENT FUNDING", "OPEN TO EVERY CREATOR"].map((item) => (
              <span className="tag-light tag" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <aside className="hero-panel">
          <div className="hero-panel__line">
            <span className="eyebrow muted">PROJECTS CREATED</span>
            <strong className="headline-sm">{stats.projects}</strong>
          </div>
          <div className="hero-panel__line">
            <span className="eyebrow muted">ETH RAISED</span>
            <strong className="headline-sm">{stats.raised}</strong>
          </div>
          <div className="hero-panel__line">
            <span className="eyebrow muted">TOTAL BACKINGS</span>
            <strong className="headline-sm">{stats.backings}</strong>
          </div>
        </aside>
      </section>

      <section className="container-max section">
        <div className="section-heading">
          <h2 className="headline-md">Featured Projects</h2>
          <Link to="/discover" className="text-link font-label-caps">
            VIEW ALL <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="skeleton-grid" style={{ marginTop: 40 }}>
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        ) : featuredProjects.length ? (
          <div className="bento-grid">
            <div className="bento-main">
              <ProjectCard project={featuredProjects[0]} aspect="2 / 1" emphasis="large" chainNow={chainNow} />
            </div>
            {featuredProjects[1] && (
              <div className="bento-side">
                <ProjectCard project={featuredProjects[1]} aspect="4 / 3" chainNow={chainNow} />
              </div>
            )}
            <div className="bento-callout">
              <div>
                <span className="material-symbols-outlined muted" style={{ fontSize: 44 }}>
                  rocket_launch
                </span>
                <h3 className="headline-sm" style={{ marginTop: 16 }}>
                  Have an idea worth building?
                </h3>
                <p className="body-sm muted" style={{ maxWidth: 360, margin: "12px auto 22px" }}>
                  Start a campaign on-chain and give people a reason to believe in it.
                </p>
                <button className="text-link font-label-caps" type="button" onClick={() => navigate("/start-project")}>
                  START A PROJECT
                </button>
              </div>
            </div>
            {featuredProjects[2] && (
              <div className="bento-side">
                <ProjectCard project={featuredProjects[2]} aspect="4 / 3" chainNow={chainNow} />
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state" style={{ marginTop: 40 }}>
            <div>
              <p className="eyebrow muted">NO PROJECTS YET</p>
              <h3 className="headline-sm" style={{ marginTop: 12 }}>
                The next idea worth backing could start here.
              </h3>
              <button className="btn-rayvia-primary" style={{ marginTop: 24 }} onClick={() => navigate("/start-project")}>
                START A PROJECT
              </button>
            </div>
          </div>
        )}
      </section>

      {recentProjects.length > 0 && (
        <section className="container-max section" style={{ paddingBottom: "var(--space-96)" }}>
          <div className="section-heading">
            <h2 className="headline-md">Recent Uploads</h2>
          </div>
          <div className="archive-grid">
            {recentProjects.map((project) => (
              <ProjectCard key={project.index} project={project} aspect="16 / 10" chainNow={chainNow} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
