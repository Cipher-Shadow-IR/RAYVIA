import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import WalletButton from "./WalletButton";
import { useWeb3 } from "../context/Web3Context";

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
    `relative px-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
      isActive ? "text-ink border-b-2 border-ink" : "text-ink-soft hover:text-ink"
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
      className={`glass sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-ink/10 shadow-sm" : "border-b border-transparent"
      }`}
    >
      <div className="container-page flex h-20 items-center justify-between gap-4">
        {/* Brand/Logo */}
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-surface-bright font-black text-sm tracking-tighter">
            R
          </div>
          <span className="font-display text-xl font-black tracking-tight text-ink uppercase">
            RAYVIA<span className="text-electric">.</span>
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkCls}>
              {link.label}
            </NavLink>
          ))}
          {account && (
            <NavLink to={`/profile/${account}`} className={linkCls}>
              PROFILE
            </NavLink>
          )}
        </nav>

        {/* Right Actions: Search & Wallet */}
        <div className="flex items-center gap-4">
          {/* Functional Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative hidden max-w-xs items-center gap-2 rounded-full border border-ink/10 bg-surface-container px-3.5 py-1.5 sm:flex">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-ink-faint" aria-hidden="true">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="bg-transparent text-xs text-ink outline-none placeholder:text-ink-faint/60 w-28 focus:w-44 transition-all duration-300 font-sans"
            />
          </form>

          <WalletButton />

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label="Toggle menu"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-ink/10 md:hidden"
            onClick={() => setOpen((o) => !o)}
          >
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-5 bg-ink transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-5 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-ink transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="border-t border-ink/10 bg-surface md:hidden">
          <div className="container-page py-4">
            <form onSubmit={handleSearchSubmit} className="mb-4 flex items-center gap-2 rounded-full border border-ink/10 bg-surface-container px-4 py-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-ink-faint">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="bg-transparent text-xs text-ink outline-none placeholder:text-ink-faint/60 w-full font-sans"
              />
            </form>
            <nav className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `border-b border-ink/5 py-3 text-xs font-bold uppercase tracking-wider ${
                      isActive ? "text-electric" : "text-ink"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              {account ? (
                <NavLink
                  to={`/profile/${account}`}
                  onClick={() => setOpen(false)}
                  className="border-b border-ink/5 py-3 text-xs font-bold uppercase tracking-wider text-ink"
                >
                  My Profile
                </NavLink>
              ) : null}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}