import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProjects } from "../hooks/useProjects";
import ProjectCard from "../components/ProjectCard";
import Reveal from "../components/Reveal";
import CountUp from "../components/CountUp";
import SectionHeading from "../components/SectionHeading";
import { ProjectCardSkeleton } from "../components/Loading";
import ProgressBar from "../components/ProgressBar";
import { CATEGORIES, categoryLabel, fmtEth, ipfsUrl, timeLeftLabel } from "../lib/crowdfunding";

gsap.registerPlugin(ScrollTrigger);

const MARQUEE_ITEMS = [
  ...CATEGORIES.map((c) => c.label.toUpperCase()),
  "IMMUTABLE CONTRACTS",
  "TRUSTLESS REFUNDS",
  "ZERO CUSTODIAL RISK",
  "DECENTRALIZED IPFS",
  "OPEN TO EVERY CREATOR",
];

function Hero({ featuredProject, loading }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return undefined;

      gsap.fromTo(
        "[data-hero-chunk]",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );

      gsap.fromTo(
        "[data-hero-card]",
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: "power3.out" }
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden bg-surface border-b border-outline-soft">
      <div className="container-page relative grid items-center gap-12 pt-16 pb-24 lg:grid-cols-12 lg:gap-16 lg:pt-24 lg:pb-32">
        {/* Left Column: Editorial Headline & Copy */}
        <div className="space-y-8 lg:col-span-7">
          <div data-hero-chunk className="label-caps text-ink-faint flex flex-wrap items-center gap-2">
            <span className="text-electric">●</span>
            <span>ON-CHAIN CROWDFUNDING</span>
            <span>·</span>
            <span>ETHEREUM</span>
            <span>·</span>
            <span>DIRECT PROTOCOL</span>
          </div>

          <h1 data-hero-chunk className="copy-display text-[clamp(2.75rem,5.5vw,5rem)] text-ink uppercase">
            Back the
            <br />
            ideas worth
            <br />
            <span className="text-electric">building.</span>
          </h1>

          <p data-hero-chunk className="max-w-xl text-lg leading-relaxed text-ink-soft font-sans">
            RAYVIA is an editorial, security-hardened Web3 crowdfunding platform. Launch projects with transparent milestones, automated refund guarantees, and immutable smart contract settlement.
          </p>

          <div data-hero-chunk className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/discover" className="btn-primary btn-lg font-bold tracking-wider uppercase">
              Explore Projects
            </Link>
            <Link to="/start-project" className="btn-outline btn-lg font-bold tracking-wider uppercase">
              Start a Project
            </Link>
          </div>

          <div data-hero-chunk className="flex flex-wrap items-center gap-6 pt-4 border-t border-outline-soft text-xs text-ink-faint font-mono">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              NON-CUSTODIAL VAULTS
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-electric" />
              OPENZEPPELIN HARDFORK READY
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-ink-faint" />
              IPFS PERSISTED
            </span>
          </div>
        </div>

        {/* Right Column: Authentic Editorial Featured Card or Protocol Spotlight */}
        <div data-hero-card className="lg:col-span-5">
          {featuredProject ? (
            <Link
              to={`/project/${featuredProject.id}`}
              className="group block card overflow-hidden p-6 hover:shadow-float transition-all duration-300 bg-surface-bright border border-outline-soft"
            >
              <div className="flex items-center justify-between pb-4 border-b border-outline-soft">
                <span className="chip-soft text-[10px] font-bold uppercase">
                  {featuredProject.expired ? "Ended" : "Live Campaign"}
                </span>
                <span className="label-caps text-ink-faint text-[10px]">
                  {categoryLabel(featuredProject.category)}
                </span>
              </div>

              <div className="relative mt-5 aspect-video overflow-hidden rounded-md bg-surface-container-high">
                {featuredProject.cid ? (
                  <img
                    src={ipfsUrl(featuredProject.cid)}
                    alt={featuredProject.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-6 text-center font-mono text-sm text-ink-soft">
                    RAYVIA ARCHIVE // CAMPAIGN #{featuredProject.id}
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-2">
                <h3 className="font-display text-xl font-bold text-ink uppercase group-hover:text-electric transition-colors line-clamp-1">
                  {featuredProject.name}
                </h3>
                <p className="text-xs text-ink-soft line-clamp-2 leading-relaxed">
                  {featuredProject.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-outline-soft space-y-3">
                <ProgressBar percent={featuredProject.percent} />
                <div className="flex items-baseline justify-between font-mono text-xs">
                  <div>
                    <span className="font-bold text-sm text-ink">{fmtEth(featuredProject.raised)}</span>
                    <span className="text-ink-faint font-sans text-[11px]"> of {fmtEth(featuredProject.goal)}</span>
                  </div>
                  <span className="font-bold text-electric">{Math.min(100, Math.floor(featuredProject.percent || 0))}%</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-ink-faint font-sans uppercase tracking-wider">
                  <span>{featuredProject.totalContributors || (featuredProject.contributors || []).length} Backers</span>
                  <span className="font-mono text-ink-soft">
                    {featuredProject.expired ? "Closed" : timeLeftLabel(featuredProject.secondsLeft)}
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="card p-8 bg-surface-bright border border-outline-soft shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-outline-soft">
                <span className="chip text-[10px] font-bold uppercase">Protocol Standby</span>
                <span className="label-caps text-ink-faint text-[10px]">SMART CONTRACT</span>
              </div>

              <div className="space-y-3">
                <h3 className="font-display text-2xl font-bold text-ink uppercase">
                  Launch the first on-chain campaign.
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed">
                  The protocol is deployed and ready on Ethereum. Connect your MetaMask wallet, specify your funding goal and timeline, and publish your project without intermediaries.
                </p>
              </div>

              <div className="rounded-md border border-outline-soft bg-surface-container-low p-4 space-y-2 font-mono text-xs text-ink-soft">
                <div className="flex justify-between">
                  <span className="text-ink-faint">Smart Contract:</span>
                  <span className="text-ink font-semibold">crowdfunding.sol</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-faint">Security Layer:</span>
                  <span className="text-success font-semibold">ReentrancyGuard Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-faint">Refund Settlement:</span>
                  <span className="text-electric font-semibold">Autonomous On-Chain</span>
                </div>
              </div>

              <Link to="/start-project" className="btn-electric w-full py-3.5 font-bold uppercase tracking-wider text-xs text-center">
                Launch a Campaign
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  return (
    <div className="band-dark overflow-hidden border-y border-surface-bright/10 py-4" aria-hidden="true">
      <div className="flex w-max items-center gap-8 anim-marquee">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} className="label-caps flex items-center gap-8 text-surface-bright/70 text-xs">
            {item}
            <span className="text-electric-bright">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Stats({ projects }) {
  const totalRaised = projects.reduce((acc, p) => acc + (p.raised || 0), 0);
  const totalBackers = projects.reduce(
    (acc, p) => acc + Number(p.contributors?.length || p.totalContributors || 0),
    0
  );

  const stats = [
    { label: "Active & Funded Campaigns", value: projects.length, suffix: "" },
    { label: "Total Ether Committed", value: totalRaised, decimals: 2, suffix: " ETH" },
    { label: "Unique On-Chain Backers", value: totalBackers, suffix: "" },
    { label: "Protocol Settlement Guarantee", value: 100, suffix: "% On-Chain" },
  ];

  return (
    <section className="container-page py-16 md:py-20">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06} className="card p-6 border border-outline-soft">
            <div className="label-caps text-ink-faint text-[10px]">{s.label}</div>
            <CountUp
              value={s.value}
              decimals={s.decimals || 0}
              suffix={s.suffix || ""}
              className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink"
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Featured({ projects, loading }) {
  const featured = projects.slice(0, 3);
  return (
    <section className="container-page pb-20 md:pb-28">
      <SectionHeading
        eyebrow="Curated Campaigns"
        title="Featured on Rayvia"
        description="Explore live campaigns anchored directly to our hardened Ethereum smart contract."
        action={
          <Link to="/discover" className="btn-outline font-bold text-xs uppercase tracking-wider">
            View All Campaigns →
          </Link>
        }
      />
      {loading ? (
        <ProjectCardSkeleton count={3} />
      ) : featured.length === 0 ? (
        <Reveal className="flex flex-col items-center gap-6 py-20 px-8 text-center border border-dashed border-outline-soft rounded-lg bg-surface-container-low/50">
          <span className="label-caps text-ink-faint text-xs">NO ACTIVE CAMPAIGNS</span>
          <p className="max-w-md text-base text-ink-soft font-sans">
            Be the first creator to launch a decentralized campaign on this network.
          </p>
          <Link to="/start-project" className="btn-primary btn-md uppercase font-bold text-xs">
            Start a Project
          </Link>
        </Reveal>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {featured.length === 1 ? (
            <div className="lg:col-span-3">
              <Reveal delay={0} y={20} className="h-full">
                <ProjectCard project={featured[0]} index={0} isLarge={true} />
              </Reveal>
            </div>
          ) : featured.length === 2 ? (
            <>
              <div className="lg:col-span-2">
                <Reveal delay={0} y={20} className="h-full">
                  <ProjectCard project={featured[0]} index={0} isLarge={true} />
                </Reveal>
              </div>
              <div>
                <Reveal delay={0.08} y={20} className="h-full">
                  <ProjectCard project={featured[1]} index={1} />
                </Reveal>
              </div>
            </>
          ) : (
            <>
              <div className="lg:col-span-2">
                <Reveal delay={0} y={20} className="h-full">
                  <ProjectCard project={featured[0]} index={0} isLarge={true} />
                </Reveal>
              </div>
              <div className="grid gap-6">
                {featured.slice(1, 3).map((p, i) => (
                  <Reveal key={p.id} delay={(i + 1) * 0.08} y={20} className="h-full">
                    <ProjectCard project={p} index={i + 1} />
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Deploy Parameters",
      body: "Publish your campaign to the Ethereum blockchain — defining funding target, deadline, category, and immutable refund guarantee.",
    },
    {
      n: "02",
      title: "Direct ETH Backing",
      body: "Supporters back your vision directly in ETH via MetaMask. Every contribution is logged in transparent on-chain mappings.",
    },
    {
      n: "03",
      title: "Autonomous Settlement",
      body: "If the target is met, creators claim raised capital. If a refundable goal falls short, contributors trigger automatic refunds.",
    },
  ];
  return (
    <section className="band-dark py-20 md:py-28 border-y border-surface-bright/10">
      <div className="container-page">
        <div className="label-caps text-electric-bright">ARCHITECTURE & WORKFLOW</div>
        <h2 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-tight md:text-4xl font-display uppercase">
          From proposal to payout, strictly on-chain.
        </h2>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1} className="rounded-lg border border-surface-bright/10 bg-surface-bright/5 p-8 backdrop-blur-sm">
              <div className="font-mono text-3xl font-bold text-electric-bright">{s.n}</div>
              <h3 className="mt-4 text-lg font-bold font-display uppercase text-surface-bright">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-surface-bright/65 font-sans">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="container-page py-20 md:py-28">
      <Reveal className="relative overflow-hidden rounded-cards band-dark p-10 text-center md:p-16 border border-surface-bright/10">
        <div className="relative">
          <div className="label-caps text-surface-bright/50">COMMENCE BUILDING</div>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold tracking-tight md:text-4xl font-display uppercase">
            Have a project worth funding? Deploy it to Ethereum.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-surface-bright/65 text-sm font-sans leading-relaxed">
            Zero intermediary commissions, no arbitrary censorship, and guaranteed protocol-level execution.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/start-project" className="btn-electric btn-lg font-bold uppercase tracking-wider text-xs">
              Start a Project
            </Link>
            <Link to="/discover" className="btn-ghost-dark btn-lg font-bold uppercase tracking-wider text-xs">
              Explore Archive
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default function Home() {
  const { projects, loading, error, refresh } = useProjects();

  return (
    <>
      <Hero featuredProject={projects[0]} loading={loading} />
      <Stats projects={projects} />
      <Marquee />
      <Featured projects={projects} loading={loading} />
      <HowItWorks />
      <FinalCta />
      {error && (
        <div className="container-page pb-8">
          <button
            type="button"
            onClick={refresh}
            className="btn-outline btn-sm text-danger border-danger/20"
          >
            Failed to load on-chain data — retry
          </button>
        </div>
      )}
    </>
  );
}