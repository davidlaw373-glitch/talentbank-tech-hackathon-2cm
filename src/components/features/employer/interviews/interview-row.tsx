"use client";

import {
  Calendar,
  Check,
  ExternalLink,
  RefreshCcw,
  StickyNote,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { EmployerInterviewRow } from "@/lib/data-helpers";
import type { InterviewStatus } from "@/types/interview";
import { cn } from "@/lib/utils";

export type InterviewRowActions = {
  onConfirm: () => void;
  onReschedule: () => void;
  onRequestCancel: () => void;
  onJoin: () => void;
  onViewNotes: () => void;
  onView: () => void;
};

function statusVariant(status: InterviewStatus) {
  switch (status) {
    case "Scheduled":
      return "default" as const;
    case "Pending confirmation":
    case "Completed":
      return "secondary" as const;
    case "Reschedule requested":
      return "outline" as const;
    case "Cancelled":
      return "destructive" as const;
  }
}

export function InterviewRow({
  row,
  mode,
  actions,
}: {
  row: EmployerInterviewRow;
  mode: "priority" | "all";
  actions: InterviewRowActions;
}) {
  const { candidate, job, interview } = row;
  const showCompleteActions = mode === "all";

  return (
    <li>
      <Card className={cn(showCompleteActions && "border-2 border-foreground")}>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold"
            >
              {candidate.initials}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-medium">{candidate.name}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {job.title} · {interview.type}
              </p>
              <p className="mt-0.5 text-meta text-muted-foreground">
                Interviewers: {interview.interviewers.join(", ")}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  <Calendar className="h-3 w-3" aria-hidden />
                  {interview.scheduledFor}
                </Badge>
                <Badge variant="secondary">{interview.duration} min</Badge>
                <Badge variant="outline">
                  {interview.scorecardItems} scorecard items
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <Badge variant={statusVariant(interview.status)}>
              {interview.status}
            </Badge>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              {interview.status === "Scheduled" && (
                <>
                  <Button
                    size="sm"
                    onClick={actions.onJoin}
                    aria-label={`Join interview with ${candidate.name}`}
                  >
                    <ExternalLink />
                    Join
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={actions.onReschedule}
                    aria-label={`Reschedule interview with ${candidate.name}`}
                  >
                    <RefreshCcw />
                    Reschedule
                  </Button>
                  {showCompleteActions && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={actions.onViewNotes}
                        aria-label={`View notes for ${candidate.name}`}
                      >
                        <StickyNote />
                        View notes
                      </Button>
                      <CancelButton row={row} onClick={actions.onRequestCancel} />
                    </>
                  )}
                </>
              )}

              {showCompleteActions &&
                interview.status === "Pending confirmation" && (
                  <>
                    <Button
                      size="sm"
                      onClick={actions.onConfirm}
                      aria-label={`Confirm interview with ${candidate.name}`}
                    >
                      <Check />
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={actions.onReschedule}
                      aria-label={`Reschedule interview with ${candidate.name}`}
                    >
                      <RefreshCcw />
                      Reschedule
                    </Button>
                    <CancelButton row={row} onClick={actions.onRequestCancel} />
                  </>
                )}

              {showCompleteActions &&
                interview.status === "Reschedule requested" && (
                  <>
                    <Button
                      size="sm"
                      onClick={actions.onReschedule}
                      aria-label={`Propose a new slot for ${candidate.name}`}
                    >
                      <RefreshCcw />
                      Propose new slot
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={actions.onViewNotes}
                      aria-label={`View notes for ${candidate.name}`}
                    >
                      <StickyNote />
                      View notes
                    </Button>
                    <CancelButton row={row} onClick={actions.onRequestCancel} />
                  </>
                )}

              {showCompleteActions && interview.status === "Completed" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={actions.onViewNotes}
                  aria-label={`View notes for ${candidate.name}`}
                >
                  <StickyNote />
                  View notes
                </Button>
              )}

              {showCompleteActions && interview.status === "Cancelled" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={actions.onView}
                  aria-label={`View interview details for ${candidate.name}`}
                >
                  View details
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </li>
  );
}

function CancelButton({
  row,
  onClick,
}: {
  row: EmployerInterviewRow;
  onClick: () => void;
}) {
  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={onClick}
      aria-label={`Cancel interview with ${row.candidate.name}`}
    >
      <X />
      Cancel
    </Button>
  );
}
