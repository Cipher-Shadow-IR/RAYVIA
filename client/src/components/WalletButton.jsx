import { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { truncateAddress } from "../lib/crowdfunding";
import { EXPLORER_URL } from "../config/contract";

export default function WalletButton({ className = "" }) {
  const { account, isConnected, connect, disconnect, isConnecting, networkLabel } = useWeb3();
  const [open, setOpen] = useState(false);

  if (!isConnected) {
    return (
      <button
        type="button"
        onClick={connect}
        disabled={isConnecting}
        className={`btn-primary whitespace-nowrap ${className}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M15.5 12h4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {isConnecting ? "Connecting…" : "Connect Wallet"}
      </button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn-outline whitespace-nowrap font-mono"
      >
        <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_8px_rgba(22,163,74,0.9)]" />
        {truncateAddress(account)}
        <span className="hidden text-xs text-ink-faint sm:inline">{networkLabel}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-cards border border-outline-soft p-2 shadow-float bg-surface-bright">
            <div className="border-b border-outline-soft px-3 py-2">
              <div className="label-caps text-ink-faint text-[10px]">Connected Wallet</div>
              <div className="mt-1 truncate font-mono text-xs text-ink select-all">{account}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                window.open(`${EXPLORER_URL}/address/${account}`, "_blank", "noopener");
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-ink hover:bg-ink/5"
            >
              View on explorer
            </button>
            <button
              type="button"
              onClick={() => {
                disconnect();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-danger hover:bg-danger/10"
            >
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
}