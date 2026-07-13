"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type AnimatedCounterProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  decimals?: number;
};

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 1400,
  className,
  decimals,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(0);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || played) return;
    if (typeof IntersectionObserver === "undefined") {
      setDisplay(value);
      setPlayed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !played) {
            setPlayed(true);
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - t, 3);
              setDisplay(eased * value);
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration, played]);

  const decimalsToShow = decimals ?? (Number.isInteger(value) ? 0 : 1);
  const formatted = display.toFixed(decimalsToShow);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
