"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  BadgeCheck,
  Briefcase,
  Check,
  Circle,
} from "lucide-react";

import { CoverEyebrow } from "@/components/features/cover/cover-eyebrow";
import { AnimatedCounter } from "@/components/common/animated-counter";
import { LiveDot } from "@/components/common/live-dot";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { Section } from "@/components/common/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Match = {
  id: string;
  candidate: string;
  role: string;
  score: number;
  city: string;
  delta: number;
};

const SEED_MATCHES: Match[] = [
  {
    id: "m1",
    candidate: "A. Khan",
    role: "Senior Frontend · Helio",
    score: 94,
    city: "Singapore",
    delta: 2,
  },
  {
    id: "m2",
    candidate: "M. Okafor",
    role: "ML Engineer · Lumen",
    score: 91,
    city: "London",
    delta: -1,
  },
  {
    id: "m3",
    candidate: "S. Park",
    role: "Staff PM · Vertex",
    score: 89,
    city: "Seoul",
    delta: 3,
  },
  {
    id: "m4",
    candidate: "R. Diaz",
    role: "Data Engineer · Atlas",
    score: 87,
    city: "Madrid",
    delta: 1,
  },
  {
    id: "m5",
    candidate: "T. Yamamoto",
    role: "Mobile Lead · Polaris",
    score: 86,
    city: "Tokyo",
    delta: -2,
  },
  {
    id: "m6",
    candidate: "K. Andersson",
    role: "Backend Lead · Lumen",
    score: 84,
    city: "Stockholm",
    delta: 0,
  },
];

const SIGNAL_LINES = [
  "New role posted · Senior Frontend at Helio",
  "3 candidates moved to interview",
  "AI flagged 12 strong matches in the last hour",
  "Credential verified · M. Okafor · Imperial",
  "Offer accepted · S. Park → Vertex",
  "Curriculum signal · +41% demand for LLM evaluation",
  "Hiring team shortlisted 8 candidates at Lumen",
  "New university onboarded · IIT Delhi",
];

const STATS = [
  {
    label: "Placements",
    value: 1247,
    trend: 12,
    icon: Briefcase,
    suffix: "",
  },
  {
    label: "Verified profiles",
    value: 86420,
    trend: 8,
    icon: BadgeCheck,
    suffix: "",
  },
  {
    label: "Universities",
    value: 184,
    trend: 4,
    icon: GraduationCap,
    suffix: "",
  },
  {
    label: "Active matches",
    value: 247,
    trend: -3,
    icon: Users,
    suffix: "",
  },
];

type ChecklistItem = {
  id: string;
  label: string;
  hint: string;
  done: boolean;
};

