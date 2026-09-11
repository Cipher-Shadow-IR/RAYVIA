import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { useInView } from "../hooks/useInView";

export default function CountUp({ value, decimals = 0, prefix = "", suffix = "", className = "", duration = 1.6 }) {
  const textRef = useRef(null);
  const [ref, inView] = useInView();

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el || !inView) return undefined;
    const ctx = gsap.context(() => {
      const target = Number(value) || 0;
      const obj = { n: 0 };
      gsap.to(obj, {
        n: target,
        duration,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = `${prefix}${obj.n.toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })}${suffix}`;
        },
      });
    }, ref);
    return () => ctx.revert();
  }, [inView, value, decimals, prefix, suffix, duration]);

  return (
    <div ref={ref} className={className}>
      <span ref={textRef}>
        {prefix}
        {(Number(value) || 0).toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
        {suffix}
      </span>
    </div>
  );
}