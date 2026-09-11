import React from "react";

export function Spinner({ className = "" }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function ProjectCardSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#161B26]">
          <div className="aspect-video animate-pulse bg-white/[0.04]" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-3/4 animate-pulse rounded bg-white/[0.06]" />
            <div className="h-3 w-full animate-pulse rounded bg-white/[0.03]" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.03]" />
            <div className="h-1.5 w-full animate-pulse rounded-full bg-white/[0.06] mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageLoader({ label = "Syncing Ethereum Protocol State…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-32 text-center">
      <div className="relative flex items-center justify-center w-20 h-20">
        <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping opacity-60" />
        <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-blue-500/20 via-indigo-500/10 to-emerald-400/20 blur-xl animate-pulse" />
        <img
          src="/RAYVIA_LOGO.png"
          alt="RAYVIA"
          className="relative z-10 w-14 h-14 object-contain animate-bounce [animation-duration:2.5s]"
        />
      </div>
      
      <div className="space-y-1.5 max-w-xs">
        <span className="font-display text-sm font-bold tracking-widest uppercase text-white block">
          RAYVIA<span className="text-[#3B82F6]">.</span>
        </span>
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#3B82F6] block">
          {label}
        </span>
        <p className="font-mono text-[11px] text-[#94A3B8]">
          Querying smart contract on-chain storage
        </p>
      </div>

      <div className="w-44 h-1 bg-white/[0.08] rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#34D399] w-3/4 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

export function Web3LoadingOverlay({ message = "Broadcasting Transaction...", txHash }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-xl bg-[#161B26] border border-white/[0.1] shadow-2xl p-6 text-center space-y-5">
        
        <div className="relative mx-auto flex items-center justify-center w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-pulse" />
          <div className="absolute inset-2 rounded-full border-2 border-blue-500/30 border-t-[#3B82F6] border-r-[#34D399] animate-spin" />
          <div className="w-3 h-3 rounded-full bg-[#34D399] shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
        </div>

        <div className="space-y-1">
          <h4 className="text-base font-bold text-white font-display">
            {message}
          </h4>
          <p className="font-mono text-xs text-[#94A3B8]">
            Awaiting cryptographic block confirmation
          </p>
        </div>

        {txHash && (
          <div className="p-2.5 rounded-lg bg-[#0F131C] border border-white/[0.06] text-xs font-mono text-[#94A3B8] truncate">
            Tx: {txHash}
          </div>
        )}

        <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#3B82F6] to-[#34D399] w-3/4 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}