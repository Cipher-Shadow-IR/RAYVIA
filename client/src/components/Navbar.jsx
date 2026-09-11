import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Layers, Plus, Search, Menu, X, Compass, ExternalLink } from "lucide-react";
import WalletButton from "./WalletButton";
import { useWeb3 } from "../context/Web3Context";

import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/discover", label: "Discover" },
  { to: "/start-project", label: "Start a Project" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { account } = useWeb3();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkCls = ({ isActive }) =>
    `relative px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-full whitespace-nowrap ${
      isActive
        ? "text-white bg-white/[0.08] font-bold shadow-sm"
        : "text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
    }`;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/discover?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setOpen(false);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#0A0D14]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl"
          : "bg-[#0A0D14]/60 backdrop-blur-md border-b border-white/[0.04]"
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex h-20 items-center justify-between gap-4">
        
        <div className="flex items-center justify-start min-w-0 shrink-0">
          <Link to="/" className="flex items-center gap-3 group py-1" onClick={() => setOpen(false)}>
            <img
              src="/RAYVIA_LOGO.png"
              alt="RAYVIA Logo"
              className="h-9 w-9 object-contain group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="font-display text-xl font-bold tracking-tight text-white uppercase">
                RAYVIA<span className="text-[#3B82F6]">.</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-[#FBBF24] bg-[#FBBF24]/10 border border-[#FBBF24]/20 rounded-md">
                EVM V2
              </span>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center justify-center flex-1">
          <div className="flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-full border border-white/[0.08] shadow-sm">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkCls}>
                {link.label}
              </NavLink>
            ))}
            {account && (
              <NavLink to={`/profile/${account}`} className={linkCls}>
                Profile
              </NavLink>
            )}
          </div>
        </nav>

        <div className="flex items-center justify-end min-w-0 gap-2 sm:gap-3 shrink-0">
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden max-w-xs items-center gap-2 rounded-lg border border-white/[0.08] bg-[#161B26] h-9 px-3 sm:flex focus-within:border-[#3B82F6] transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="bg-transparent text-xs text-white outline-none placeholder:text-[#94A3B8]/60 w-28 focus:w-40 transition-all duration-300 font-sans"
            />
          </form>

          <ThemeToggle />

          <WalletButton />

          <button
            type="button"
            aria-label="Toggle menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] light:border-black/[0.1] bg-white/[0.03] light:bg-black/[0.03] text-[#94A3B8] light:text-[#475569] hover:text-white light:hover:text-black md:hidden"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {open && (
        <div className="md:hidden border-b border-white/[0.08] light:border-black/[0.08] bg-[#0A0D14]/95 light:bg-white/95 backdrop-blur-2xl px-6 py-5 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2 rounded-lg border border-white/[0.08] light:border-black/[0.1] bg-[#161B26] light:bg-[#f1f5f9] px-3 py-2">
            <Search className="w-4 h-4 text-[#94A3B8] light:text-[#475569]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="bg-transparent text-sm text-white light:text-[#0f172a] outline-none placeholder:text-[#94A3B8] light:placeholder:text-[#475569] w-full font-sans"
            />
          </form>

          <div className="space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-sm font-medium text-[#94A3B8] light:text-[#475569] hover:text-white light:hover:text-black hover:bg-white/[0.04] light:hover:bg-black/[0.04]"
              >
                {link.label}
              </Link>
            ))}
            {account && (
              <Link
                to={`/profile/${account}`}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-sm font-medium text-[#94A3B8] light:text-[#475569] hover:text-white light:hover:text-black hover:bg-white/[0.04] light:hover:bg-black/[0.04]"
              >
                My Profile & Backed Projects
              </Link>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] light:border-black/[0.08]">
            <span className="text-xs font-mono text-[#94A3B8] light:text-[#475569] uppercase">Switch Theme</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}