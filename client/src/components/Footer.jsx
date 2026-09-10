import { Link } from "react-router-dom";

export default function Footer({ networkName }) {
  return (
    <footer className="band-dark border-t border-surface/10">
      <div className="container-page grid gap-10 py-16 md:grid-cols-3">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl font-extrabold tracking-tight text-surface-bright uppercase">
              RAYVIA<span className="text-electric-bright">.</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-surface-bright/70 font-sans">
            A decentralized platform for ideas worth building. Governed by immutable Ethereum smart contracts.
          </p>
          <p className="mt-6 text-xs text-surface-bright/50 font-sans">
            Architected & engineered by{" "}
            <a
              href="https://galaxir.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-surface-bright font-semibold underline hover:text-electric-bright transition-colors"
            >
              ISHAAN RAY
            </a>
          </p>
        </div>

        {/* Links */}
        <div className="md:justify-self-center">
          <div className="label-caps text-surface-bright/50 mb-4">Platform</div>
          <ul className="space-y-2.5 text-xs font-bold uppercase tracking-wider text-surface-bright/80">
            <li>
              <Link className="hover:text-surface-bright transition-colors" to="/">
                Home
              </Link>
            </li>
            <li>
              <Link className="hover:text-surface-bright transition-colors" to="/discover">
                Discover Archive
              </Link>
            </li>
            <li>
              <Link className="hover:text-surface-bright transition-colors" to="/start-project">
                Launch Campaign
              </Link>
            </li>
          </ul>
        </div>

        {/* Socials & Developer Links */}
        <div className="md:justify-self-end">
          <div className="label-caps text-surface/40 mb-4">Platform Creator</div>
          <ul className="space-y-2 text-sm text-surface/75">
            <li>
              <a
                href="https://github.com/Cipher-Shadow-IR"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/ishaan-ray-cs/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="https://galaxir.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Portfolio
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-surface/10 bg-black/20">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 text-xs text-surface/50 sm:flex-row">
          <span>© {new Date().getFullYear()} RAYVIA. Built for the decentralized web.</span>
          <div className="flex items-center gap-2">
            <span className={`inline-block h-2 w-2 rounded-full ${networkName && networkName !== "NETWORK DISCONNECTED" ? "bg-success" : "bg-danger"}`} />
            <span className="font-mono tracking-wider font-semibold text-surface/75">
              {networkName || "NETWORK DISCONNECTED"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}