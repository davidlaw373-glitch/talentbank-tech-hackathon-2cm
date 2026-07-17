"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type AnimatedMarkProps = {
  className?: string;
  size?: number;
  showLabels?: boolean;
  autoplay?: boolean;
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
  { x: 30, y: 80, r: 1.2, o: 0.4 },
  { x: 90, y: 30, r: 0.8, o: 0.3 },
  { x: 150, y: 100, r: 1, o: 0.35 },
  { x: 240, y: 30, r: 0.8, o: 0.3 },
  { x: 290, y: 90, r: 1.2, o: 0.4 },
  { x: 350, y: 50, r: 1, o: 0.35 },
  { x: 370, y: 150, r: 0.8, o: 0.3 },
  { x: 30, y: 180, r: 1, o: 0.35 },
  { x: 10, y: 260, r: 0.8, o: 0.3 },
  { x: 370, y: 260, r: 1, o: 0.35 },
  { x: 80, y: 280, r: 0.6, o: 0.25 },
  { x: 300, y: 280, r: 0.6, o: 0.25 },
  { x: 120, y: 160, r: 0.6, o: 0.2 },
  { x: 260, y: 160, r: 0.6, o: 0.2 },
  { x: 190, y: 200, r: 0.8, o: 0.3 },
];

function edgePath(a: { x: number; y: number }, b: { x: number; y: number }) {
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
}

function PersonIcon() {
  return (
    <g>
      <circle cx="0" cy="-3" r="2.5" fill="var(--background)" />
      <path
        d="M -5,5 a 5,4 0 0,1 10,0"
        fill="var(--background)"
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
        fill="var(--background)"
      />
      <path
        d="M -2,-2 v -2 h 4 v 2"
        stroke="var(--background)"
        strokeWidth="1"
        fill="none"
      />
    </g>
  );
}

function CapIcon() {
  return (
    <g>
      <path d="M -7,0 L 0,-3 L 7,0 L 0,3 Z" fill="var(--background)" />
      <path
        d="M -4,1.5 v 3 M 4,1.5 v 3"
        stroke="var(--background)"
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
  size = 420,
  showLabels = true,
  autoplay = true,
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
      className={cn("text-foreground", className)}
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
            drawn ? "opacity-100" : "opacity-0"
          )}
          style={{
            transitionDelay: `${0.4 + (i % 5) * 0.1}s`,
          }}
        />
      ))}

      {/* Orbital ring 1 — slow counter-clockwise */}
      <g
        className={cn(
          "transition-opacity duration-1000",
          drawn ? "opacity-100" : "opacity-0"
        )}
        style={{
          transformOrigin: "190px 150px",
          transformBox: "view-box",
          transitionDelay: "0.6s",
        }}
      >
        <ellipse
          cx="190"
          cy="150"
          rx="170"
          ry="45"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeOpacity="0.18"
          strokeDasharray="3 4"
        />
      </g>

      {/* Orbital ring 2 — faster clockwise */}
      <g
        className={cn(
          "transition-opacity duration-1000",
          drawn ? "opacity-100" : "opacity-0"
        )}
        style={{
          transformOrigin: "190px 150px",
          transformBox: "view-box",
          transitionDelay: "0.8s",
        }}
      >
        <ellipse
          cx="190"
          cy="150"
          rx="135"
          ry="115"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeOpacity="0.14"
          strokeDasharray="2 5"
        />
      </g>

      {/* Edges — draw in with stroke-dashoffset */}
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
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeOpacity="0.5"
            strokeDasharray={length}
            strokeDashoffset={drawn ? 0 : length}
            style={{
              transition: `stroke-dashoffset 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${
                0.2 + i * 0.2
              }s`,
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
          r={36}
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
          r="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.3"
          className={cn(
            "transition-opacity duration-700",
            drawn ? "opacity-100" : "opacity-0"
          )}
          style={{ transitionDelay: `${n.delay + 1.4}s` }}
        />
      ))}

      {/* Solid nodes with icons */}
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
            <circle cx={n.x} cy={n.y} r="18" fill="currentColor" />
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
                y={isTop ? n.y - 32 : n.y + 42}
                textAnchor="middle"
                fontSize="13"
                fontWeight="600"
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
