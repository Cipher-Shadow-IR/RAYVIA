import { useState } from "react";
import { Copy, Check, ExternalLink, LogOut, Wallet, ChevronDown } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { truncateAddress } from "../lib/crowdfunding";
import { EXPLORER_URL } from "../config/contract";

export default function WalletButton({ className = "" }) {
  const { account, balance, isConnected, connect, disconnect, isConnecting, networkLabel } = useWeb3();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!account) return;
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <button
        type="button"
        onClick={connect}
        disabled={isConnecting}
        className={`inline-flex items-center justify-center gap-2 h-9 px-3 sm:px-4 rounded-lg border border-[#3B82F6]/30 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 ${className}`}
      >
        {isConnecting ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="hidden sm:inline">Connecting…</span>
          </>
        ) : (
          <>
            <Wallet className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Connect Wallet</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 sm:gap-2.5 h-9 px-2.5 sm:px-3.5 rounded-lg border border-white/[0.08] bg-[#161B26] hover:bg-[#1C2331] text-xs transition-colors cursor-pointer group"
      >
        <span className="h-2 w-2 rounded-full bg-[#34D399] shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse shrink-0" />
        
        {balance && parseFloat(balance) > 0 && (
          <span className="hidden sm:flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-[#34D399]">
              {balance} <span className="font-sans text-[10px] text-[#94A3B8] font-normal">ETH</span>
            </span>
            <span className="w-px h-3 bg-white/[0.12]" />
          </span>
        )}

        <span className="font-mono text-xs font-medium text-slate-200">
          {truncateAddress(account)}
        </span>

        <ChevronDown className="w-3 h-3 text-[#94A3B8] group-hover:text-white transition-transform group-hover:translate-y-0.5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-xl border border-white/[0.08] bg-[#161B26] backdrop-blur-xl p-2 shadow-2xl animate-in fade-in duration-150 space-y-1">
            
            <div className="border-b border-white/[0.06] px-3 py-2.5 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#94A3B8] uppercase font-semibold">Wallet Hub</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6]">
                  {networkLabel}
                </span>
              </div>
              <div className="truncate font-mono text-xs text-white select-all font-medium pt-0.5">
                {account}
              </div>
              {balance && parseFloat(balance) > 0 && (
                <div className="flex items-center justify-between pt-1.5 text-[11px] font-mono">
                  <span className="text-[#94A3B8] uppercase font-semibold">Balance</span>
                  <span className="text-[#34D399] font-bold">{balance} ETH</span>
                </div>
              )}
            </div>

            <div className="space-y-0.5 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-mono text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {copied ? <Check className="w-3.5 h-3.5 text-[#34D399]" /> : <Copy className="w-3.5 h-3.5 text-[#94A3B8]" />}
                  <span>{copied ? "Copied to Clipboard" : "Copy Address"}</span>
                </div>
                <span className="text-[10px] text-[#94A3B8]">0x</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.open(`${EXPLORER_URL}/address/${account}`, "_blank", "noopener");
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-mono text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>View on Explorer</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  disconnect();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-mono text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect Wallet</span>
              </button>
            </div>

          </div>
        </>
      )}
    </div>
  );
}