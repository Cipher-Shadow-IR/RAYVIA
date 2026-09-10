import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getIpfsUrl } from "../utils/ipfs";
import dummyPic from "../assets/pg1.jpg";
import { getCategoryName, getFunding, getTimeLabel, shortAddress } from "../utils/projects";
import { gsap, prefersReducedMotion } from "../animations/gsap";

export default function ProjectCard({
  project,
  aspect = "16 / 9",
  emphasis = "compact",
  chainNow = 0,
}) {
  const cardRef = useRef(null);

  const funding = project ? getFunding(project) : null;
  const timeLabel = project ? getTimeLabel(project, chainNow) : "";
  const isLarge = emphasis === "large";
  const creatorAddress = project ? shortAddress(project.creatorAddress) : "";

  // Animate the funding progress bar into view
  useEffect(() => {
    if (prefersReducedMotion() || !funding) return;
    const bar = cardRef.current?.querySelector(".progress-fill");
    if (!bar) return;

    const tween = gsap.fromTo(
      bar,
      { width: 0 },
      {
        width: `${funding.barPercent}%`,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 88%",
          once: true,
        },
      }
    );

    return () => {
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
      tween.kill();
    };
  }, [funding?.barPercent]);

  if (!project) return null;

  return (
    <article
      ref={cardRef}
      className={`project-card ${isLarge ? "" : "project-card--compact"}`}
    >
      <Link to={`/project/${project.index}`} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div className="project-card__image" style={{ aspectRatio: aspect }}>
          <img
            src={getIpfsUrl(project.cid) || dummyPic}
            alt={`${project.projectName} project cover`}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = dummyPic;
            }}
          />
          <span className="tag" style={{ position: "absolute", top: 16, left: 16 }}>
            {getCategoryName(project.category)}
          </span>
        </div>

        <div className="project-card__body">
          <div>
            <div className="eyebrow muted" style={{ marginBottom: 16 }}>
              {getCategoryName(project.category)}
            </div>
            <h3 className="project-title">{project.projectName}</h3>
            <p
              className="body-sm muted"
              style={{
                marginTop: 14,
                display: "-webkit-box",
                WebkitLineClamp: isLarge ? 3 : 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {project.projectDescription}
            </p>
            <p className="body-sm" style={{ marginTop: 18 }}>
              by <strong>{project.creatorName}</strong>
              {creatorAddress && <span className="mono muted"> · {creatorAddress}</span>}
            </p>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 10 }}>
              <span className="body-sm">
                <strong>{funding.raisedLabel} ETH</strong>{" "}
                <span className="muted">raised of {funding.goalLabel} ETH</span>
              </span>
              <span className="eyebrow" style={{ color: "var(--color-indigo)" }}>
                {funding.percentLabel}
              </span>
            </div>

            <div className="progress-track" aria-label={`${funding.percentLabel} funded`}>
              <div className="progress-fill" style={{ width: 0 }} />
            </div>

            <div
              className="eyebrow muted"
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                marginTop: 12,
              }}
            >
              <span>{project.totalContributors || 0} backers</span>
              <span>{timeLabel}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
