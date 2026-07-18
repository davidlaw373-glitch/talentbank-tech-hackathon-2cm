"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type CursorGlowProps = {
  className?: string;
};

export function CursorGlow({ className }: CursorGlowProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(pointer: fine)").matches
        : true;
    if (!fine) return;

    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    current.current = { x: rect.width / 2, y: rect.height / 2 };
    target.current = { x: rect.width / 2, y: rect.height / 2 };

    const onMove = (e: MouseEvent) => {
      if (!node) return;
      const r = node.getBoundingClientRect();
      target.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.15;
      current.current.y += (target.current.y - current.current.y) * 0.15;
      if (node) {
        node.style.setProperty("--cx", `${current.current.x}px`);
        node.style.setProperty("--cy", `${current.current.y}px`);
      }
      raf.current = requestAnimationFrame(tick);
    };

    const onLeave = () => {
      target.current = { x: -9999, y: -9999 };
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

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
      {/* Outer soft halo — sage (low alpha: atmosphere, not ink) */}
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: "var(--cx)",
          top: "var(--cy)",
          width: 720,
          height: 720,
          background:
            "radial-gradient(circle, rgba(106, 138, 78, 0.22) 0%, rgba(106, 138, 78, 0) 60%)",
          filter: "blur(40px)",
          mixBlendMode: "screen",
        }}
      />
      {/* Mid glow — deep green (moderate alpha: anchors the glow to brand) */}
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: "var(--cx)",
          top: "var(--cy)",
          width: 420,
          height: 420,
          background:
            "radial-gradient(circle, rgba(184, 122, 58, 0.18) 0%, rgba(184, 122, 58, 0) 65%)",
          filter: "blur(20px)",
          mixBlendMode: "screen",
        }}
      />
      {/* Bright core — warm amber wash, screen-blended so it only
          brightens what's behind instead of painting over it. Keeps
          cream text on dark pages legible under the cursor. */}
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: "var(--cx)",
          top: "var(--cy)",
          width: 160,
          height: 160,
          background:
            "radial-gradient(circle, rgba(241, 217, 184, 0.55) 0%, rgba(241, 217, 184, 0) 70%)",
          filter: "blur(10px)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
