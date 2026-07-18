import { notFound } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { applications } from "@/data/applications";
import { candidateProfile } from "@/data/candidate";

type PageProps = {
  params: Promise<{ applicationId: string }>;
};

function formatDate(iso: string): string {
  return iso;
}

export default async function CandidateApplicationDetailPage({ params }: PageProps) {
  const { applicationId } = await params;
  const application = applications.find((a) => a.id === applicationId);
  if (!application) notFound();

  const completed = application.timeline.filter((t) => t.complete).length;
  const total = application.timeline.length;
  const pct = Math.round((completed / total) * 100);
  const currentIndex = application.timeline.findIndex((t) => !t.complete);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Application
        </p>
        <h1>{application.jobTitle}</h1>
        <p className="text-muted-foreground">
          {application.company} · Applied {formatDate(application.appliedDate)}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <h2>Where you stand</h2>
            </CardTitle>
            <CardDescription>{application.update}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {completed} of {total} stages complete
                </span>
                <span className="font-medium tabular-nums">{pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-chart-1"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <ol className="space-y-3">
              {application.timeline.map((step, i) => {
                const isComplete = step.complete;
                const isCurrent = i === currentIndex;
                return (
                  <li
                    key={`${application.id}-${i}`}
                    className="flex items-start gap-3"
                  >
                    <span
                      className={
                        isComplete
                          ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-semibold"
                          : isCurrent
                            ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-background text-[10px] font-semibold text-foreground"
                            : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-background text-[10px] font-semibold text-muted-foreground"
                      }
                      aria-label={
                        isComplete
                          ? `${step.label} — complete`
                          : isCurrent
                            ? `${step.label} — in progress`
                            : `${step.label} — upcoming`
                      }
                    >
                      {isComplete ? "✓" : i + 1}
                    </span>
                    <div className="-mt-0.5 flex-1">
                      <p
                        className={
                          isComplete
                            ? "text-sm font-medium text-muted-foreground line-through"
                            : isCurrent
                              ? "text-sm font-medium text-foreground"
                              : "text-sm font-medium text-muted-foreground"
                        }
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{step.date}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Next action</h2>
            </CardTitle>
            <CardDescription>What to do before the hiring team moves.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{application.nextAction}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>About your match</h2>
          </CardTitle>
          <CardDescription>
            Why this role was surfaced for {candidateProfile.name.split(" ")[0]}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            CareerOS scored your fit across skills, experience, and goals. Updating
            your profile raises the match score for every future application.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
