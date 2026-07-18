import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { AnimatedCounter } from "@/components/common/animated-counter";
import { CursorGlow } from "@/components/common/cursor-glow";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { CoverEyebrow } from "@/components/features/cover/cover-eyebrow";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATS = [
  { value: 4.5, suffix: "M+", label: "verified profiles" },
  { value: 12, suffix: " days", label: "median time-to-hire" },
  { value: 180, suffix: "+", label: "university partners" },
];

const TITLE_WORDS: { word: string; muted: boolean }[] = [
  { word: "One", muted: false },
  { word: "platform", muted: false },
  { word: "for", muted: false },
  { word: "every", muted: true },
  { word: "career", muted: true },
  { word: "stage.", muted: true },
];

function WordReveal({
  words,
  startDelay = 0,
}: {
  words: { word: string; muted: boolean }[];
  startDelay?: number;
}) {
  return (
    <>
      {words.map((item, i) => (
        <span
          key={i}
          className={cn(
            "animate-word inline-block",
            item.muted ? "text-muted-foreground" : "text-foreground"
          )}
          style={{
            animationDelay: `${startDelay + i * 90}ms`,
            marginRight: i < words.length - 1 ? "0.28em" : 0,
          }}
        >
          {item.word}
        </span>
      ))}
    </>
  );
}

export function CoverHero() {
  return (
    <section
      id="top"
      aria-label="Introduction"
      className="relative w-full overflow-hidden"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <CursorGlow />
        <div className="animate-float-slow absolute -left-32 top-10 h-80 w-80 rounded-full bg-chart-2/30 blur-3xl" />
        <div className="animate-float-slower absolute -right-24 top-40 h-96 w-96 rounded-full bg-chart-1/25 blur-3xl" />
        <div className="animate-float-slow absolute left-1/2 bottom-0 h-72 w-72 -translate-x-1/2 rounded-full bg-chart-4/30 blur-3xl" />
        <div className="animate-float-slower absolute right-1/3 top-1/4 h-64 w-64 rounded-full bg-chart-7/20 blur-3xl" />
        {/* Subtle gradient mesh for ambient warmth */}
        <div
          className="animate-shimmer-gradient absolute inset-0 opacity-30"
          style={{
            background:
              "linear-gradient(135deg, transparent 0%, rgba(106,138,78,0.04) 25%, transparent 50%, rgba(184,122,58,0.04) 75%, transparent 100%)",
          }}
        />
      </div>

      <div className="container mx-auto flex flex-col items-center px-6 pt-20 pb-24 text-center md:pt-32 md:pb-36">
        <div className="animate-reveal">
          <CoverEyebrow>Career Operating System</CoverEyebrow>
        </div>

        <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          <WordReveal words={TITLE_WORDS} />
        </h1>

        <div
          className="animate-reveal mt-6 max-w-2xl"
          style={{ animationDelay: "650ms" }}
        >
          <p className="text-base text-muted-foreground sm:text-lg">
            CareerOS connects candidates, employers, and universities. AI
            career insights, university-verified credentials, and structured
            interviews — on a single operating system.
          </p>
        </div>

        <div
          className="animate-reveal mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
          style={{ animationDelay: "780ms" }}
        >
          <Button asChild size="lg">
            <Link href="#start">
              Get started
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#roles">Explore the platform</Link>
          </Button>
        </div>

        <ScrollReveal className="mt-16 w-full max-w-5xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="lift-on-hover flex flex-col items-center gap-2 rounded-xl border bg-card p-8 text-card-foreground"
              >
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight sm:text-5xl">
                    <AnimatedCounter
                      value={stat.value}
                      decimals={Number.isInteger(stat.value) ? 0 : 1}
                    />
                  </span>
                  <span className="text-2xl font-semibold tracking-tight text-muted-foreground sm:text-3xl">
                    {stat.suffix}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal
          delay={150}
          className="mt-10 flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-foreground/15" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-foreground/60" />
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              AI career insights live across 200+ signals
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
