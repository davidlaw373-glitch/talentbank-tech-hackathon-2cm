import Link from "next/link";
import { ArrowLeft, Check, Mail, MapPin, Phone } from "lucide-react";

import type { Candidate, Application } from "@/types/candidate";
import { CandidateStarButton } from "@/components/features/employer/candidate-star-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CandidateProfileOverviewProps = {
  candidate: Candidate;
  timeline: Application["timeline"];
  currentIndex: number;
};

export function CandidateProfileOverview({
  candidate,
  timeline,
  currentIndex,
}: CandidateProfileOverviewProps) {
  const safeCurrentIndex = Math.max(
    0,
    Math.min(currentIndex, timeline.length - 1),
  );

  return (
    <section
      aria-label="Candidate resume and hiring progress"
      className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[11rem_minmax(0,1fr)]"
    >
      <aside className="flex h-full flex-col px-1 lg:pr-3">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="self-start bg-surface-1 hover:bg-surface-2"
        >
          <Link href="/employer/candidates">
            <ArrowLeft aria-hidden />
            Back to candidates
          </Link>
        </Button>
        <ol
          aria-label={`Hiring progress for ${candidate.name}`}
          className="mt-5 flex min-h-[28rem] flex-1 flex-col sm:min-h-[34rem] lg:min-h-0"
        >
          {timeline.map((step, index) => {
            const isComplete = index < safeCurrentIndex;
            const isCurrent = index === safeCurrentIndex;
            const isCurrentTransition =
              index === safeCurrentIndex && index < timeline.length - 1;
            const animationDelay = `${index * 0.8}s`;

            return (
              <li
                key={`${index}-${step.label}`}
                aria-current={isCurrent ? "step" : undefined}
                className="relative grid flex-1 grid-cols-[2.25rem_minmax(0,1fr)] gap-2.5 last:flex-none"
              >
                {index < timeline.length - 1 ? (
                  <span
                    aria-hidden
                    data-slot="timeline-connector"
                    className={cn(
                      "absolute bottom-0 left-4 top-9 w-1 overflow-visible rounded-full",
                      isComplete ? "bg-primary" : "bg-border",
                    )}
                  >
                    {isComplete ? (
                      <>
                        <span
                          data-slot="timeline-track-glow"
                          className="animate-timeline-track-glow absolute inset-0 rounded-full bg-primary/55"
                          style={{ animationDelay }}
                        />
                        <span
                          data-slot="timeline-line-fill"
                          className="animate-timeline-line-fill absolute inset-0 origin-top rounded-full bg-primary"
                          style={{ animationDelay }}
                        />
                      </>
                    ) : null}
                    {isCurrentTransition ? (
                      <span
                        data-slot="timeline-current-sweep"
                        className="animate-timeline-current-sweep absolute -left-0.5 top-0 h-1/3 w-2 rounded-full bg-primary shadow-[0_0_14px_var(--primary)]"
                      />
                    ) : null}
                  </span>
                ) : null}
                <span
                  className={cn(
                    "relative z-10 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold tabular-nums",
                    isComplete && "border-primary bg-primary text-primary-foreground",
                    isCurrent &&
                      "border-primary bg-surface-1 text-foreground shadow-[0_0_0_4px_var(--accent-soft)]",
                    !isComplete &&
                      !isCurrent &&
                      "border-border bg-surface-1 text-muted-foreground",
                  )}
                  aria-label={`${step.label}, ${
                    isComplete
                      ? "complete"
                      : isCurrent
                        ? "current"
                        : "upcoming"
                  }`}
                >
                  {isComplete || isCurrent ? (
                    <span
                      data-slot="timeline-node-wave"
                      aria-hidden
                      className="animate-pulse-ring-soft pointer-events-none absolute inset-0 rounded-full border border-primary/35"
                      style={{
                        animationDelay,
                        animationDuration: "3s",
                      }}
                    />
                  ) : null}
                  <span className="relative z-10">
                    {isComplete ? (
                      <Check className="h-4 w-4" aria-hidden />
                    ) : (
                      index + 1
                    )}
                  </span>
                </span>
                <div className="min-w-0 pt-1">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      isCurrent ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step.date}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </aside>

      <article
        aria-label={`Resume preview for ${candidate.name}`}
        className="relative rounded-xl border-2 border-border bg-surface-1 p-6 shadow-[6px_8px_0_0_var(--border)] sm:p-8 lg:p-10"
      >
        <div className="absolute right-6 top-6 sm:right-8 sm:top-8 lg:right-10 lg:top-10">
          <CandidateStarButton candidateName={candidate.name} />
        </div>
        <p className="text-caption">Resume preview</p>
        <header className="mt-3 border-b border-border pb-6 pr-14">
          <h2 className="text-3xl font-semibold tracking-tight">
            {candidate.name}
          </h2>
          <p className="mt-1 text-body font-medium">{candidate.title}</p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-meta text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {candidate.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" aria-hidden />
              {candidate.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" aria-hidden />
              {candidate.phone}
            </span>
          </div>
        </header>

        <div className="divide-y divide-border">
          <section className="py-6">
            <h3 className="text-caption">Summary</h3>
            <p className="mt-3 text-body leading-relaxed">{candidate.summary}</p>
          </section>

          <section className="py-6">
            <h3 className="text-caption">Experience</h3>
            <div className="mt-4 space-y-6">
              {candidate.experience.map((experience) => (
                <div key={experience.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="text-body font-semibold">
                      {experience.role} · {experience.company}
                    </h4>
                    <span className="text-meta text-muted-foreground">
                      {experience.period}
                    </span>
                  </div>
                  <p className="mt-2 text-meta leading-relaxed text-muted-foreground">
                    {experience.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="py-6">
            <h3 className="text-caption">Education</h3>
            <div className="mt-4 space-y-4">
              {candidate.education.map((education) => (
                <div
                  key={education.id}
                  className="flex flex-wrap items-baseline justify-between gap-2"
                >
                  <div>
                    <h4 className="text-body font-semibold">
                      {education.qualification}
                    </h4>
                    <p className="text-meta text-muted-foreground">
                      {education.institution}
                    </p>
                  </div>
                  <span className="text-meta text-muted-foreground">
                    {education.period}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {candidate.projects.length ? (
            <section className="py-6">
              <h3 className="text-caption">Projects</h3>
              <div className="mt-4 space-y-5">
                {candidate.projects.map((project) => (
                  <div key={project.id}>
                    <h4 className="text-body font-semibold">{project.name}</h4>
                    <p className="mt-1 text-meta leading-relaxed text-muted-foreground">
                      {project.description}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {project.skills.join(" · ")}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="pt-6">
            <h3 className="text-caption">Skills</h3>
            <p className="mt-3 text-meta leading-relaxed">
              {candidate.skills.join(" · ")}
            </p>
          </section>
        </div>
      </article>
    </section>
  );
}
