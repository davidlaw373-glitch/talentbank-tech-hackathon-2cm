"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { CoverEyebrow } from "@/components/features/cover/cover-eyebrow";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { TiltCard } from "@/components/common/tilt-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * Custom event name CoverNav dispatches to activate a role tab.
 * Lets the top-nav role links drive the CoverRoles tabs without
 * lifting state up to the page or coupling the two components.
 */
export const COVER_ROLE_EVENT = "cover-role-change";
export function activateCoverRole(roleId: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(COVER_ROLE_EVENT, { detail: roleId }),
  );
}

type Role = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  benefits: string[];
  cta: string;
  preview: React.ReactNode;
  /** Chart token used as the role's signature color — applied to the
   *  active tab border, the preview card accent, and the CTA button. */
  accent: string;
  accentText: string;
  accentSoft: string;
};

const ROLES: Role[] = [
  {
    id: "candidates",
    label: "Candidates",
    eyebrow: "For candidates",
    title: "A profile that proves itself",
    description:
      "Build a verified profile, see your AI match score, and track every application in one place.",
    benefits: [
      "AI career insights score fit for every role",
      "Skills translated from projects and jobs",
      "Track every application in one place",
    ],
    cta: "I'm looking for work",
    preview: <CandidatePreview />,
    accent: "bg-chart-1",
    accentText: "text-chart-1",
    accentSoft: "bg-chart-1/15",
  },
  {
    id: "employers",
    label: "Employers",
    eyebrow: "For employers",
    title: "Hire with structure, not gut feel",
    description:
      "Review ranked candidates, run structured interviews, and capture AI-generated feedback.",
    benefits: [
      "AI candidate summaries that read like a recruiter",
      "Blind screening mode removes bias from first review",
      "Structured interview kits with shared scorecards",
    ],
    cta: "I'm hiring",
    preview: <EmployerPreview />,
    accent: "bg-chart-2",
    accentText: "text-chart-2",
    accentSoft: "bg-chart-2/15",
  },
  {
    id: "universities",
    label: "Universities",
    eyebrow: "For universities",
    title: "Outcomes you can actually measure",
    description:
      "Issue verified credentials, track graduate outcomes, and align your curriculum with industry demand.",
    benefits: [
      "Issue verified credentials to entire cohorts",
      "Live employment data on every graduating class",
      "Curriculum alignment AI surfaces what to teach next",
    ],
    cta: "Partner with us",
    preview: <UniversityPreview />,
    accent: "bg-chart-4",
    accentText: "text-chart-4",
    accentSoft: "bg-chart-4/15",
  },
];

function PreviewShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      {children}
    </div>
  );
}

