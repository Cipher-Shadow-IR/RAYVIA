import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useProject } from "../hooks/useProject";
import { useWeb3 } from "../context/Web3Context";
import { useContractActions } from "../hooks/useContractActions";
import { useToasts } from "../context/ToastContext";
import ProgressBar from "../components/ProgressBar";
import CategoryChip from "../components/CategoryChip";
import PolicyTag from "../components/PolicyTag";
import Reveal from "../components/Reveal";
import { PageLoader } from "../components/Loading";
import ErrorState from "../components/StateViews";
import EmptyState from "../components/StateViews";
import {
  fmtEth,
  formatTimestamp,
  ipfsUrl,
  truncateAddress,
} from "../lib/crowdfunding";
import { EXPLORER_URL } from "../config/contract";

function ContributorList({ contributors }) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? contributors : contributors.slice(0, 8);
  return (
    <div className="border-t border-outline-soft pt-8 mt-10">
      <div className="mb-4 flex items-center justify-between">
        <span className="label-caps text-ink-faint tracking-widest text-[11px]">Backers ({contributors.length})</span>
      </div>
      {contributors.length === 0 ? (
        <div className="text-sm text-ink-faint py-3 font-sans">No contributions yet. Be the first to back this project!</div>
      ) : (
        <ul className="space-y-2">
          {shown.map((c, i) => (
            <li
              key={`${c.address}-${i}`}
              className="flex items-center justify-between rounded-md border border-outline-soft bg-surface-container-low px-4 py-3"
            >
              <a
                href={`${EXPLORER_URL}/address/${c.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-ink-soft transition-colors hover:text-electric"
              >
                {truncateAddress(c.address)}
              </a>
              <span className="font-mono text-xs font-bold text-ink">{fmtEth(c.amount)}</span>
            </li>
          ))}
        </ul>
      )}
      {contributors.length > 8 && (
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="btn-outline btn-sm mt-4 w-full sm:w-auto"
        >
          {showAll ? "Show less" : `Show all ${contributors.length} backers`}
        </button>
      )}
    </div>
  );
}

function ActionPanel({ project, actions }) {
  const { account, isConnected, connect, provider } = useWeb3();
  const { fundProject, claimFund, claimRefund } = actions;
  const { success, error: notifyError } = useToasts();
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(null);

  const [confirmModal, setConfirmModal] = useState(false);
  const [txState, setTxState] = useState("");

  const [timerString, setTimerString] = useState("Loading...");
  const [isOver, setIsOver] = useState(project.expired);

  const isOwner = useMemo(
    () => account && account.toLowerCase() === String(project.creatorAddress).toLowerCase(),
    [account, project.creatorAddress]
  );

  const contribution = useMemo(() => {
    if (!account) return 0;
    const found = project.contributors.find(
      (c) => c.address.toLowerCase() === account.toLowerCase()
    );
    return found ? found.amount : 0;
  }, [account, project.contributors]);

  const refundClaimed = useMemo(() => {
    if (!account) return false;
    const found = project.contributors.find(
      (c) => c.address.toLowerCase() === account.toLowerCase()
    );
    return found ? found.refundClaimed : false;
  }, [account, project.contributors]);

  const isExpired = isOver || project.expired;

  const canClaim = !project.claimedAmount && isExpired && (
    project.refundPolicy === 1  || project.goalMet
  );

  const canRefund =
    isExpired &&
    project.refundPolicy === 0  &&
    !project.goalMet &&
    contribution > 0 &&
    !refundClaimed;

  useEffect(() => {
    if (!project.creationTime || !project.duration || !provider) {
      return;
    }

    let cancelled = false;
    let timeoutId = null;

    let anchorBlockchainTime = 0;
    let anchorPerformanceTime = 0;
    let lastFetchedBlock = -1;

    const renderCountdown = () => {
      if (cancelled || !anchorBlockchainTime) return;

      const elapsedSeconds = Math.floor(
        (performance.now() - anchorPerformanceTime) / 1000
      );

      const currentBlockchainTime = anchorBlockchainTime + elapsedSeconds;
      const endTime = project.creationTime + project.duration;
      const remainingTime = endTime - currentBlockchainTime;

      if (remainingTime <= 0) {
        setTimerString("Ended");
        setIsOver(true);
        timeoutId = null;
        return;
      }

      setIsOver(false);
      const days = Math.floor(remainingTime / (60 * 60 * 24));
      const hours = Math.floor(
        (remainingTime % (60 * 60 * 24)) / (60 * 60)
      );
      const minutes = Math.floor((remainingTime % (60 * 60)) / 60);
      const seconds = Math.floor(remainingTime % 60);

      const label = days > 0
        ? `${days}d ${hours}h left`
        : hours > 0
          ? `${hours}h ${minutes}m left`
          : `${minutes}m ${seconds}s left`;

      setTimerString(label);
      timeoutId = setTimeout(renderCountdown, 1000);
    };

    const syncWithBlock = async (blockNumber) => {
      try {
        const block =
          typeof blockNumber === "number"
            ? await provider.getBlock(blockNumber)
            : await provider.getBlock("latest");

        if (cancelled || !block) return;
        if (block.number < lastFetchedBlock) return;
        lastFetchedBlock = block.number;

        anchorBlockchainTime = block.timestamp;
        anchorPerformanceTime = performance.now();

        if (timeoutId) clearTimeout(timeoutId);
        renderCountdown();
      } catch (error) {
        console.error("Failed to sync countdown with blockchain:", error);
      }
    };

    const handleBlock = (blockNumber) => syncWithBlock(blockNumber);
    provider.on("block", handleBlock);
    syncWithBlock();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (provider.removeListener) provider.removeListener("block", handleBlock);
    };
  }, [project.creationTime, project.duration, provider]);

  const run = async (fn, label) => {
    if (!isConnected) {
      notifyError("Connect your wallet first.");
      await connect();
      return;
    }
    setBusy(label);
    try {
      await fn();
      success("Transaction confirmed.");
    } catch (err) {
      notifyError(err?.reason || err?.message || `${label} failed.`);
    } finally {
      setBusy(null);
    }
  };

  const onFund = () => {
    const val = Number(amount);
    if (!amount || Number.isNaN(val) || val <= 0) {
      notifyError("Enter a valid contribution amount.");
      return;
    }
    setConfirmModal(true);
    setTxState("Waiting for wallet confirmation...");
  };

  const onConfirmBacking = async () => {
    setBusy("funding");
    setTxState("Waiting for wallet...");
    try {
      await fundProject(project.id, amount, (hash) => {
        setTxState("Confirming transaction...");
        success("Funding submitted — waiting for confirmation…");
      });
      setTxState("Transaction confirmed");
      success("Transaction confirmed.");
      setAmount("");
      setTimeout(() => {
        setConfirmModal(false);
        setBusy(null);
      }, 1500);
    } catch (err) {
      setTxState("Transaction failed");
      notifyError(err?.reason || err?.message || "Funding failed.");
      setTimeout(() => {
        setBusy(null);
      }, 1500);
    }
  };

  return (
    <>
      <Reveal className="card p-5 sm:p-8 shadow-sm border border-outline-soft sticky top-24 lg:top-28 bg-surface-bright rounded-cards">
        <div className="flex items-center justify-between">
          <span className="label-caps text-ink-faint tracking-widest text-[11px]">Funding Panel</span>
          {isOwner && <span className="chip-soft text-[10px] font-bold">YOUR PROJECT</span>}
        </div>

        <div className="mt-6 flex justify-between items-baseline">
          <div>
            <div className="font-mono text-3xl font-bold text-ink">
              {fmtEth(project.raised)}
            </div>
            <div className="text-xs text-ink-soft mt-1">
              raised of <span className="font-semibold text-ink">{fmtEth(project.goal)}</span> goal
            </div>
          </div>
          <div className="font-mono text-2xl font-black text-electric">
            {Math.min(100, Math.floor(project.percent || 0))}%
          </div>
        </div>

        <div className="mt-5">
          <ProgressBar percent={project.percent} />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="card bg-surface-container-low p-4 border border-outline-soft text-center">
            <div className="font-mono text-2xl font-bold text-ink">
              {project.totalContributors || (project.contributors || []).length}
            </div>
            <div className="label-caps text-ink-faint text-[9px] mt-1.5 tracking-wider">Backers</div>
          </div>
          <div className="card bg-surface-container-low p-4 border border-outline-soft text-center">
            <div className="font-mono text-[14px] font-bold text-ink truncate leading-8 uppercase">
              {timerString}
            </div>
            <div className="label-caps text-ink-faint text-[9px] tracking-wider">Time Remaining</div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <PolicyTag id={project.refundPolicy} />
          <CategoryChip id={project.category} />
        </div>

        {!isExpired && !isOwner && (
          <div className="mt-6 border-t border-outline-soft pt-6">
            <label htmlFor="fund-amount" className="field-label">Contribution Amount (ETH)</label>
            <div className="flex items-center gap-3">
              <input
                id="fund-amount"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 0.5"
                className="field flex-1 font-mono"
              />
              <button type="button" onClick={onFund} disabled={busy} className="btn-primary whitespace-nowrap px-6 py-3 font-bold uppercase text-xs">
                {busy === "funding" ? "Funding…" : "Back"}
              </button>
            </div>
            {isConnected && (
              <button
                type="button"
                onClick={() => setAmount(String(Math.max(0.01, project.goal - project.raised || 0.01)).slice(0, 6))}
                className="mt-2 text-xs text-electric hover:underline block font-sans"
              >
                Fill remaining gap ({fmtEth(Math.max(0, project.goal - project.raised))})
              </button>
            )}
          </div>
        )}

        {isOwner && !isExpired && (
          <div className="mt-6 rounded-md border border-outline-soft bg-surface-container-low p-4 text-xs text-ink-soft text-center font-sans">
            This project is active. Claim raised funds here once it expires on {formatTimestamp(project.deadline)}.
          </div>
        )}

        {isOwner && isExpired && (
          <div className="mt-6 border-t border-outline-soft pt-6">
            {canClaim ? (
              <button
                type="button"
                onClick={() => run(() => claimFund(project.id), "claiming")}
                disabled={busy}
                className="btn-electric w-full py-4 text-center font-bold uppercase tracking-wider text-xs"
              >
                {busy === "claiming" ? "Claiming…" : `Claim ${fmtEth(project.raised)} Payout`}
              </button>
            ) : project.claimedAmount ? (
              <div className="rounded-md border border-success/25 bg-success/10 px-4 py-3 text-center text-sm font-bold text-success font-sans">
                Funds claimed ✓
              </div>
            ) : (
              <div className="rounded-md border border-danger/25 bg-danger/10 px-4 py-3 text-center text-xs text-danger font-sans leading-relaxed">
                {project.goalMet
                  ? "Payout rules not satisfied."
                  : "Funding goal was not met, and this is a Refundable campaign. Creators cannot claim funds."}
              </div>
            )}
          </div>
        )}

        {!isOwner && isExpired && (
          <div className="mt-6 border-t border-outline-soft pt-6">
            {canRefund ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md border border-outline-soft bg-surface-container-low px-4 py-3 text-sm">
                  <span className="text-ink-soft">Your contribution</span>
                  <span className="font-mono font-semibold text-ink">{fmtEth(contribution)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => run(() => claimRefund(project.id), "refunding")}
                  disabled={busy}
                  className="btn-electric w-full py-4 font-bold uppercase tracking-wider text-xs"
                >
                  {busy === "refunding" ? "Refunding…" : "Claim Full Refund"}
                </button>
              </div>
          ) : refundClaimed ? (
            <div className="rounded-md border border-success/25 bg-success/10 px-4 py-3 text-center text-sm font-bold text-success font-sans">
              Refund claimed ✓
            </div>
          ) : contribution > 0 ? (
            <div className="rounded-md border border-outline-soft bg-surface-container-low px-4 py-3 text-center text-xs text-ink-soft font-sans">
              This campaign ended successfully. Refund policy is inactive.
            </div>
          ) : (
            <div className="rounded-md border border-outline-soft bg-surface-container-low px-4 py-3 text-center text-xs text-ink-soft font-sans">
              This campaign has ended.
            </div>
          )}
        </div>
      )}

      {!isConnected && !isExpired && (
        <p className="mt-4 text-center text-xs text-ink-faint font-sans">
          Connect your wallet to support this project.
        </p>
      )}
    </Reveal>

    {confirmModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
        <div className="card w-full max-w-md p-8 bg-surface-bright border border-outline-soft shadow-float relative space-y-6 rounded-cards">
          <button
            type="button"
            onClick={() => {
              if (txState !== "Confirming transaction...") {
                setConfirmModal(false);
              }
            }}
            className="absolute right-6 top-6 text-ink-faint hover:text-ink transition-colors text-lg font-mono font-bold"
            disabled={busy === "funding"}
          >
            ✕
          </button>

          <div className="space-y-2 text-center">
            <div className="label-caps text-electric tracking-widest text-[11px] font-bold">BACK THIS PROJECT</div>
            <h3 className="font-display font-black text-2xl text-ink uppercase truncate">{project.name}</h3>
          </div>

          <div className="border-y border-outline-soft py-4 space-y-3 font-sans text-sm">
            <div className="flex justify-between">
              <span className="text-ink-soft">Your Contribution</span>
              <strong className="font-mono text-ink font-bold text-base">{amount} ETH</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Current Funding</span>
              <span className="font-mono text-ink font-semibold">{fmtEth(project.raised)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Funding Goal</span>
              <span className="font-mono text-ink font-semibold">{fmtEth(project.goal)}</span>
            </div>
          </div>

          {busy === "funding" ? (
            <div className="text-center py-4 space-y-4">
              <div className="flex justify-center">
                <span className="animate-spin rounded-full h-8 w-8 border-2 border-electric border-t-transparent" />
              </div>
              <p className="text-xs text-ink font-mono font-semibold uppercase tracking-wider animate-pulse">
                {txState}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {txState === "Transaction confirmed" && (
                <div className="rounded-md border border-success/25 bg-success/5 p-3 text-center text-xs text-success font-semibold">
                  Transaction Confirmed ✓
                </div>
              )}
              {txState === "Transaction failed" && (
                <div className="rounded-md border border-danger/25 bg-danger/5 p-3 text-center text-xs text-danger font-semibold">
                  Transaction Failed ✗
                </div>
              )}
              <button
                type="button"
                onClick={onConfirmBacking}
                className="btn-electric w-full py-4 font-bold uppercase tracking-wider text-xs"
              >
                CONFIRM BACKING
              </button>
              <p className="text-[10px] text-center text-ink-faint font-normal leading-relaxed font-sans">
                Enforced by immutable smart contracts. Backing is final and can only be refunded if the campaign policy permits and the goal fails.
              </p>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { project, loading, error, refresh } = useProject(id);
  const actions = useContractActions();
  const [imgError, setImgError] = useState(false);

  if (loading) return <PageLoader label="Loading campaign details…" />;
  if (error) return <div className="container-page py-16 md:py-24"><ErrorState message={error} onRetry={refresh} /></div>;
  if (!project) {
    return (
      <div className="container-page py-16 md:py-24">
        <EmptyState
          title="Campaign not found"
          body="The campaign you're looking for doesn't exist on-chain."
          action={<Link to="/discover" className="btn-primary btn-sm">Back to Discover</Link>}
        />
      </div>
    );
  }

  const src = ipfsUrl(project.cid);

  return (
    <div className="container-page py-16 md:py-24">
      <div className="mb-8 flex flex-wrap items-center gap-2 font-mono text-xs text-ink-faint">
        <Link to="/discover" className="hover:text-electric transition-colors">DISCOVER</Link>
        <span>/</span>
        <span>PROJECT #{project.id}</span>
        <span>/</span>
        <span className="text-ink uppercase tracking-tight font-semibold">{project.name}</span>
      </div>

      <div className="grid gap-12 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 space-y-8 min-w-0">
          <Reveal className="relative aspect-video w-full overflow-hidden rounded-cards border border-outline-soft bg-surface-container-high">
            {src && !imgError ? (
              <img
                src={src}
                alt={project.name}
                className="h-full w-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-navy text-surface-bright">
                <span className="font-mono text-4xl sm:text-6xl font-black tracking-tight text-surface-bright/40">RAYVIA</span>
                <span className="font-mono text-xs tracking-widest text-surface-bright/50">CAMPAIGN ARCHIVE #{project.id}</span>
              </div>
            )}
          </Reveal>

          <Reveal className="space-y-6">
            <h1 className="font-display font-black text-3xl md:text-4xl text-ink leading-tight uppercase">
              {project.name}
            </h1>

            <div className="flex items-center gap-4 border-t border-b border-outline-soft py-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-navy text-surface-bright font-display text-xl font-bold uppercase">
                {(project.creatorName || "C").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="label-caps text-ink-faint text-[10px] tracking-wider">ON-CHAIN CREATOR</div>
                <div className="font-display font-black text-ink text-base mt-0.5 truncate uppercase">
                  {project.creatorName || "Anonymous Creator"}
                </div>
                <div className="font-mono text-xs text-ink-soft mt-0.5 truncate select-all select-text">
                  {project.creatorAddress}
                </div>
              </div>
            </div>

            <article className="pt-2">
              <h2 className="label-caps text-ink-faint tracking-widest text-[11px] mb-4">About this project</h2>
              <p className="whitespace-pre-wrap text-base md:text-lg leading-relaxed text-ink-soft font-sans">
                {project.description}
              </p>
            </article>
          </Reveal>

          <Reveal>
            <ContributorList contributors={project.contributors} />
          </Reveal>
        </div>

        <aside className="lg:col-span-5">
          <ActionPanel project={project} actions={actions} />
        </aside>
      </div>
    </div>
  );
}