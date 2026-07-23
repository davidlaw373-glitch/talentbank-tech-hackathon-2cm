"use client";

import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Filter,
  Search,
} from "lucide-react";

import { applications } from "@/data/applications";
import { useToast } from "@/components/common/toast";
import type { Application, ApplicationStatus } from "@/types/candidate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type TrackingState = "active" | "saved" | "withdrawn";

const STATUS_TONE: Record<
  ApplicationStatus,
  { variant: "default" | "secondary" | "outline"; label: string }
> = {
  Submitted: { variant: "outline", label: "Submitted" },
  "In review": { variant: "outline", label: "In review" },
  Interview: { variant: "secondary", label: "Interview" },
  Offer: { variant: "default", label: "Offer" },
};

function ApplicationProgress({ application }: { application: Application }) {
  const completed = application.timeline.filter((t) => t.complete).length;
  const total = application.timeline.length;
  const pct = Math.round((completed / total) * 100);
  const currentIndex = application.timeline.findIndex((t) => !t.complete);
  const hasActive = currentIndex >= 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {completed} of {total} stages
          {hasActive && (
            <>
              {" · "}
              <span className="font-medium text-foreground">
                Stage {currentIndex + 1} active
              </span>
            </>
          )}
        </span>
        <span className="font-semibold tabular-nums">{pct}%</span>
      </div>
      <div className="flex items-center gap-1">
        {application.timeline.map((step, i) => {
          const isComplete = step.complete;
          const isCurrent = i === currentIndex;
          return (
            <div
              key={i}
              className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
              aria-label={
                isComplete
                  ? `${step.label} complete`
                  : isCurrent
                    ? `${step.label} in progress`
                    : `${step.label} upcoming`
              }
            >
              {isComplete && (
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 w-full rounded-full bg-chart-1",
                    i <= completed && "animate-progress-x"
                  )}
                  style={
                    i > completed
                      ? { width: 0 }
                      : { animationDelay: `${i * 80}ms` }
                  }
                />
              )}
              {isCurrent && (
                <span className="absolute inset-y-0 left-0 w-full rounded-full bg-chart-2" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ApplicationTracker() {
  const { push } = useToast();
  const [tab, setTab] = useState<
    "active" | "all" | "archived" | "interview" | "offers"
  >("active");
  const [query, setQuery] = useState("");
  const [applicationStates, setApplicationStates] = useState<
    Record<string, TrackingState>
  >({});
  const [pendingWithdraw, setPendingWithdraw] = useState<
    { id: string; jobTitle: string } | null
  >(null);

  const getTrackingState = (id: string): TrackingState =>
    applicationStates[id] ?? "active";

  const updateTrackingState = (
    id: string,
    state: TrackingState,
    jobTitle: string
  ) => {
    setApplicationStates((current) => ({ ...current, [id]: state }));
    push({
      title:
        state === "withdrawn"
          ? "Application withdrawn"
          : state === "saved"
            ? "Saved for later"
            : "Application restored",
      description: jobTitle,
      tone: state === "active" ? "success" : "info",
    });
  };

  const counts = useMemo(() => {
    const active = applications.filter(
      (a) =>
        a.status !== "Offer" && getTrackingState(a.id) === "active"
    ).length;
    const all = applications.filter(
      (a) => getTrackingState(a.id) !== "withdrawn"
    ).length;
    const archived = applications.filter(
      (a) => getTrackingState(a.id) !== "active"
    ).length;
    const interview = applications.filter(
      (a) =>
        a.status === "Interview" && getTrackingState(a.id) !== "withdrawn"
    ).length;
    const offers = applications.filter(
      (a) =>
        a.status === "Offer" && getTrackingState(a.id) !== "withdrawn"
    ).length;
    return { active, all, archived, interview, offers };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationStates]);

  const filtered = useMemo(() => {
    let list = applications.filter((application) => {
      const trackingState = applicationStates[application.id] ?? "active";
      if (tab === "active") {
        return application.status !== "Offer" && trackingState === "active";
      }
      if (tab === "archived") return trackingState !== "active";
      if (tab === "interview") {
        return (
          application.status === "Interview" && trackingState !== "withdrawn"
        );
      }
      if (tab === "offers") {
        return (
          application.status === "Offer" && trackingState !== "withdrawn"
        );
      }
      return true;
    });
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.jobTitle.toLowerCase().includes(q) ||
          a.company.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tab, query, applicationStates]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Applications
          </p>
          <h1>Your applications</h1>
          <p className="text-muted-foreground">
            See every job you&apos;ve applied to, where each one stands, and
            what to do next.
          </p>
        </div>
        <Button asChild>
          <Link href="/candidate/jobs">
            Find more jobs
            <ArrowRight />
          </Link>
        </Button>
      </header>

      {/* Filters */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as typeof tab)}
              className="w-full sm:w-auto"
            >
              <TabsList>
                <TabsTrigger value="active" className="gap-2">
                  Active
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                    {counts.active}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="all" className="gap-2">
                  All
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                    {counts.all}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="archived" className="gap-2">
                  Archived
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                    {counts.archived}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="interview" className="gap-2">
                  Interview
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                    {counts.interview}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="offers" className="gap-2">
                  Offers
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                    {counts.offers}
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-72">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search role or company"
                className="pl-9"
                aria-label="Search applications"
              />
            </div>
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-surface-tint px-6 py-12 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Filter className="h-5 w-5 text-muted-foreground" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-medium">No applications match</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try a different search or tab.
                </p>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {filtered.map((app) => {
                const tone = STATUS_TONE[app.status];
                const trackingState = getTrackingState(app.id);
                return (
                  <li key={app.id}>
                    <div className="lift-on-hover block rounded-lg border bg-card p-5 transition-colors hover:bg-accent-soft">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Building2
                            className="h-5 w-5"
                            aria-hidden
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold">
                              {app.jobTitle}
                            </p>
                            <Badge variant={tone.variant}>{tone.label}</Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2
                                className="h-3 w-3"
                                aria-hidden
                              />
                              {app.company}
                            </span>
                            <span>Applied {app.appliedDate}</span>
                            <span>· {app.stage}</span>
                          </div>
                          <div className="rounded-md border-l-2 border-foreground/40 bg-surface-tint p-2.5 text-xs leading-relaxed">
                            <span className="font-semibold">Update: </span>
                            {app.update}
                          </div>
                          <ApplicationProgress application={app} />
                          <div className="flex flex-wrap items-center gap-2">
                            <Button asChild size="sm">
                              <Link href={`/candidate/applications/${app.id}`}>
                                View application
                                <ArrowRight aria-hidden />
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              aria-pressed={trackingState === "saved"}
                              onClick={() =>
                                updateTrackingState(
                                  app.id,
                                  trackingState === "saved" ? "active" : "saved",
                                  app.jobTitle
                                )
                              }
                            >
                              {trackingState === "saved"
                                ? "Move to active"
                                : "Save for later"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              aria-pressed={trackingState === "withdrawn"}
                              disabled={trackingState === "withdrawn"}
                              onClick={() =>
                                setPendingWithdraw({
                                  id: app.id,
                                  jobTitle: app.jobTitle,
                                })
                              }
                            >
                              {trackingState === "withdrawn"
                                ? "Application withdrawn"
                                : "Withdraw application"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={pendingWithdraw !== null}
        onOpenChange={(open) => !open && setPendingWithdraw(null)}
        title="Withdraw your application?"
        description={
          pendingWithdraw ? (
            <>
              Your application for <strong>{pendingWithdraw.jobTitle}</strong>{" "}
              will be withdrawn. The employer will no longer see it in their
              pipeline. This can&apos;t be undone, but you can re-apply later.
            </>
          ) : null
        }
        confirmLabel="Withdraw"
        destructive
        onConfirm={() => {
          if (pendingWithdraw) {
            updateTrackingState(
              pendingWithdraw.id,
              "withdrawn",
              pendingWithdraw.jobTitle,
            );
          }
          setPendingWithdraw(null);
        }}
      />
    </div>
  );
}
