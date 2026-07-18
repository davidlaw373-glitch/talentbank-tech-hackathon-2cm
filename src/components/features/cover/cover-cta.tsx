import Link from "next/link";
import {
  ArrowRight,
  UserRound,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { CoverEyebrow } from "@/components/features/cover/cover-eyebrow";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { TiltCard } from "@/components/common/tilt-card";
import { Button } from "@/components/ui/button";

type Path = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  href: string;
  accent: string;
};

const PATHS: Path[] = [
  {
    id: "candidate",
    icon: UserRound,
    title: "I'm looking for work",
    description:
      "Build a verified profile, get AI match scores, and track every application in one place.",
    cta: "Create profile",
    href: "/register?next=/candidate/profile",
    accent: "bg-chart-1",
  },
  {
    id: "employer",
    icon: Briefcase,
    title: "I'm hiring",
    description:
      "Post a role, see ranked candidates with AI summaries, and run interviews with a shared scorecard.",
    cta: "Open employer workspace",
    href: "/login?next=/employer",
    accent: "bg-chart-2",
  },
  {
    id: "university",
    icon: GraduationCap,
    title: "I'm from a university",
    description:
      "Issue verified credentials to students, see where they land after graduation, and update courses to match hiring demand.",
    cta: "Open university workspace",
    href: "/login?next=/university",
    accent: "bg-chart-4",
  },
];

export function CoverCta() {
  return (
    <section
      id="start"
      aria-label="Get started"
      className="relative w-full overflow-hidden border-t bg-secondary text-secondary-foreground"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="animate-float-slow absolute left-1/4 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-chart-2/25 blur-3xl" />
        <div className="animate-float-slower absolute right-1/4 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-chart-1/20 blur-3xl" />
        <div className="animate-float-slow absolute left-1/2 bottom-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-chart-7/20 blur-3xl" />
      </div>

      <div className="container mx-auto flex flex-col items-center px-6 py-24 text-center md:py-32">
        <ScrollReveal>
          <CoverEyebrow>Get started</CoverEyebrow>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Pick your path to{" "}
            <span className="text-muted-foreground">CareerOS</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={160}>
          <p className="mt-4 max-w-xl text-base sm:text-lg">
            Three ways to begin. Each path takes about a minute to set up.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid w-full max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
          {PATHS.map((path, i) => {
            const Icon = path.icon;
            return (
              <ScrollReveal key={path.id} delay={i * 100}>
                <TiltCard className="h-full">
                  <div className="lift-on-hover group relative flex h-full flex-col items-start gap-5 overflow-hidden rounded-2xl border bg-card p-6 text-left text-card-foreground sm:p-8">
                    <span
                      aria-hidden
                      className={`absolute inset-x-0 top-0 h-1 ${path.accent}`}
                    />
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl text-background transition-transform group-hover:scale-110 ${path.accent}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        {path.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                        {path.description}
                      </p>
                    </div>
                    <Button
                      asChild
                      className={`w-full justify-between text-background hover:opacity-90 ${path.accent}`}
                    >
                      <Link href={path.href}>
                        {path.cta}
                        <ArrowRight className="transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </TiltCard>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
