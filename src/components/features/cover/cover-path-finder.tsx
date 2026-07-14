"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, GraduationCap, Compass, TrendingUp, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { CoverEyebrow } from "@/components/features/cover/cover-eyebrow";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Path = {
  id: string;
  nickname: string;
  title: string;
  sub: string;
  icon: LucideIcon;
  from: string;
  to: string;
  skills: string[];
  months: number;
  match: number;
};

const PATHS: Path[] = [
  {
    id: "student",
    nickname: "The Graduate",
    title: "Just graduating",
    sub: "Final-year student or new graduate",
    icon: GraduationCap,
    from: "Student / Junior",
    to: "Mid-level IC",
    skills: ["System design", "Code review", "Production debugging"],
    months: 14,
    match: 88,
  },
  {
    id: "switcher",
    nickname: "The Switcher",
    title: "Switching fields",
    sub: "Coming from a different industry",
    icon: Compass,
    from: "Domain expert, new to target role",
    to: "Junior IC in target role",
    skills: [
      "Foundational skills",
      "Project portfolio",
      "Targeted interview prep",
    ],
    months: 9,
    match: 76,
  },
  {
    id: "senior",
    nickname: "The Veteran",
    title: "Senior IC",
    sub: "Experienced, looking to level up",
    icon: TrendingUp,
    from: "Senior IC (5+ yrs)",
    to: "Staff IC / Specialist",
    skills: [
      "Cross-team influence",
      "Mentorship",
      "System architecture",
    ],
    months: 20,
    match: 92,
  },
  {
    id: "manager",
    nickname: "The Leader",
    title: "Into management",
    sub: "IC ready to lead a team",
    icon: Users,
    from: "Senior IC / Lead",
    to: "Engineering Manager",
    skills: ["People management", "Roadmap planning", "Hiring"],
    months: 9,
    match: 81,
  },
];

export function CoverPathFinder() {
  const [selected, setSelected] = useState<Path>(PATHS[2]);
  const [pulseKey, setPulseKey] = useState(0);

  const pick = (path: Path) => {
    setSelected(path);
    setPulseKey((k) => k + 1);
  };

  return (
    <section
      id="paths"
      aria-label="Career path finder"
      className="w-full border-t"
    >
      <div className="container mx-auto px-6 py-20 md:py-28">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <CoverEyebrow>Career Path Navigator</CoverEyebrow>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            See the bridge from{" "}
            <span className="text-muted-foreground">here to there.</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Pick where you are today. We&apos;ll show you the skills to
            learn, the role to aim for, and how long it may take.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-5">
          <ScrollReveal delay={80} className="lg:col-span-2">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Where are you now?
              </p>
              {PATHS.map((path) => {
                const Icon = path.icon;
                const active = path.id === selected.id;
                return (
                  <Button
                    key={path.id}
                    type="button"
                    variant="outline"
                    onClick={() => pick(path)}
                    aria-pressed={active}
                    className={cn(
                      "lift-on-hover h-auto justify-start gap-3 whitespace-normal rounded-xl border bg-card p-4 text-left transition-colors hover:bg-accent",
                      active && "border-foreground/40 bg-accent"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
                        active
                          ? "bg-foreground text-background"
                          : "bg-muted text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p
                        className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                        aria-hidden
                      >
                        {path.nickname}
                      </p>
                      <p className="text-sm font-semibold">{path.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {path.sub}
                      </p>
                    </div>
                    <ArrowRight
                      className={cn(
                        "h-4 w-4 shrink-0 self-center transition-transform",
                        active
                          ? "translate-x-0.5 text-foreground"
                          : "text-muted-foreground/40 group-hover:translate-x-0.5"
                      )}
                    />
                  </Button>
                );
              })}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={160} className="lg:col-span-3">
            <div
              key={pulseKey}
              className="animate-reveal relative overflow-hidden rounded-2xl border bg-card p-6 text-card-foreground shadow-sm sm:p-8"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-muted/60 blur-3xl"
              />
              <div className="relative flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">AI-generated path</Badge>
                    <span
                      className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                      aria-hidden
                    >
                      {selected.nickname}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-foreground/60" />
                    Updated for live market data
                  </div>
                </div>

                {/* From → To timeline */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                    <div className="flex-1 rounded-lg border bg-background p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        You are here
                      </p>
                      <p className="mt-1.5 text-sm font-medium sm:text-base">
                        {selected.from}
                      </p>
                    </div>
                    <div className="flex items-center justify-center sm:px-2">
                      <svg
                        width="64"
                        height="24"
                        viewBox="0 0 64 24"
                        fill="none"
                        aria-hidden
                        className="text-foreground/60"
                      >
                        <line
                          x1="2"
                          y1="12"
                          x2="54"
                          y2="12"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeDasharray="2 3"
                        />
                        <path
                          d="M52 6 L60 12 L52 18"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 rounded-lg border bg-foreground p-4 text-background">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">
                        Next step
                      </p>
                      <p className="mt-1.5 text-sm font-medium sm:text-base">
                        {selected.to}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Skills to bridge
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selected.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border bg-background p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Estimated time
                    </p>
                    <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums">
                      {selected.months} mo
                    </p>
                  </div>
                  <div className="rounded-lg border bg-background p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      AI match for you
                    </p>
                    <div className="mt-1.5 flex items-baseline gap-1">
                      <span className="text-2xl font-semibold tracking-tight tabular-nums">
                        {selected.match}
                      </span>
                      <span className="text-sm text-muted-foreground">/100</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-foreground/80 animate-progress"
                        style={{ width: `${selected.match}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button asChild>
                    <Link href="#start">
                      Get my full roadmap
                      <ArrowRight />
                    </Link>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Adapts to your profile, goals, and live market data.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
