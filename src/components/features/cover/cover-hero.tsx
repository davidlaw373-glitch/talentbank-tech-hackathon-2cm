import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CursorGlow } from "@/components/common/cursor-glow";
import { CoverEyebrow } from "@/components/features/cover/cover-eyebrow";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <CursorGlow />
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-muted/60 blur-3xl animate-float-slow" />
        <div className="absolute -right-24 top-40 h-96 w-96 rounded-full bg-accent/40 blur-3xl animate-float-slower" />
        <div className="absolute left-1/2 bottom-0 h-72 w-72 -translate-x-1/2 rounded-full bg-muted/40 blur-3xl animate-float-slow" />
      </div>

      <div className="container mx-auto flex flex-col items-center px-6 pt-16 pb-20 text-center md:pt-24 md:pb-28">
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
            <Link href="/register">
              Create candidate account
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/candidate/dashboard">View demo dashboard</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
