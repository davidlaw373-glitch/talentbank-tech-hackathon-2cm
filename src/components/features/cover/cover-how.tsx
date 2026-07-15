import { Fragment } from "react";
import {
  UserPlus,
  Sparkles,
  Handshake,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

import { CoverEyebrow } from "@/components/features/cover/cover-eyebrow";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { Section } from "@/components/common/section";
import { cn } from "@/lib/utils";

type Step = {
  n: string;
  icon: LucideIcon;
  title: string;
  body: string;
  detail: string;
};

const STEPS: Step[] = [
  {
    n: "01",
    icon: UserPlus,
    title: "Build your profile",
    body: "Universities verify degrees and capstones. You add your work. AI translates skills into a profile that proves what you can do.",
    detail: "Takes about 10 minutes",
  },
  {
    n: "02",
    icon: Sparkles,
    title: "Get matched",
    body: "CareerOS scores your fit for every role in real time — against 200+ signals including skills, goals, and trajectory.",
    detail: "Updated every 24 hours",
  },
  {
    n: "03",
    icon: Handshake,
    title: "Interview & hire",
    body: "Structured interviews with shared scorecards. AI-generated feedback for both sides. Faster, fairer, and always clear where you stand.",
    detail: "12 days median time-to-hire",
  },
];

function StepCard({ step }: { step: Step }) {
  const Icon = step.icon;
  return (
    <article className="lift-on-hover flex h-full flex-col gap-4 rounded-2xl border bg-card p-6 text-card-foreground sm:p-8">
      <div className="flex items-center justify-between">
        <span
          className="text-4xl font-semibold tracking-tight tabular-nums"
          aria-hidden
        >
          {step.n}
        </span>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-foreground text-background"
          aria-hidden
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
        {step.title}
      </h3>

      <p className="flex-1 text-sm text-muted-foreground sm:text-base">
        {step.body}
      </p>

      <div
        className="mt-2 flex items-center gap-2 border-t pt-4 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground"
        aria-hidden
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground/40" />
        {step.detail}
      </div>
    </article>
  );
}

function ArrowBetween({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center self-center text-foreground/30",
        "py-3 md:py-0 md:px-2",
        className
      )}
      aria-hidden
    >
      <ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" />
    </div>
  );
}

export function CoverHow() {
  return (
    <Section id="how" ariaLabel="How CareerOS works">
      <ScrollReveal className="mx-auto max-w-2xl text-center">
        <CoverEyebrow>How it works</CoverEyebrow>
        <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
          From profile to{" "}
          <span className="text-muted-foreground">placement.</span>
        </h2>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          Three steps. One platform. The same flow for candidates,
          employers, and the universities that taught them.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={80} className="mt-14">
        <ol className="flex flex-col items-stretch md:flex-row md:items-stretch">
          {STEPS.map((step, i) => (
            <Fragment key={step.n}>
              {i > 0 && <ArrowBetween />}
              <li className="flex-1">
                <StepCard step={step} />
              </li>
            </Fragment>
          ))}
        </ol>
      </ScrollReveal>
    </Section>
  );
}
