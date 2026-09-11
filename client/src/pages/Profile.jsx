import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { useProfile } from "../hooks/useProfile";
import ProjectCard from "../components/ProjectCard";
import CountUp from "../components/CountUp";
import Reveal from "../components/Reveal";
import { PageLoader } from "../components/Loading";
import ErrorState from "../components/StateViews";
import EmptyState from "../components/StateViews";
import { fmtEth, truncateAddress } from "../lib/crowdfunding";
import { EXPLORER_URL } from "../config/contract";

export default function Profile() {
  const { address: paramAddress } = useParams();
  const { account, isConnected, connect } = useWeb3();
  const address = paramAddress || account || null;
  const { created, funded, totalContributed, loading, error, refresh } = useProfile(address);
  const [tab, setTab] = useState("created");

  const display = useMemo(
    () => ({
      isSelf: !paramAddress && Boolean(account),
      address,
    }),
    [paramAddress, account, address]
  );

  const tabs = [
    { id: "created", label: `Created · ${created.length}` },
    { id: "funded", label: `Backed · ${funded.length}` },
  ];

  const totalRaised = useMemo(() => {
    return created.reduce((acc, p) => acc + p.raised, 0);
  }, [created]);

  if (!address) {
    return (
      <div className="container-page py-16 md:py-24">
        <Reveal className="mx-auto max-w-lg text-center">
          <div className="label-caps text-electric tracking-widest text-[11px]">On-Chain Profile</div>
          <h1 className="mt-6 text-4xl font-display font-black tracking-tight text-ink uppercase leading-none">Who are you?</h1>
          <p className="mt-6 text-ink-soft leading-relaxed font-sans">
            Connect your MetaMask wallet to view your created campaigns, contribution metrics, and funding stats.
          </p>
          {isConnected ? (
            <p className="mt-6 text-xs text-ink-faint font-mono">
              Connected account not recognised — head to /profile/{account}.
            </p>
          ) : (
            <button type="button" onClick={connect} className="btn-primary btn-lg mt-8 px-8 py-4">
              Connect Wallet
            </button>
          )}
        </Reveal>
      </div>
    );
  }

  if (loading) return <PageLoader label="Loading profile data…" />;
  if (error) return <div className="container-page py-16 md:py-24"><ErrorState message={error} onRetry={refresh} /></div>;

  const avatarChar = address && address.length > 2 ? address.slice(2, 3).toUpperCase() : "?";

  return (
    <div className="container-page py-16 md:py-24 space-y-12">
      <Reveal className="border-b border-outline-soft pb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-navy text-surface-bright font-display text-2xl font-black uppercase">
            {avatarChar}
          </div>
          <div className="min-w-0">
            <div className="label-caps text-electric tracking-widest text-[10px] font-bold">
              {display.isSelf ? "MY WALLET PROFILE" : "ON-CHAIN PROFILE"}
            </div>
            <a
              href={`${EXPLORER_URL}/address/${display.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block font-mono text-base sm:text-lg md:text-xl font-bold text-ink hover:text-electric transition-colors break-all sm:break-normal select-all"
            >
              {display.address}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`${EXPLORER_URL}/address/${display.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-xs uppercase tracking-wider font-bold py-2.5 px-4"
          >
            View on Explorer ↗
          </a>
        </div>
      </Reveal>

      <Reveal className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: "Created Campaigns", value: created.length, suffix: "" },
          { label: "Total ETH Raised", value: totalRaised, suffix: " ETH", decimals: 2 },
          { label: "Backed Campaigns", value: funded.length, suffix: "" },
          { label: "Total ETH Backed", value: totalContributed, suffix: " ETH", decimals: 2 },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 sm:p-6 min-w-0 border border-outline-soft bg-surface-bright shadow-sm rounded-cards">
            <div className="label-caps text-ink-faint text-[10px] tracking-wider">{stat.label}</div>
            <CountUp
              value={stat.value}
              decimals={stat.decimals || 0}
              suffix={stat.suffix}
              className="mt-3 font-display text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-ink leading-tight break-words"
            />
          </div>
        ))}
      </Reveal>

      <Reveal className="flex gap-2 border-b border-outline-soft pb-0 overflow-x-auto whitespace-nowrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              tab === t.id ? "border-b-2 border-electric text-ink" : "text-ink-faint hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </Reveal>

      <div>
        {tab === "created" && (
          created.length === 0 ? (
            <EmptyState
              title="No projects created"
              body={display.isSelf ? "When you launch a campaign it will appear here." : "This address hasn't created any campaigns yet."}
              action={display.isSelf ? <Link to="/start-project" className="btn-primary btn-sm uppercase font-bold text-xs">Start a Project</Link> : null}
            />
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {created.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 0.06} y={20} className="h-full">
                  <ProjectCard project={p} index={i} />
                </Reveal>
              ))}
            </div>
          )
        )}

        {tab === "funded" && (
          funded.length === 0 ? (
            <EmptyState
              title="Nothing backed yet"
              body={display.isSelf ? "Support a project on Discover and it'll show up here with your contribution amount." : "This address hasn't backed any campaigns yet."}
              action={display.isSelf ? <Link to="/discover" className="btn-primary btn-sm uppercase font-bold text-xs">Discover Projects</Link> : null}
            />
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {funded.map((f, i) => (
                <Reveal key={f.id} delay={(i % 3) * 0.06} y={20} className="h-full flex flex-col justify-between">
                  <div>
                    <ProjectCard project={f} index={i} />
                    <div className="mt-3 flex justify-between items-center rounded-md bg-surface-container-low border border-outline-soft px-4 py-2.5 text-xs font-sans text-ink-soft">
                      <span>Your Contribution</span>
                      <strong className="font-mono text-ink font-semibold">{fmtEth(f.contributed)}</strong>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}