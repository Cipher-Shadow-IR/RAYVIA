import { Link } from "react-router-dom";
import { ExternalLink, ShieldCheck, HeartHandshake } from "lucide-react";

export default function Footer({ networkName }) {
  return (
    <footer className="border-t border-white/[0.06] bg-[#07090E] text-[#94A3B8] text-xs">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid gap-10 md:grid-cols-3">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <img src="/RAYVIA_LOGO.png" alt="RAYVIA Logo" className="h-7 w-7 object-contain shrink-0" />
            <span className="font-display text-xl font-bold tracking-tight text-white uppercase">
              RAYVIA<span className="text-[#3B82F6]">.</span>
            </span>
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-[#94A3B8]">
            Decentralized crowdfunding platform for ideas worth building. Governed by immutable Ethereum smart contracts with non-custodial payouts.
          </p>
          <div className="pt-2">
            <span className="text-[11px] text-[#94A3B8] font-mono">
              Engineered by{" "}
              <a
                href="https://galaxir.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-200 font-semibold hover:text-[#3B82F6] transition-colors underline"
              >
                Ishaan Ray
              </a>
            </span>
          </div>
        </div>

        <div className="md:justify-self-center space-y-3">
          <div className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            Protocol Directory
          </div>
          <ul className="space-y-2 text-xs font-mono text-[#94A3B8]">
            <li>
              <Link className="hover:text-white transition-colors" to="/">
                Home Platform
              </Link>
            </li>
            <li>
              <Link className="hover:text-white transition-colors" to="/discover">
                Discover Archive
              </Link>
            </li>
            <li>
              <Link className="hover:text-white transition-colors" to="/start-project">
                Deploy Campaign
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:justify-self-end space-y-3">
          <div className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            Developer Network
          </div>
          <ul className="space-y-2 text-xs font-mono text-[#94A3B8]">
            <li>
              <a
                href="https://github.com/Cipher-Shadow-IR"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/ishaan-ray-cs/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <span>LinkedIn Network</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <a
                href="https://galaxir.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <span>Portfolio Site</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/[0.04] bg-[#05070A] py-5">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-3 text-[11px] font-mono sm:flex-row text-[#94A3B8]">
          <span>© {new Date().getFullYear()} RAYVIA Protocol • Open Source MIT</span>
          <div className="flex items-center gap-2">
            <span className={`inline-block h-2 w-2 rounded-full ${networkName && networkName !== "NETWORK DISCONNECTED" ? "bg-[#34D399]" : "bg-rose-500"}`} />
            <span className="font-semibold text-slate-300">
              {networkName || "NETWORK DISCONNECTED"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}