import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  Sparkles,
  Building2,
  FileText,
} from "lucide-react";
import type { Application } from "@/types/candidate";
import { Stepper, type StepperStep } from "@/components/common/stepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APPLICATION_STATUS_TONE } from "@/lib/status";
import { cn } from "@/lib/utils";

export function ApplicationDetails({ application }: { application: Application }) {
  const tone = APPLICATION_STATUS_TONE[application.status];
  const StatusIcon = tone.icon;
  const completed = application.timeline.filter((t) => t.complete).length;
  const totalSteps = application.timeline.length;
  const currentIndex = application.timeline.findIndex((t) => !t.complete);
  const currentStep =
    currentIndex >= 0 ? application.timeline[currentIndex] : null;
  const pct = Math.round((completed / totalSteps) * 100);

  const stepperSteps: StepperStep[] = application.timeline.map(
    (s, i) => ({
      id: `${application.id}-${i}`,
      label: s.label,
      meta: s.date,
    })
  );

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/candidate/applications">
            <ArrowLeft />
            Back to tracker
          </Link>
        </Button>
        <Badge variant={tone.variant} className="gap-1">
          <StatusIcon className="h-3 w-3" aria-hidden />
          {tone.label}
        </Badge>
      </div>

      {/* Header */}
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Application
        </p>
        <h1>{application.jobTitle}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4" aria-hidden />
            {application.company}
          </span>
          <span aria-hidden>·</span>
          <span>Applied {application.appliedDate}</span>
        </div>
      </header>

      {/* Timeline */}
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>
              <h2>Application timeline</h2>
            </CardTitle>
            <CardDescription>
              {currentStep
                ? `Currently: ${application.stage}`
                : `All ${totalSteps} stages complete`}
            </CardDescription>
          </div>
          <Badge variant="outline">
            {completed}/{totalSteps} · {pct}%
          </Badge>
        </CardHeader>
        <CardContent className="pt-6">
          <Stepper
            steps={stepperSteps}
            currentIndex={currentIndex >= 0 ? currentIndex : totalSteps}
            ariaLabel="Application timeline steps"
          />
          {currentIndex >= 0 && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Stage {currentIndex + 1} of {totalSteps} ·{" "}
              <span className="font-medium text-primary">
                {application.stage}
              </span>{" "}
              is in progress
            </p>
          )}
        </CardContent>
      </Card>

      {/* Current stage + next action */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" aria-hidden />
                Current stage
              </h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-semibold tracking-tight">
                {application.stage}
              </p>
              <p className="mt-2 text-muted-foreground">{application.update}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 border-t pt-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Status
                </p>
                <p className="mt-1 text-sm font-medium">{application.status}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Applied
                </p>
                <p className="mt-1 text-sm font-medium">
                  {application.appliedDate}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Progress
                </p>
                <p className="mt-1 text-sm font-medium tabular-nums">
                  {pct}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4" aria-hidden />
                Next action
              </h2>
            </CardTitle>
            <CardDescription>What you can do right now.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{application.nextAction}</p>
            <Button asChild className="w-full justify-between">
              <Link href={`/candidate/jobs/${application.jobId}`}>
                Review the job
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Activity log */}
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="flex items-center gap-2">
              <FileText className="h-4 w-4" aria-hidden />
              Activity log
            </h2>
          </CardTitle>
          <CardDescription>
            A reverse-chronological record of every stage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-4">
            {application.timeline
              .map((step, i) => ({ ...step, _i: i }))
              .reverse()
              .map((step) => {
                const isCurrent = step._i === currentIndex && currentIndex >= 0;
                return (
                  <li
                    key={`${application.id}-log-${step._i}`}
                    className="flex items-start gap-3"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                        step.complete &&
                          "bg-primary text-primary-foreground",
                        isCurrent &&
                          "border-2 border-primary bg-background text-primary animate-pulse-soft",
                        !step.complete &&
                          !isCurrent &&
                          "border border-border bg-background text-muted-foreground"
                      )}
                      aria-hidden
                    >
                      {step.complete ? (
                        <Check className="h-3 w-3" />
                      ) : isCurrent ? (
                        <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                      ) : (
                        step._i + 1
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          !step.complete &&
                            !isCurrent &&
                            "text-muted-foreground"
                        )}
                      >
                        {step.label}
                        {isCurrent && (
                          <span className="ml-2 text-xs font-medium text-primary">
                            · In progress
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {step.date}
                      </p>
                    </div>
                  </li>
                );
              })}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
