"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  strength?: number;
};

export function MagneticButton({
  children,
  className,
  strength = 0.35,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia?.("(pointer: fine)").matches;
    if (!fine) return;

    const node = ref.current;
    if (!node) return;

    const onMove = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      const max = Math.max(rect.width, rect.height) * 0.5;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      if (dist > max * 2.5) {
        setOffset({ x: 0, y: 0 });
        return;
      }
      setOffset({ x: dx, y: dy });
    };

    const onLeave = () => setOffset({ x: 0, y: 0 });

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  return (
    <div
      ref={ref}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={cn("inline-block", className)}
    >
      {children}
    </div>
  );
}
