"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  max?: number;
  scale?: number;
};

export function TiltCard({
  children,
  className,
  max = 8,
  scale = 1.01,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState("");
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia?.("(pointer: fine)").matches;
    if (!fine) return;

    const node = ref.current;
    if (!node) return;

    let raf: number | null = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const tick = () => {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      setTransform(
        `perspective(1200px) rotateX(${currentY}deg) rotateY(${currentX}deg) scale(${scale})`
      );
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      targetX = (x - 0.5) * 2 * max;
      targetY = ((y - 0.5) * 2 * max) * -1;
      setGlare({
        x: x * 100,
        y: y * 100,
        opacity: 0.18,
      });
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      setGlare((g) => ({ ...g, opacity: 0 }));
    };

    node.addEventListener("mousemove", onMove);
    node.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      node.removeEventListener("mousemove", onMove);
      node.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [max, scale]);

  return (
    <div
      ref={ref}
      className={cn("relative will-change-transform", className)}
      style={{ transform }}
    >
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, oklch(1 0 0 / 0.5), transparent 50%)`,
          opacity: glare.opacity,
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}
