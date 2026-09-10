import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ToastViewport from "./ToastViewport";
import RayviaPreloader from "./RayviaPreloader";

function ScrollManager() {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function CursorSpotlight() {
  const [pos, setPos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden transition-opacity duration-300"
      aria-hidden="true"
    >
      <div
        className="absolute w-[500px] h-[500px] rounded-full bg-blue-500/[0.04] blur-[120px] will-change-transform -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      />
    </div>
  );
}

export default function Layout({ children, networkName }) {
  const { pathname } = useLocation();

  // Initialize Lenis Momentum Smooth Scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0D14] text-[#F3F4F6] light:bg-[#f8fafc] light:text-[#0f172a] relative selection:bg-blue-500/25 selection:text-blue-300 overflow-x-hidden transition-colors duration-300">
      <RayviaPreloader />
      <ScrollManager />
      <CursorSpotlight />
      
      {/* Background Grid Pattern with Radial Mask */}
      <div className="fixed inset-0 bg-grid-mask pointer-events-none -z-10" />

      <Navbar />
      <main key={pathname} className="flex-1 w-full overflow-x-hidden">
        {children}
      </main>
      <Footer networkName={networkName} />
      <ToastViewport />
    </div>
  );
}