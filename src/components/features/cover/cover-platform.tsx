"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Activity, TrendingUp } from "lucide-react";

import { CoverEyebrow } from "@/components/features/cover/cover-eyebrow";
import { AnimatedCounter } from "@/components/common/animated-counter";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Match = {
  id: string;
  candidate: string;
  role: string;
  score: number;
  city: string;
};

const SEED_MATCHES: Match[] = [
  {
    id: "m1",
    candidate: "A. Khan",
    role: "Senior Frontend · Helio",
    score: 94,
    city: "Singapore",
  },
  {
    id: "m2",
    candidate: "M. Okafor",
    role: "ML Engineer · Lumen",
    score: 91,
    city: "London",
  },
  {
    id: "m3",
    candidate: "S. Park",
    role: "Staff PM · Vertex",
    score: 89,
    city: "Seoul",
  },
  {
    id: "m4",
    candidate: "R. Diaz",
    role: "Data Engineer · Atlas",
    score: 87,
    city: "Madrid",
  },
  {
    id: "m5",
    candidate: "T. Yamamoto",
    role: "Mobile Lead · Polaris",
    score: 86,
    city: "Tokyo",
  },
];

const SIGNAL_LINES = [
  "New role posted: Senior Frontend at Helio",
  "3 candidates moved to interview",
  "AI flagged 12 strong matches",
  "Credential verified: M. Okafor · Imperial",
  "Offer accepted: S. Park → Vertex",
  "Curriculum signal: +41% LLM evaluation",
];

export function CoverPlatform() {
  const [matches, setMatches] = useState<Match[]>(SEED_MATCHES);
  const [signalIndex, setSignalIndex] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMatches((prev) => {
        const next = [...prev];
        const head = next.shift();
        if (!head) return prev;
        const newScore = Math.max(78, Math.min(96, head.score + (Math.random() > 0.5 ? 1 : -1)));
        const newMatch: Match = {
          ...head,
          id: `t-${Date.now()}`,
          score: newScore,
        };
        next.push(newMatch);
        return next;
      });
      setSignalIndex((i) => (i + 1) % SIGNAL_LINES.length);
      setTick((t) => t + 1);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="platform"
      aria-label="CareerOS in action"
      className="relative w-full overflow-hidden border-t bg-muted/30"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -left-40 top-1/2 h-[460px] w-[460px] -translate-y-1/2 rounded-full bg-muted/40 blur-3xl" />
        <div className="absolute -right-40 top-1/2 h-[460px] w-[460px] -translate-y-1/2 rounded-full bg-accent/30 blur-3xl" />
      </div>

      <div className="container mx-auto px-6 py-20 md:py-28">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <CoverEyebrow>CareerOS in action</CoverEyebrow>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            The platform,{" "}
            <span className="text-muted-foreground">live right now.</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            A real-time look at how CareerOS connects candidates, employers,
            and universities — updated as you watch.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={120} className="mt-12">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
            {/* Live match feed */}
            <div className="lg:col-span-3 overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="relative inline-flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-foreground/40 animate-pulse-ring" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-foreground/60" />
                  </span>
                  <h3 className="text-sm font-semibold tracking-tight">
                    Live matches
                  </h3>
                </div>
                <Badge variant="secondary">
                  <Activity className="mr-1 h-3 w-3" />
                  Real-time
                </Badge>
              </div>
              <ul className="divide-y">
                {matches.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center gap-3 px-5 py-3.5 text-sm transition-colors hover:bg-muted/40"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">
                      {m.candidate
                        .split(" ")
                        .map((p) => p[0])
                        .join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{m.candidate}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {m.role} · {m.city}
                      </p>
                    </div>
                    <div className="flex items-baseline gap-0.5">
                      <span
                        key={`${m.id}-${tick}`}
                        className="animate-reveal text-base font-semibold tabular-nums"
                      >
                        {m.score}
                      </span>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </div>
                    <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-muted sm:block">
                      <div
                        className="h-full rounded-full bg-foreground/80 animate-progress"
                        style={{ width: `${m.score}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Signals + metrics */}
            <div className="flex flex-col gap-5 lg:col-span-2">
              <div className="overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
                <div className="flex items-center justify-between border-b px-5 py-4">
                  <h3 className="text-sm font-semibold tracking-tight">
                    Platform signal
                  </h3>
                  <Badge variant="outline">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    +18% wk
                  </Badge>
                </div>
                <div className="px-5 py-4">
                  <p
                    key={signalIndex}
                    className="animate-reveal text-sm font-medium"
                  >
                    {SIGNAL_LINES[signalIndex]}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Updated just now
                  </p>
                </div>
                <div className="grid grid-cols-3 border-t">
                  <div className="border-r px-5 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Placements
                    </p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                      <AnimatedCounter value={1247} />
                    </p>
                  </div>
                  <div className="border-r px-5 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Verified
                    </p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                      <AnimatedCounter value={86420} />
                    </p>
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Universities
                    </p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                      <AnimatedCounter value={184} />
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border bg-foreground p-6 text-background shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">
                  Take it for a spin
                </p>
                <p className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
                  See CareerOS work on a real profile in 60 seconds.
                </p>
                <Button
                  asChild
                  variant="secondary"
                  className="mt-4 w-full justify-between bg-background text-foreground hover:bg-background/90"
                >
                  <Link href="#start">
                    Try the demo
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
