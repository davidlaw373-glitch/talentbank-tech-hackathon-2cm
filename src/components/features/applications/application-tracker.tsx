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

import { useToast } from "@/components/common/toast";
import { getByCandidate, getApplicationUpdate } from "@/data/applications";
import { get as getJob } from "@/data/jobs";
import {
  STAGE_VARIANT,
  type ApplicationStage,
} from "@/types/application";
import type { Application } from "@/types/candidate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TrackingState = "active" | "saved" | "withdrawn";

/** Stages the candidate no longer needs to act on (already at the end). */
function isTerminalStage(stage: ApplicationStage) {
  return stage === "Offer" || stage === "Hired";
}

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
              {/* Per-segment fill — each completed stage gets its own
                  fill element that lives *inside* its segment
                  (clipped by overflow-hidden rounded-full), so the
                  fill grows from within the pill rather than
                  sitting on top of it. The fill is sequential: each
                  segment finishes filling before the next one
                  starts, with a longer duration and a softer easing
                  so each fill glides in rather than snapping, and
                  the overall pass reads as one smooth continuous
                  sweep. */}
              {isComplete && (
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-chart-1"
                  style={{
                    animation: `progress-fill 900ms cubic-bezier(0.4, 0, 0.2, 1) ${i * 900}ms both`,
                  }}
                />
              )}
              {/* Current stage — orange with a subtle shimmer that
                  signals "this is where you are" without competing
                  with the completed fills. */}
              {isCurrent && (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-chart-2 via-highlight-soft to-chart-2 bg-[length:200%_100%] animate-shimmer-gradient"
                />
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
    Record<number, TrackingState>
  >({});
  const [pendingWithdraw, setPendingWithdraw] = useState<
    { id: number; jobTitle: string } | null
  >(null);

  // Always read from the JSON dataset, never a stale module-level snapshot.
  const applications = getByCandidate(1);

  const getTrackingState = (id: number): TrackingState =>
    applicationStates[id] ?? "active";

  const updateTrackingState = (
    id: number,
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
        !isTerminalStage(a.stage) && getTrackingState(a.id) === "active"
    ).length;
    const all = applications.filter(
      (a) => getTrackingState(a.id) !== "withdrawn"
    ).length;
    const archived = applications.filter(
      (a) => getTrackingState(a.id) !== "active"
    ).length;
    const interview = applications.filter(
      (a) =>
        a.stage === "Interview" && getTrackingState(a.id) !== "withdrawn"
    ).length;
    const offers = applications.filter(
      (a) => a.stage === "Offer" && getTrackingState(a.id) !== "withdrawn"
    ).length;
    return { active, all, archived, interview, offers };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationStates]);

  const filtered = useMemo(() => {
    let list = applications.filter((application) => {
      const trackingState = applicationStates[application.id] ?? "active";
      if (tab === "active") {
        return !isTerminalStage(application.stage) && trackingState === "active";
      }
      if (tab === "archived") return trackingState !== "active";
      if (tab === "interview") {
        return (
          application.stage === "Interview" && trackingState !== "withdrawn"
        );
      }
      if (tab === "offers") {
        return (
          application.stage === "Offer" && trackingState !== "withdrawn"
        );
      }
      return true;
    });
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((a) => {
        const job = getJob(a.jobId);
        const haystack = `${job?.title ?? ""} ${job?.location ?? ""}`;
        return haystack.toLowerCase().includes(q);
      });
    }
    return list;
    // applications is read inside the memo via getByCandidate — it is stable
    // (sourced from JSON) so we intentionally omit it from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, query, applicationStates]);

  return (
    <div className="space-y-6">
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
            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
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
              <Button asChild>
                <Link href="/candidate/jobs">
                  Find more jobs
                  <ArrowRight />
                </Link>
              </Button>
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
                const tone = STAGE_VARIANT[app.stage];
                const trackingState = getTrackingState(app.id);
                const job = getJob(app.jobId);
                const jobTitle = job?.title ?? "Unknown role";
                const company = job?.location ?? "";
                return (
                  <li key={app.id}>
                    <Link
                      href={`/candidate/applications/${app.id}`}
                      aria-label={`Open application for ${jobTitle}`}
                      className="group block rounded-lg border bg-card p-5 outline-none transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-border/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Building2
                            className="h-5 w-5"
                            aria-hidden
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-base font-semibold tracking-tight">
                              {jobTitle}
                            </p>
                            <Badge
                              variant={tone}
                              // The default + secondary variants bake in
                              // a hover dim, which makes the informational
                              // stage pill (Screening, Interview, Offer,
                              // Hired) look like a button. Cancel the
                              // hover so the colour is stable. Outline
                              // (Applied) has no hover, so no override.
                              className={
                                tone === "default"
                                  ? "hover:bg-primary"
                                  : tone === "secondary"
                                    ? "hover:bg-secondary"
                                    : undefined
                              }
                            >
                              {app.stage}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2
                                className="h-3 w-3"
                                aria-hidden
                              />
                              {company}
                            </span>
                            <span>Applied {app.appliedDate}</span>
                          </div>
                          <div className="rounded-md border-l-2 border-foreground/40 bg-surface-tint p-2.5 text-xs leading-relaxed">
                            <span className="font-semibold">Update: </span>
                            {getApplicationUpdate(app)}
                          </div>
                          <ApplicationProgress application={app} />
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              aria-pressed={trackingState === "saved"}
                              onClick={(e) => {
                                // The whole card is a link; keep the
                                // Save action independent.
                                e.preventDefault();
                                e.stopPropagation();
                                updateTrackingState(
                                  app.id,
                                  trackingState === "saved" ? "active" : "saved",
                                  jobTitle
                                );
                              }}
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
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setPendingWithdraw({
                                  id: app.id,
                                  jobTitle,
                                });
                              }}
                            >
                              {trackingState === "withdrawn"
                                ? "Application withdrawn"
                                : "Withdraw application"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
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