const CHECKLIST: ChecklistItem[] = [
  { id: "skills", label: "Add your skills", hint: "12 added", done: true },
  { id: "resume", label: "Upload your resume", hint: "PDF · 2 pages", done: true },
  { id: "credential", label: "Verify a credential", hint: "Boosts match by ~18%", done: true },
  { id: "portfolio", label: "Link a portfolio", hint: "GitHub, Figma, or a site", done: false },
  { id: "goals", label: "Set career goals", hint: "Powers path navigator", done: false },
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
        const delta =
          Math.random() > 0.5 ? 1 : -1;
        const newScore = Math.max(78, Math.min(96, head.score + delta));
        const newMatch: Match = {
          ...head,
          id: `t-${Date.now()}`,
          score: newScore,
          delta,
        };
        next.push(newMatch);
        return next;
      });
      setSignalIndex((i) => (i + 1) % SIGNAL_LINES.length);
      setTick((t) => t + 1);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  const total = CHECKLIST.length;
  const done = CHECKLIST.filter((c) => c.done).length;
  const pct = Math.round((done / total) * 100);

  return (
    <Section id="platform" ariaLabel="CareerOS in action" variant="muted">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -left-40 top-1/2 h-[460px] w-[460px] -translate-y-1/2 rounded-full bg-muted/40 blur-3xl" />
        <div className="absolute -right-40 top-1/2 h-[460px] w-[460px] -translate-y-1/2 rounded-full bg-accent/30 blur-3xl" />
      </div>

      {/* Header */}
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

        {/* Stat row */}
        <ScrollReveal delay={80} className="mt-12">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {STATS.map((s) => {
              const Icon = s.icon;
              const up = s.trend > 0;
              return (
                <div
                  key={s.label}
                  className="lift-on-hover rounded-2xl border bg-card p-5 text-card-foreground sm:p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-4 w-4" aria-hidden />
                    </div>
                    <Badge
                      variant={up ? "secondary" : "outline"}
                      className="gap-0.5"
                    >
                      {up ? (
                        <TrendingUp className="h-3 w-3" aria-hidden />
                      ) : (
                        <TrendingDown className="h-3 w-3" aria-hidden />
                      )}
                      {Math.abs(s.trend)}%
                    </Badge>
                  </div>
                  <div className="mt-4 text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
                    <AnimatedCounter value={s.value} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Main 2-col: matches + profile progress */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-5">
          {/* Live matches */}
          <ScrollReveal delay={140} className="lg:col-span-3">
            <div className="overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div className="flex items-center gap-2">
                  <LiveDot label="Live" />
                  <h3 className="text-sm font-semibold tracking-tight">
                    Live matches
                  </h3>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Activity className="h-3 w-3" aria-hidden />
                  Real-time
                </Badge>
              </div>
              <ul className="divide-y">
                {matches.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                      {m.candidate
                        .split(" ")
                        .map((p) => p[0])
                        .join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium" title={m.candidate}>
                        {m.candidate}
                      </p>
                      <p
                        className="truncate text-xs text-muted-foreground"
                        title={`${m.role} · ${m.city}`}
                      >
                        {m.role} · {m.city}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={m.delta > 0 ? "secondary" : "outline"}
                        className="hidden h-5 gap-0 px-1.5 text-[10px] sm:inline-flex"
                      >
                        {m.delta > 0 ? "+" : m.delta < 0 ? "" : "±"}
                        {m.delta !== 0 ? Math.abs(m.delta) : ""}
                      </Badge>
                      <div className="flex items-baseline gap-0.5">
                        <span
                          key={`${m.id}-${tick}`}
                          className="animate-reveal text-lg font-semibold tabular-nums"
                        >
                          {m.score}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          /100
                        </span>
                      </div>
                    </div>
                    <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-muted sm:block">
                      <div
                        className="h-full rounded-full bg-foreground/80 animate-progress"
                        style={{ width: `${m.score}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          {/* Profile progress */}
          <ScrollReveal delay={200} className="lg:col-span-2">
            <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
              <div className="border-b px-6 py-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold tracking-tight">
                    Your profile
                  </h3>
                  <Badge variant="outline">{pct}% complete</Badge>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground animate-progress"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {done} of {total} sections complete · a stronger profile
                  means stronger matches
                </p>
              </div>

              <ul className="flex-1 divide-y">
                {CHECKLIST.map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/40",
                      item.done && "opacity-70"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                        item.done
                          ? "bg-foreground text-background"
                          : "border border-foreground/30 text-foreground/40"
                      )}
                      aria-hidden
                    >
                      {item.done ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Circle className="h-2 w-2 fill-current" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-sm font-medium",
                          item.done && "text-muted-foreground"
                        )}
                      >
                        {item.label}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.hint}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t p-4">
                <Button
                  asChild
                  className="w-full justify-between"
                >
                  <Link href="#start">
                    Complete your profile
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Platform signals row */}
        <ScrollReveal delay={260} className="mt-5">
          <div className="overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <LiveDot label="Live" />
                <h3 className="text-sm font-semibold tracking-tight">
                  Platform signal
                </h3>
              </div>
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="h-3 w-3" aria-hidden />
                +18% wk
              </Badge>
            </div>
            <div
              className="relative overflow-hidden"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
              }}
            >
              <div className="flex animate-ticker gap-8 whitespace-nowrap px-6 py-4">
                {[...SIGNAL_LINES, ...SIGNAL_LINES, ...SIGNAL_LINES].map(
                  (line, i) => (
                    <span
                      key={`${line}-${i}`}
                      className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground"
                      aria-hidden={i >= SIGNAL_LINES.length}
                    >
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground/40" />
                      {line}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>
    </Section>
  );
}
