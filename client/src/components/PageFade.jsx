import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

// Fades a routed page into view. Re-mount (keyed by pathname) to re-trigger.
export default function PageFade({ children }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ctx = gsap.context(() => {
      gsap.from(el, { opacity: 0, y: 18, duration: 0.55, ease: "power2.out" });
    }, ref);
    return () => ctx.revert();
  }, []);

  return <div ref={ref}>{children}</div>;
}