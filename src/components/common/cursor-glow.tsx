"use client";

import { useEffect, useRef } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

type CursorGlowProps = {
  className?: string;
};

/** Pointer-following ambient glow. The RAF loop only runs while the pointer
 *  is moving and stops once the glow settles — never idle-spins. Disabled
 *  entirely for touch pointers and reduced-motion users. */
export function CursorGlow({ className }: CursorGlowProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const finePointer = useMediaQuery("(pointer: fine)");
  const reducedMotion = useReducedMotion();
  const enabled = finePointer && !reducedMotion;

  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    let cx = rect.width / 2;
    let cy = rect.height / 2;
    let tx = cx;
    let ty = cy;
    let raf: number | null = null;

    const tick = () => {
      cx += (tx - cx) * 0.15;
      cy += (ty - cy) * 0.15;
      if (Math.abs(tx - cx) < 0.1 && Math.abs(ty - cy) < 0.1) {
        // Settled — snap to target and stop the loop.
        node.style.setProperty("--cx", `${tx}px`);
        node.style.setProperty("--cy", `${ty}px`);
        raf = null;
        return;
      }
      node.style.setProperty("--cx", `${cx}px`);
      node.style.setProperty("--cy", `${cy}px`);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf === null) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const r = node.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      start();
    };

    const onLeave = () => {
      tx = -9999;
      ty = -9999;
      start();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      style={
        {
          "--cx": "50%",
          "--cy": "40%",
        } as React.CSSProperties
      }
    >
      {/* Outer soft halo — sage */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: "var(--cx)",
          top: "var(--cy)",
          width: 720,
          height: 720,
          background:
            "radial-gradient(circle, rgba(163, 177, 138, 0.35) 0%, rgba(163, 177, 138, 0) 60%)",
          filter: "blur(40px)",
        }}
      />
      {/* Mid glow — deep green */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: "var(--cx)",
          top: "var(--cy)",
          width: 420,
          height: 420,
          background:
            "radial-gradient(circle, rgba(88, 129, 87, 0.55) 0%, rgba(88, 129, 87, 0) 65%)",
          filter: "blur(20px)",
        }}
      />
      {/* Bright core — forest */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: "var(--cx)",
          top: "var(--cy)",
          width: 160,
          height: 160,
          background:
            "radial-gradient(circle, rgba(58, 90, 64, 0.65) 0%, rgba(58, 90, 64, 0) 70%)",
          filter: "blur(8px)",
        }}
      />
    </div>
  );
}
