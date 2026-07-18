import { CoverEyebrow } from "@/components/features/cover/cover-eyebrow";
import { AnimatedMark } from "@/components/features/cover/animated-mark";
import { ScrollReveal } from "@/components/common/scroll-reveal";

export function CoverManifesto() {
  return (
    <section
      id="manifesto"
      aria-label="Why we built CareerOS"
      className="relative w-full overflow-hidden border-t bg-secondary"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -left-40 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-chart-3/20 blur-3xl" />
        <div className="absolute -right-40 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-chart-1/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal>
            <div className="relative flex flex-col gap-6 pl-2 sm:pl-6">
              {/* Large decorative quote mark */}
              <span
                aria-hidden
                className="absolute -left-2 -top-8 font-serif text-[120px] leading-none text-foreground/15 sm:-left-4 sm:-top-10 sm:text-[160px]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                &ldquo;
              </span>
              <div className="relative">
                <CoverEyebrow align="start">Why we built CareerOS</CoverEyebrow>
                <h2 className="mt-6 text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
                  Hiring tools were built for the{" "}
                  <span className="text-muted-foreground">company.</span>
                  <br />
                  CareerOS is built for the{" "}
                  <span className="text-muted-foreground">person.</span>
                </h2>
                <div className="mt-6 flex flex-col gap-4 text-base text-muted-foreground sm:text-lg">
                  <p>
                    The best careers aren&apos;t found in job posts.
                    They&apos;re built on real work, real credentials, and
                    real conversations between the people who do the work
                    and the people who need it.
                  </p>
                  <p>
                    So we made the platform that makes all three visible —
                    for candidates, employers, and the universities that
                    taught them.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal
            delay={120}
            className="flex items-center justify-center"
          >
            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-0 -z-10 rounded-full bg-surface-tint blur-2xl"
              />
              <AnimatedMark size={420} className="w-full max-w-md" />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
