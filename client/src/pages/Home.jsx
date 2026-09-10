import { useLayoutEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Zap, 
  Coins, 
  Clock, 
  Users, 
  Layers, 
  ExternalLink 
} from "lucide-react";
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
  "IMMUTABLE SMART CONTRACTS",
  "TRUSTLESS ON-CHAIN REFUNDS",
  "ZERO CUSTODIAL RISK",
  "DECENTRALIZED IPFS PERSISTENCE",
  "DIRECT PAYABLE SETTLEMENT",
];

function Hero({ featuredProject, loading }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return undefined;

      // Editorial masked line reveal for the headline
      gsap.fromTo(
        "[data-hero-line]",
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: "power4.out",
        }
      );

      // Chips, description, CTAs, script strip stagger in with a soft rise
      gsap.fromTo(
        "[data-hero-chunk]",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, delay: 0.55, ease: "power3.out" }
      );

      gsap.fromTo(
        "[data-hero-card]",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.9, delay: 0.4, ease: "power3.out" }
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden border-b border-white/[0.06] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Kinetic Editorial Copy */}
          <div className="space-y-6 lg:col-span-7 text-left">
            
            {/* Protocol Status Badge (Amber #FBBF24) */}
            <div data-hero-chunk className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FBBF24]/10 border border-[#FBBF24]/20 text-xs font-mono text-[#FBBF24]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24] animate-pulse" />
              <span>RAYVIA PROTOCOL • ZERO CUSTODY ESCROW</span>
            </div>

{/* Disciplined Scale Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white light:text-[#0f172a] leading-[1.06]">
              <span className="block overflow-hidden">
                <span data-hero-line className="block" style={{ willChange: "transform" }}>
                  Back the ideas
                </span>
              </span>
              <span className="block overflow-hidden">
                <span data-hero-line className="block text-[#3B82F6]" style={{ willChange: "transform" }}>
                  worth building.
                </span>
              </span>
            </h1>

            <p data-hero-chunk className="max-w-xl text-base sm:text-lg leading-relaxed text-[#94A3B8] font-normal">
              Autonomous, security-hardened Web3 crowdfunding platform on Ethereum. Launch creative and technical projects with transparent milestones, automated refund protections, and zero middleman fees.
            </p>

            {/* Action Buttons (Sapphire #3B82F6 primary) */}
            <div data-hero-chunk className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/discover" className="btn-sheen inline-flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-all shadow-md shadow-blue-500/20 active:scale-95">
                <span>Explore Projects</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/start-project" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-semibold text-slate-200 bg-[#161B26] hover:bg-[#1C2331] border border-white/[0.08] hover:border-white/[0.16] transition-all active:scale-95">
                <span>Deploy Campaign</span>
              </Link>
            </div>

            {/* Technical Verification Strip */}
            <div data-hero-chunk className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/[0.06] text-xs font-mono text-[#94A3B8]">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" />
                Non-Custodial Vaults
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
                ReentrancyGuard Hardened
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FBBF24]" />
                IPFS Decentralized Storage
              </span>
            </div>

          </div>

          {/* Right Column: Featured Spotlight Card */}
          <div data-hero-card className="lg:col-span-5 w-full">
            {featuredProject ? (
              <Link
                to={`/project/${featuredProject.id}`}
                className="group block rounded-xl overflow-hidden p-6 hover:shadow-2xl transition-all duration-300 bg-[#161B26] border border-white/[0.08] hover:border-white/[0.18]"
              >
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#FBBF24]/10 border border-[#FBBF24]/20 text-[#FBBF24]">
                    {featuredProject.expired ? "Ended" : "Featured Spotlight"}
                  </span>
                  <span className="font-mono text-[11px] text-[#94A3B8] uppercase">
                    {categoryLabel(featuredProject.category)}
                  </span>
                </div>

                <div className="relative mt-4 aspect-video overflow-hidden rounded-lg bg-[#0A0D14]">
                  {featuredProject.cid ? (
                    <img
                      src={ipfsUrl(featuredProject.cid)}
                      alt={featuredProject.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-6 text-center font-mono text-xs text-[#94A3B8]">
                      RAYVIA ARCHIVE // CAMPAIGN #{featuredProject.id}
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-1.5">
                  <h3 className="font-display text-lg font-bold text-white group-hover:text-[#3B82F6] transition-colors line-clamp-1">
                    {featuredProject.name}
                  </h3>
                  <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                    {featuredProject.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/[0.06] space-y-2.5">
                  <ProgressBar percent={featuredProject.percent} />
                  
                  <div className="flex items-baseline justify-between font-mono text-xs">
                    <div>
                      <span className="font-bold text-white text-sm">{fmtEth(featuredProject.raised)}</span>
                      <span className="text-[#94A3B8] text-[11px]"> of {fmtEth(featuredProject.goal)} ETH</span>
                    </div>
                    <span className="font-bold text-[#34D399]">{Math.min(100, Math.floor(featuredProject.percent || 0))}%</span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-[#94A3B8] font-mono">
                    <span>{featuredProject.totalContributors || (featuredProject.contributors || []).length} Backers</span>
                    <span>{featuredProject.expired ? "Closed" : timeLeftLabel(featuredProject.secondsLeft)}</span>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="rounded-xl p-7 bg-[#161B26] border border-white/[0.08] shadow-card space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#3B82F6]">
                    Protocol Standby
                  </span>
                  <span className="font-mono text-[11px] text-[#94A3B8]">SMART CONTRACT</span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-xl font-bold text-white">
                    Deploy the next on-chain campaign.
                  </h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    The smart contract registry is active on Ethereum. Connect your MetaMask wallet, set your funding milestone, and deploy your project with automated escrow security.
                  </p>
                </div>

                <div className="rounded-lg border border-white/[0.06] bg-[#0F131C] p-3.5 space-y-2 font-mono text-xs text-[#94A3B8]">
                  <div className="flex justify-between">
                    <span>Contract File:</span>
                    <span className="text-white font-medium">crowdfunding.sol</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Layer:</span>
                    <span className="text-[#34D399] font-medium">ReentrancyGuard Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Refund Guarantee:</span>
                    <span className="text-[#3B82F6] font-medium">Autonomous On-Chain</span>
                  </div>
                </div>

                <Link to="/start-project" className="btn-sheen inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-all shadow-md shadow-blue-500/20">
                  <span>Launch a Campaign</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}

function Marquee() {
  return (
    <div className="overflow-hidden border-y border-white/[0.06] bg-[#080B10] py-3.5" aria-hidden="true">
      <div className="flex w-max items-center gap-8 anim-marquee">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} className="font-mono flex items-center gap-8 text-[#94A3B8] text-xs">
            {item}
            <span className="text-[#3B82F6]">✦</span>
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
    { label: "Active Campaigns", value: projects.length, suffix: "" },
    { label: "Total Ether Committed", value: totalRaised, decimals: 2, suffix: " ETH" },
    { label: "On-Chain Backers", value: totalBackers, suffix: "" },
    { label: "Settlement Guarantee", value: 100, suffix: "% Direct" },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className="rounded-xl p-5 border border-white/[0.08] bg-[#161B26] space-y-1">
            <div className="font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">{s.label}</div>
            <CountUp
              value={s.value}
              decimals={s.decimals || 0}
              suffix={s.suffix || ""}
              className="font-mono text-2xl font-bold tracking-tight text-white block mt-1"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function ProtocolArchitecture() {
  const steps = [
    {
      num: "01",
      icon: Zap,
      title: "Decentralized Project Deployment",
      desc: "Creators configure funding milestones, duration timestamps, and IPFS metadata without platform gatekeepers."
    },
    {
      num: "02",
      icon: Lock,
      title: "Non-Custodial Escrow Vaults",
      desc: "Incoming contributions are locked securely inside the verified smart contract. No middleman holds your funds."
    },
    {
      num: "03",
      icon: ShieldCheck,
      title: "Autonomous Settlement & Refunds",
      desc: "If the target is met by the deadline, funds release directly to the creator. If missed, backers claim instant automated refunds."
    }
  ];

  return (
    <section className="border-t border-white/[0.06] bg-[#07090E] py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <span className="font-mono text-xs uppercase tracking-wider text-[#3B82F6] font-semibold">
            Protocol Mechanics
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            How Rayvia executes on Ethereum.
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            Engineered with OpenZeppelin security contracts. Transparent code, immutable guarantees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="rounded-xl border border-white/[0.08] bg-[#161B26] p-6 space-y-4 hover:border-white/[0.16] transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#3B82F6]">{step.num}</span>
                  <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6]">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-display text-base font-bold text-white">
                  {step.title}
                </h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { projects, loading } = useProjects();
  const featured = projects.length > 0
    ? [...projects].sort((a, b) => (b.raised || 0) - (a.raised || 0))[0]
    : null;

  return (
    <div className="space-y-0">
      <Hero featuredProject={featured} loading={loading} />
      <Marquee />
      <Stats projects={projects} />

      {/* Featured Projects Grid Section */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-white/[0.06] space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="font-mono text-xs uppercase tracking-wider text-[#3B82F6] font-semibold">
              Live Campaigns
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Featured on Rayvia
            </h2>
          </div>

          <Link
            to="/discover"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#3B82F6] hover:underline"
          >
            <span>View All Campaigns</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <ProjectCardSkeleton count={3} />
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 6).map((project, idx) => (
              <ProjectCard key={project.id ?? idx} project={project} index={idx} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/[0.08] bg-[#161B26] p-12 text-center space-y-4 max-w-md mx-auto">
            <p className="font-mono text-xs text-[#94A3B8]">No active campaigns found in the smart contract registry.</p>
            <Link
              to="/start-project"
              className="btn-sheen inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-all"
            >
              <span>Launch First Campaign</span>
            </Link>
          </div>
        )}
      </section>

      <ProtocolArchitecture />

      {/* Bottom CTA Banner */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#161B26] p-8 sm:p-14 text-center space-y-6 shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Ready to bring your vision to life?
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              Deploy your project on-chain in under 3 minutes. Zero platform deductions, instant global funding.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/start-project"
              className="btn-sheen inline-flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-all shadow-md shadow-blue-500/20"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-semibold text-slate-200 bg-[#0A0D14] hover:bg-white/[0.05] border border-white/[0.1] transition-all"
            >
              <span>Explore Directory</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}