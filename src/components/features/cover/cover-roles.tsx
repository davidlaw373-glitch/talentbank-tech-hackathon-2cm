"use client";

import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";

import { CoverEyebrow } from "@/components/features/cover/cover-eyebrow";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { Section } from "@/components/common/section";
import { TiltCard } from "@/components/common/tilt-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Role = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  benefits: string[];
  cta: string;
  preview: React.ReactNode;
};

const ROLES: Role[] = [
  {
    id: "candidates",
    label: "Candidates",
    eyebrow: "For candidates",
    title: "A profile that proves itself",
    description:
      "Build a verified profile, see your match score for every role, and track every application in one place.",
    benefits: [
      "See how well you match each role (0–100 score)",
      "We convert your project history into skill tags",
      "Track every job you've applied to in one view",
    ],
    cta: "I'm looking for work",
    preview: <CandidatePreview />,
  },
  {
    id: "employers",
    label: "Employers",
    eyebrow: "For employers",
    title: "Hire with structure, not gut feel",
    description:
      "Review ranked candidates with AI summaries, run consistent interviews, and capture feedback for both sides.",
    benefits: [
      "Get an AI-written summary for every candidate",
      "Blind screening hides names and photos from first review",
      "Use the same scorecard with every interviewer",
    ],
    cta: "I'm hiring",
    preview: <EmployerPreview />,
  },
  {
    id: "universities",
    label: "For universities",
    eyebrow: "For universities",
    title: "Outcomes you can actually measure",
    description:
      "Issue verified credentials to your students, track where graduates land, and keep your curriculum aligned with industry demand.",
    benefits: [
      "Issue verified degrees and certificates in bulk",
      "See real-time employment data for each graduating class",
      "Get suggestions for new courses based on hiring demand",
    ],
    cta: "Partner with us",
    preview: <UniversityPreview />,
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
        <div className="grid grid-cols-8 gap-1">
          {[1, 1, 1, 0.85, 1, 1, 0.7, 1].map((v, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full",
                v >= 1
                  ? "bg-foreground/80"
                  : v >= 0.75
                    ? "bg-foreground/45"
                    : "bg-muted-foreground/20"
              )}
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

      <div className="mt-5 rounded-md border-l-2 border-foreground/40 bg-muted/40 p-3 text-xs leading-relaxed">
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

      <div className="mt-4 rounded-md border-l-2 border-foreground/40 bg-muted/40 p-3 text-xs leading-relaxed">
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
          { label: "Software", pct: 38 },
          { label: "Data & AI", pct: 24 },
          { label: "Product", pct: 18 },
          { label: "Other", pct: 12 },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-3 text-xs">
            <span className="w-20 text-muted-foreground">{row.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground/80 animate-progress"
                style={{ width: `${row.pct}%` }}
              />
            </div>
            <span className="w-9 text-right tabular-nums text-muted-foreground">
              {row.pct}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-md bg-muted/50 p-2.5 text-xs">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        <span>
          Demand up 41% for LLM evaluation — consider a new elective.
        </span>
      </div>
    </PreviewShell>
  );
}

export function CoverRoles() {
  return (
    <Section id="roles" ariaLabel="Three roles, one platform">

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
          <Tabs defaultValue="candidates" className="w-full">
            <TabsList
              className="mx-auto flex h-auto w-full max-w-xl flex-wrap gap-1 bg-transparent p-0"
              aria-label="Audience"
            >
              {ROLES.map((role) => (
                <TabsTrigger
                  key={role.id}
                  value={role.id}
                  className="flex-1 rounded-md border bg-background px-4 py-3 text-sm font-medium data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background sm:text-base"
                >
                  {role.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {ROLES.map((role) => (
              <TabsContent
                key={role.id}
                value={role.id}
                className="mt-8 ring-offset-background focus-visible:outline-none"
              >
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
                  <TiltCard className="rounded-2xl">
                    <div className="lift-on-hover rounded-2xl border bg-card p-3">
                      {role.preview}
                    </div>
                  </TiltCard>
                  <div className="flex flex-col gap-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
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
                            className="mt-0.5 h-4 w-4 shrink-0"
                          />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <div>
                      <Button asChild>
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
    </Section>
  );
}