function CandidatePreview() {
  const tags = ["React", "TypeScript", "Next.js", "Figma"];
  return (
    <PreviewShell>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
            AK
          </div>
          <div>
            <p className="text-sm font-medium">Aisha Khan</p>
            <p className="text-xs text-muted-foreground">
              Senior Frontend · 6 yrs
            </p>
          </div>
        </div>
        <Badge variant="secondary">Verified</Badge>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">AI match score</span>
          <span className="font-semibold">94 / 100</span>
        </div>
        <div
          className="grid grid-cols-8 gap-1"
          role="img"
          aria-label="AI match score 94 of 100 across 8 signals"
        >
          {[1, 1, 1, 0.85, 1, 1, 0.7, 1].map((v, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-opacity",
                v >= 1
                  ? "bg-chart-1"
                  : v >= 0.75
                    ? "bg-chart-2"
                    : "bg-chart-7"
              )}
              style={{ opacity: v >= 1 ? 1 : v >= 0.75 ? 0.7 : 0.5 }}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-5 rounded-md border-l-2 border-foreground/40 bg-surface-tint p-3 text-xs leading-relaxed">
        <span className="font-semibold">AI insight:</span> Built React systems
        at scale (12M daily users). Strong async-first signal. Open to senior
        IC roles.
      </div>
    </PreviewShell>
  );
}

function EmployerPreview() {
  return (
    <PreviewShell>
      <div className="flex items-center justify-between">
        <Badge variant="secondary">Strong fit</Badge>
        <span className="text-xs text-muted-foreground">3 of 247</span>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {[
          { name: "Candidate · Frontend", note: "Identity hidden" },
          { name: "Candidate · Full-stack", note: "Identity hidden" },
          { name: "Candidate · Platform", note: "Identity hidden" },
        ].map((row, i) => (
          <li
            key={row.name}
            className="flex items-center justify-between rounded-md border bg-background p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                ?
              </div>
              <div>
                <p className="text-sm font-medium">{row.name}</p>
                <p className="text-xs text-muted-foreground">{row.note}</p>
              </div>
            </div>
            <span className="text-base font-semibold tabular-nums">
              {[94, 88, 82][i]}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-md border-l-2 border-foreground/40 bg-surface-tint p-3 text-xs leading-relaxed">
        <span className="font-semibold">AI summary:</span> React systems at
        scale, strong async-first signal, open to senior IC roles.
      </div>
    </PreviewShell>
  );
}

function UniversityPreview() {
  return (
    <PreviewShell>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Class of 2024</p>
        <p className="text-sm font-semibold">92% placed in 90 days</p>
      </div>

      <div className="mt-4 space-y-2">
        {[
          { label: "Software", pct: 38, color: "bg-chart-1" },
          { label: "Data & AI", pct: 24, color: "bg-chart-2" },
          { label: "Product", pct: 18, color: "bg-chart-4" },
          { label: "Other", pct: 12, color: "bg-chart-7" },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-3 text-xs">
            <span className="w-20 text-muted-foreground">{row.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full animate-progress",
                  row.color,
                )}
                style={{ width: `${row.pct}%` }}
              />
            </div>
            <span className="w-9 text-right tabular-nums text-muted-foreground">
              {row.pct}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-md bg-highlight-soft p-2.5 text-xs">
        <SparkleIcon />
        <span>
          Demand up 41% for LLM evaluation — consider a new elective.
        </span>
      </div>
    </PreviewShell>
  );
}

function SparkleIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 2v6m0 8v6m10-10h-6M8 12H2m15.07-7.07l-4.24 4.24m-2.83 2.83l-4.24 4.24m11.31 0l-4.24-4.24m-2.83-2.83l-4.24-4.24"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CoverRoles() {
  const [activeRole, setActiveRole] = useState("candidates");

  // Listen for nav-driven role changes from CoverNav. The event is a
  // CustomEvent with the role id in `detail`. We validate against the
  // known role ids so a stray event can't break the tab state.
  useEffect(() => {
    const onRoleChange = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (ROLES.some((r) => r.id === detail)) {
        setActiveRole(detail);
      }
    };
    window.addEventListener(COVER_ROLE_EVENT, onRoleChange);
    return () => window.removeEventListener(COVER_ROLE_EVENT, onRoleChange);
  }, []);

  return (
    <section
      id="roles"
      aria-label="Three roles, one platform"
      className="w-full border-t bg-background"
    >
      <div className="container mx-auto px-6 py-20 md:py-28">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <CoverEyebrow>Three roles. One platform.</CoverEyebrow>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Built for everyone in hiring
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            CareerOS serves candidates, employers, and universities on the
            same operating system — pick a role to see what you get.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={120} className="mt-12">
          <Tabs
            value={activeRole}
            onValueChange={setActiveRole}
            className="w-full"
          >
            <TabsList
              className="mx-auto flex h-auto w-full max-w-xl flex-wrap gap-3 bg-transparent p-0"
              aria-label="Audience"
            >
              {ROLES.map((role) => {
                const isActive = role.id === activeRole;
                return (
                  <TabsTrigger
                    key={role.id}
                    value={role.id}
                    aria-label={`${role.label}${isActive ? " (selected)" : ""}`}
                    className={cn(
                      "group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all sm:text-base",
                      // Active = always dark inverted with checkmark + scale
                      // so selection is obvious regardless of which color
                      // the role uses. Per-role color appears as a thin
                      // top stripe on the active tab so it still reads
                      // as "the candidate/employer/university tab".
                      isActive
                        ? "border-foreground bg-foreground text-background shadow-md scale-[1.02]"
                        : `border-border bg-background text-foreground hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-sm`,
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-0 top-0 h-1 transition-opacity",
                        role.accent,
                        isActive ? "opacity-100" : "opacity-50",
                      )}
                    />
                    {isActive ? (
                      <Check
                        aria-hidden
                        className="h-4 w-4 shrink-0"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className={cn(
                          "h-2 w-2 shrink-0 rounded-full transition-opacity",
                          role.accent,
                          "opacity-60",
                        )}
                      />
                    )}
                    <span>{role.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {ROLES.map((role) => (
              <TabsContent
                key={role.id}
                value={role.id}
                className="mt-8 ring-offset-background focus-visible:outline-none"
              >
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
                  <div className="relative">
                    <div
                      aria-hidden
                      className={cn(
                        "absolute -inset-4 -z-10 rounded-3xl opacity-30 blur-2xl",
                        role.accent,
                      )}
                    />
                    <TiltCard className="rounded-2xl">
                      <div className={cn("lift-on-hover rounded-2xl border-2 bg-card p-3", role.accentText.replace("text-", "border-"))}>
                        {role.preview}
                      </div>
                    </TiltCard>
                  </div>
                  <div className="flex flex-col gap-5">
                    <p
                      className={cn(
                        "text-xs font-semibold uppercase tracking-[0.2em]",
                        role.accentText,
                      )}
                    >
                      {role.eyebrow}
                    </p>
                    <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      {role.title}
                    </h3>
                    <p className="text-base text-muted-foreground">
                      {role.description}
                    </p>
                    <ul className="flex flex-col gap-2">
                      {role.benefits.map((benefit) => (
                        <li
                          key={benefit}
                          className="flex items-start gap-2 text-sm"
                        >
                          <Check
                            aria-hidden
                            className={cn(
                              "mt-0.5 h-4 w-4 shrink-0",
                              role.accentText,
                            )}
                          />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <div>
                      <Button
                        asChild
                        className={cn(
                          role.accent,
                          "hover:opacity-90",
                        )}
                      >
                        <Link href="#start">
                          {role.cta}
                          <ArrowRight />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </ScrollReveal>
      </div>
    </section>
  );
}
