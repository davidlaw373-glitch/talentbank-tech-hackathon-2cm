"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type AnimatedMarkProps = {
  className?: string;
  size?: number;
  showLabels?: boolean;
  autoplay?: boolean;
  /**
   * Color tone for the constellation.
   *   - "auto"   → inherits text-foreground (default; works on cream backgrounds
   *               and in dark/HC modes)
   *   - "light"  → uses text-secondary-foreground (white in light mode, cream
   *               in dark mode). High-contrast on the sage `bg-secondary`
   *               sections where dark forest foreground would blend in.
   */
  tone?: "auto" | "light";
};

const NODES = [
  { id: "candidate", label: "Candidates", x: 60, y: 240, delay: 0 },
  { id: "employer", label: "Employers", x: 320, y: 240, delay: 0.3 },
  { id: "university", label: "Universities", x: 190, y: 50, delay: 0.6 },
] as const;

const EDGES = [
  { from: 0, to: 1, id: "edge-0" },
  { from: 0, to: 2, id: "edge-1" },
  { from: 1, to: 2, id: "edge-2" },
] as const;

// Constellation stars — scattered around the three main nodes
const STARS = [
  { x: 30, y: 80, r: 1.6, o: 0.55 },
  { x: 90, y: 30, r: 1.2, o: 0.45 },
  { x: 150, y: 100, r: 1.4, o: 0.5 },
  { x: 240, y: 30, r: 1.2, o: 0.45 },
  { x: 290, y: 90, r: 1.6, o: 0.55 },
  { x: 350, y: 50, r: 1.4, o: 0.5 },
  { x: 370, y: 150, r: 1.2, o: 0.45 },
  { x: 30, y: 180, r: 1.4, o: 0.5 },
  { x: 10, y: 260, r: 1.2, o: 0.45 },
  { x: 370, y: 260, r: 1.4, o: 0.5 },
  { x: 80, y: 280, r: 1, o: 0.4 },
  { x: 300, y: 280, r: 1, o: 0.4 },
  { x: 120, y: 160, r: 1, o: 0.35 },
  { x: 260, y: 160, r: 1, o: 0.35 },
  { x: 190, y: 200, r: 1.2, o: 0.45 },
];

function edgePath(a: { x: number; y: number }, b: { x: number; y: number }) {
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
}

function PersonIcon() {
  return (
    <g>
      <circle cx="0" cy="-3" r="2.5" fill="var(--secondary)" />
      <path
        d="M -5,5 a 5,4 0 0,1 10,0"
        fill="var(--secondary)"
      />
    </g>
  );
}

function BriefcaseIcon() {
  return (
    <g>
      <rect
        x="-5"
        y="-2"
        width="10"
        height="8"
        rx="1"
        fill="var(--secondary)"
      />
      <path
        d="M -2,-2 v -2 h 4 v 2"
        stroke="var(--secondary)"
        strokeWidth="1"
        fill="none"
      />
    </g>
  );
}

function CapIcon() {
  return (
    <g>
      <path d="M -7,0 L 0,-3 L 7,0 L 0,3 Z" fill="var(--secondary)" />
      <path
        d="M -4,1.5 v 3 M 4,1.5 v 3"
        stroke="var(--secondary)"
        strokeWidth="1"
        fill="none"
      />
    </g>
  );
}

const ICONS: Record<string, () => React.JSX.Element> = {
  candidate: PersonIcon,
  employer: BriefcaseIcon,
  university: CapIcon,
};

