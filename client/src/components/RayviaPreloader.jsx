import { useEffect, useState } from "react";
import gsap from "gsap";

export default function RayviaPreloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const t = setTimeout(() => setDone(true), 100);
      return () => clearTimeout(t);
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setTimeout(() => setDone(true), 120);
        },
      });

      tl.fromTo(
        "[data-pre-mark]",
        { opacity: 0, scale: 0.7, rotate: -8 },
        { opacity: 1, scale: 1, rotate: 0, duration: 0.55, ease: "power3.out" }
      )
        .fromTo(
          "[data-pre-word]",
          { opacity: 0, y: 26, clipPath: "inset(0 0 100% 0)" },
          { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.5, ease: "power3.out" },
          "-=0.25"
        )
        .fromTo(
          "[data-pre-sub]",
          { opacity: 0 },
          { opacity: 1, duration: 0.4, ease: "power2.out" },
          "-=0.2"
        )
        .fromTo(
          "[data-pre-line]",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.7, ease: "power2.inOut" },
          "-=0.35"
        )
        .to("[data-pre-block]", {
          opacity: 0,
          y: -32,
          duration: 0.5,
          ease: "power2.inOut",
        })
        .to("[data-pre-curtain]", {
          yPercent: -100,
          duration: 0.55,
          ease: "power3.inOut",
        });
    });

    return () => ctx.revert();
  }, []);

  if (done) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" aria-hidden="true">
      <div
        data-pre-curtain
        className="absolute inset-0 bg-[#0A0D14] flex items-center justify-center"
      >
        <div data-pre-block className="flex flex-col items-center gap-5 text-center select-none">
          <div data-pre-mark className="relative">
            <img
              src="/RAYVIA_LOGO.png"
              alt=""
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-[0_0_24px_rgba(59,130,246,0.35)]"
            />
            <div className="absolute -inset-4 rounded-full bg-[#3B82F6]/15 blur-2xl" />
          </div>

          <span
            data-pre-word
            className="font-display text-2xl sm:text-3xl font-bold tracking-tight uppercase text-white"
            style={{ clipPath: "inset(0 0 100% 0)" }}
          >
            RAYVIA<span className="text-[#3B82F6]">.</span>
          </span>

          <span data-pre-sub className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#94A3B8]">
            Decentralized Crowdfunding Protocol
          </span>

          <div className="mt-1 h-px w-44 overflow-hidden bg-slate-400/30 dark:bg-white/[0.08]">
            <div
              data-pre-line
              className="h-full w-full origin-left bg-gradient-to-r from-[#3B82F6] to-[#34D399] scale-x-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}