export function AnimatedMark({
  className,
  size = 560,
  showLabels = true,
  autoplay = true,
  tone = "auto",
}: AnimatedMarkProps) {
  const ref = useRef<SVGSVGElement | null>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (autoplay) {
      const t = setTimeout(() => setDrawn(true), 50);
      return () => clearTimeout(t);
    }
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setDrawn(true);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [autoplay]);

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 380 300"
      fill="none"
      className={cn(
        tone === "light" ? "text-secondary-foreground" : "text-foreground",
        className,
      )}
      role={showLabels ? "img" : undefined}
      aria-label="CareerOS connects Candidates, Employers, and Universities"
    >
      <defs>
        <radialGradient id="nodeHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="60%" stopColor="currentColor" stopOpacity="0.05" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        {EDGES.map((edge) => {
          const a = NODES[edge.from];
          const b = NODES[edge.to];
          return (
            <path
              key={edge.id}
              id={edge.id}
              d={edgePath(a, b)}
            />
          );
        })}
      </defs>

      {/* Constellation stars — twinkle */}
      {STARS.map((star, i) => (
        <circle
          key={`star-${i}`}
          cx={star.x}
          cy={star.y}
          r={star.r}
          fill="currentColor"
          opacity={star.o}
          className={cn(
            "transition-opacity duration-1000",
            drawn ? "opacity-100 animate-twinkle" : "opacity-0"
          )}
          style={{
            transitionDelay: drawn ? "0s" : `${0.4 + (i % 5) * 0.1}s`,
            animationDelay: drawn
              ? `${(i % 6) * 0.5}s`
              : `${1.2 + (i % 6) * 0.5}s`,
            // @ts-expect-error -- CSS custom property for twinkle range
            "--twinkle-min": star.o * 0.3,
            "--twinkle-max": star.o * 1.6,
          }}
        />
      ))}

      {/* Orbital ring 1 — slow counter-clockwise, continuous rotation */}
      <g
        className={cn(
          "transition-opacity duration-1000",
          drawn ? "opacity-100 animate-orbit-ccw" : "opacity-0"
        )}
        style={{
          transformOrigin: "190px 150px",
          transformBox: "view-box",
          transitionDelay: drawn ? "0s" : "0.6s",
        }}
      >
        <ellipse
          cx="190"
          cy="150"
          rx="170"
          ry="45"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeOpacity="0.55"
          strokeDasharray="3 4"
        />
      </g>

      {/* Orbital ring 2 — faster clockwise, continuous rotation */}
      <g
        className={cn(
          "transition-opacity duration-1000",
          drawn ? "opacity-100 animate-orbit-cw" : "opacity-0"
        )}
        style={{
          transformOrigin: "190px 150px",
          transformBox: "view-box",
          transitionDelay: drawn ? "0s" : "0.8s",
        }}
      >
        <ellipse
          cx="190"
          cy="150"
          rx="135"
          ry="115"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeOpacity="0.45"
          strokeDasharray="2 5"
        />
      </g>

      {/* Edges — draw in then continuously flow */}
      {EDGES.map((edge, i) => {
        const a = NODES[edge.from];
        const b = NODES[edge.to];
        const length = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y)) + 4;
        return (
          <line
            key={`edge-line-${i}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.75"
            strokeDasharray={drawn ? "6 6" : length}
            strokeDashoffset={drawn ? 0 : length}
            className={drawn ? "animate-edge-flow" : ""}
            style={{
              transition:
                "stroke-dasharray 0.9s cubic-bezier(0.16, 1, 0.3, 1), stroke-dashoffset 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: drawn
                ? `${i * 0.15}s, ${i * 0.15}s`
                : `${0.2 + i * 0.2}s, ${0.2 + i * 0.2}s`,
              animationDelay: drawn ? `${1 + i * 0.3}s` : "999s",
            }}
          />
        );
      })}

      {/* Soft halos behind nodes */}
      {NODES.map((n) => (
        <circle
          key={`halo-${n.id}`}
          cx={n.x}
          cy={n.y}
          r={42}
          fill="url(#nodeHalo)"
          className={cn(
            "transition-opacity duration-700",
            drawn ? "opacity-100" : "opacity-0"
          )}
          style={{ transitionDelay: `${n.delay + 1}s` }}
        />
      ))}

      {/* Static rings on nodes */}
      {NODES.map((n) => (
        <circle
          key={`pulse-${n.id}`}
          cx={n.x}
          cy={n.y}
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeOpacity="0.75"
          className={cn(
            "transition-opacity duration-700",
            drawn ? "opacity-100" : "opacity-0"
          )}
          style={{ transitionDelay: `${n.delay + 1.4}s` }}
        />
      ))}

      {/* Solid nodes with icons — pulse continuously once drawn */}
      {NODES.map((n) => {
        const Icon = ICONS[n.id];
        return (
          <g
            key={`node-${n.id}`}
            className={cn(
              "transition-opacity duration-700",
              drawn ? "opacity-100" : "opacity-0"
            )}
            style={{ transitionDelay: `${n.delay + 0.9}s` }}
          >
            <circle
              cx={n.x}
              cy={n.y}
              r="22"
              fill="currentColor"
              className={drawn ? "animate-node-pulse" : ""}
              style={{
                transformOrigin: `${n.x}px ${n.y}px`,
                transformBox: "fill-box",
                animationDelay: `${1.5 + n.delay}s`,
              }}
            />
            <g transform={`translate(${n.x}, ${n.y + 1})`}>
              <Icon />
            </g>
          </g>
        );
      })}

      {/* Labels */}
      {showLabels &&
        NODES.map((n) => {
          const isTop = n.id === "university";
          return (
            <g
              key={`label-${n.id}`}
              className={cn(
                "transition-opacity duration-700",
                drawn ? "opacity-100" : "opacity-0"
              )}
              style={{ transitionDelay: `${n.delay + 1.3}s` }}
            >
              <text
                x={n.x}
                y={isTop ? n.y - 38 : n.y + 50}
                textAnchor="middle"
                fontSize="15"
                fontWeight="700"
                fill="currentColor"
                fontFamily="var(--font-inter), Inter, sans-serif"
              >
                {n.label}
              </text>
            </g>
          );
        })}
    </svg>
  );
}
