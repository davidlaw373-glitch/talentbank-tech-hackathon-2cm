"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Calendar,
  CalendarPlus,
  Check,
  ClipboardList,
  Clock,
  ExternalLink,
  Filter,
  RefreshCcw,
  Search,
  StickyNote,
  Users,
  X,
} from "lucide-react";

import {
  getEmployerCandidateRows,
  getEmployerInterviewRows,
  type EmployerInterviewRow,
} from "@/lib/data-helpers";
import type {
  Interview,
  InterviewStatus,
  InterviewType,
} from "@/types/interview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeading } from "@/components/common/page-heading";
import { useToast } from "@/components/common/toast";

type StatusFilter = InterviewStatus | "All";
type TypeFilter = InterviewType | "All";

const INTERVIEW_STATUSES: InterviewStatus[] = [
  "Scheduled",
  "Pending confirmation",
  "Reschedule requested",
  "Completed",
  "Cancelled",
];

const INTERVIEW_TYPES: InterviewType[] = [
  "Phone screen",
  "Technical",
  "System design",
  "Behavioural",
  "Final",
];

const STATUS_PRIORITY: Record<InterviewStatus, number> = {
  Scheduled: 0,
  "Pending confirmation": 1,
  "Reschedule requested": 2,
  Completed: 3,
  Cancelled: 4,
};

function statusVariant(status: InterviewStatus) {
  switch (status) {
    case "Scheduled":
      return "default" as const;
    case "Pending confirmation":
      return "secondary" as const;
    case "Reschedule requested":
      return "outline" as const;
    case "Completed":
      return "secondary" as const;
    case "Cancelled":
      return "destructive" as const;
  }
}

function getSeedRows(): EmployerInterviewRow[] {
  const existing = getEmployerInterviewRows(1);
  const usedApplications = new Set(
    existing.map((row) => row.application.id),
  );
  const additions: Array<
    Pick<
      Interview,
      "type" | "interviewers" | "scheduledFor" | "duration" | "status" | "scorecardItems"
    >
  > = [
    {
      type: "Technical",
      interviewers: ["Priya Anand", "Daniel Wong"],
      scheduledFor: "Fri · 09:30 SGT",
      duration: 60,
      status: "Scheduled",
      scorecardItems: 5,
    },
    {
      type: "Behavioural",
      interviewers: ["Mei Tan"],
      scheduledFor: "Mon · 11:00 SGT",
      duration: 45,
      status: "Scheduled",
      scorecardItems: 4,
    },
    {
      type: "Final",
      interviewers: ["Jordan Lee", "Anika Patel"],
      scheduledFor: "Tue · 16:00 SGT",
      duration: 60,
      status: "Pending confirmation",
      scorecardItems: 6,
    },
  ];

  const availableCandidates = getEmployerCandidateRows(1).filter(
    (row) => !usedApplications.has(row.app.id),
  );

  const demoRows = additions
    .map((details, index): EmployerInterviewRow | null => {
      const source = availableCandidates[index];
      if (!source) return null;
      return {
        application: source.app,
        candidate: source.candidate,
        job: source.job,
        interview: {
          id: 100 + index,
          applicationId: source.app.id,
          ...details,
        },
      };
    })
    .filter((row): row is EmployerInterviewRow => row !== null);

  return [...existing, ...demoRows];
}

export default function EmployerInterviewsPage() {
  const { push } = useToast();
  const [rows, setRows] = useState<EmployerInterviewRow[]>(getSeedRows);
  const [showAllInterviews, setShowAllInterviews] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");
  const [pendingCancel, setPendingCancel] =
    useState<EmployerInterviewRow | null>(null);
  const scheduleCandidates = useMemo(() => getEmployerCandidateRows(1), []);

  const counts = useMemo(
    () => ({
      upcoming: rows.filter((row) => row.interview.status === "Scheduled").length,
      pending: rows.filter(
        (row) => row.interview.status === "Pending confirmation",
      ).length,
      reschedule: rows.filter(
        (row) => row.interview.status === "Reschedule requested",
      ).length,
      completed: rows.filter((row) => row.interview.status === "Completed").length,
    }),
    [rows],
  );

  const priorityRows = useMemo(
    () =>
      [...rows].sort(
        (a, b) =>
          STATUS_PRIORITY[a.interview.status] -
          STATUS_PRIORITY[b.interview.status],
      ),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return priorityRows.filter((row) => {
      const searchableText =
        `${row.candidate.name} ${row.job.title} ${row.interview.interviewers.join(" ")}`.toLowerCase();
      const matchesQuery =
        !normalizedQuery || searchableText.includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "All" || row.interview.status === statusFilter;
      const matchesType =
        typeFilter === "All" || row.interview.type === typeFilter;
      return matchesQuery && matchesStatus && matchesType;
    });
  }, [priorityRows, query, statusFilter, typeFilter]);

  const displayedRows = showAllInterviews ? filteredRows : priorityRows;

  const updateInterview = (
    id: number,
    patch: Partial<EmployerInterviewRow["interview"]>,
  ) => {
    setRows((current) =>
      current.map((row) =>
        row.interview.id === id
          ? { ...row, interview: { ...row.interview, ...patch } }
          : row,
      ),
    );
  };

  const notify = (
    row: EmployerInterviewRow,
    status: InterviewStatus,
    title: string,
    description: string,
  ) => {
    updateInterview(row.interview.id, { status });
    push({ title, description, tone: "success" });
  };

  return (
    <div className="space-y-8">
      <PageHeading
        title="Interview management"
        description="Every interview across your pipeline, organised by what needs your attention next."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={showAllInterviews ? "outline" : "default"}
              onClick={() => setShowAllInterviews((current) => !current)}
            >
              {showAllInterviews
                ? "Show priority interviews"
                : "View all interviews"}
            </Button>
            <Button
              onClick={() => setScheduleOpen(true)}
            >
              <CalendarPlus />
              Schedule interview
            </Button>
          </div>
        }
      />

      {!showAllInterviews && (
        <section
          aria-label="Interview status counts"
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {[
            { label: "Upcoming", value: counts.upcoming, icon: Calendar },
            { label: "Pending confirmation", value: counts.pending, icon: Clock },
            {
              label: "Reschedule requested",
              value: counts.reschedule,
              icon: ClipboardList,
            },
            { label: "Completed", value: counts.completed, icon: Users },
          ].map((summary) => {
            const Icon = summary.icon;
            return (
              <Card key={summary.label}>
                <CardContent className="flex items-center gap-3 p-5">
                  <span
                    aria-hidden
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-3xl font-semibold tracking-tight tabular-nums">
                      {summary.value}
                    </p>
                    <p className="text-sm font-medium">{summary.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}

      <Card className="flex h-[calc(100vh-13rem)] min-h-[32rem] flex-col overflow-hidden">
        {showAllInterviews && (
          <CardContent className="grid gap-3 border-b bg-surface-inset p-5 sm:grid-cols-[minmax(0,1fr)_15rem_15rem] sm:items-end">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="interview-search"
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Search interviews
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="interview-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Candidate, role, or interviewer"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="interview-status-filter"
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Status
              </label>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as StatusFilter)
                }
              >
                <SelectTrigger id="interview-status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All statuses</SelectItem>
                  {INTERVIEW_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="interview-type-filter"
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Interview type
              </label>
              <Select
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as TypeFilter)}
              >
                <SelectTrigger id="interview-type-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All interview types</SelectItem>
                  {INTERVIEW_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        )}

        <CardContent className="min-h-0 flex-1 bg-surface-inset p-3">
          {displayedRows.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"
              >
                <Filter className="h-5 w-5 text-muted-foreground" />
              </span>
              <div>
                <p className="text-sm font-medium">
                  No interviews match those filters
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try a different status, type, or search.
                </p>
              </div>
            </div>
          ) : (
            <ul
              aria-label={
                showAllInterviews ? "All interviews" : "Priority interviews"
              }
              className="h-full space-y-3 overflow-y-auto pr-1"
            >
              {displayedRows.map((row) => (
                <InterviewRow
                  key={row.interview.id}
                  row={row}
                  showFullActions={showAllInterviews}
                  onConfirm={() =>
                    notify(
                      row,
                      "Scheduled",
                      `Confirmed ${row.candidate.name}`,
                      "Calendar invite sent to all interviewers.",
                    )
                  }
                  onReschedule={() =>
                    notify(
                      row,
                      "Scheduled",
                      `Rescheduled ${row.candidate.name}`,
                      "A new slot was proposed and the candidate will be notified.",
                    )
                  }
                  onRequestCancel={() => setPendingCancel(row)}
                  onJoin={() =>
                    notify(
                      row,
                      "Completed",
                      `Joined ${row.candidate.name}'s interview`,
                      "Scorecard will unlock when the call ends.",
                    )
                  }
                  onViewNotes={() =>
                    push({
                      title: `Opening notes for ${row.candidate.name}`,
                      description: `${row.interview.scorecardItems} scorecard items ready for review.`,
                      tone: "info",
                    })
                  }
                  onView={() =>
                    push({
                      title: `Opening ${row.candidate.name}`,
                      description: `${row.interview.type} · ${row.interview.scheduledFor}`,
                      tone: "info",
                    })
                  }
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={pendingCancel !== null}
        onOpenChange={(open) => !open && setPendingCancel(null)}
        title={`Cancel interview with ${pendingCancel?.candidate.name ?? "candidate"}?`}
        description="Both sides will be notified by email. You can rebook afterwards if plans change."
        confirmLabel="Cancel interview"
        destructive
        onConfirm={() => {
          if (pendingCancel) {
            updateInterview(pendingCancel.interview.id, { status: "Cancelled" });
            push({
              title: `Cancelled ${pendingCancel.candidate.name}`,
              description: "Candidate has been notified of the cancellation.",
              tone: "info",
            });
          }
          setPendingCancel(null);
        }}
      />
      <ScheduleInterviewDialog
        open={scheduleOpen}
        candidates={scheduleCandidates}
        onOpenChange={setScheduleOpen}
        onSchedule={(candidateRow, interviewDetails) => {
          const nextId =
            Math.max(0, ...rows.map((row) => row.interview.id)) + 1;
          const newRow: EmployerInterviewRow = {
            application: candidateRow.app,
            candidate: candidateRow.candidate,
            job: candidateRow.job,
            interview: {
              id: nextId,
              applicationId: candidateRow.app.id,
              status: "Scheduled",
              ...interviewDetails,
            },
          };
          setRows((current) => [newRow, ...current]);
          push({
            title: `Interview scheduled with ${candidateRow.candidate.name}`,
            description: `${interviewDetails.type} · ${interviewDetails.scheduledFor}`,
            tone: "success",
          });
        }}
      />
    </div>
  );
}

type ScheduleValues = Pick<
  Interview,
  | "type"
  | "interviewers"
  | "scheduledFor"
  | "duration"
  | "scorecardItems"
>;

function ScheduleInterviewDialog({
  open,
  candidates,
  onOpenChange,
  onSchedule,
}: {
  open: boolean;
  candidates: ReturnType<typeof getEmployerCandidateRows>;
  onOpenChange: (open: boolean) => void;
  onSchedule: (
    candidate: ReturnType<typeof getEmployerCandidateRows>[number],
    values: ScheduleValues,
  ) => void;
}) {
  if (!open) return null;
  return (
    <ScheduleInterviewDialogContent
      candidates={candidates}
      onOpenChange={onOpenChange}
      onSchedule={onSchedule}
    />
  );
}

function ScheduleInterviewDialogContent({
  candidates,
  onOpenChange,
  onSchedule,
}: {
  candidates: ReturnType<typeof getEmployerCandidateRows>;
  onOpenChange: (open: boolean) => void;
  onSchedule: (
    candidate: ReturnType<typeof getEmployerCandidateRows>[number],
    values: ScheduleValues,
  ) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [applicationId, setApplicationId] = useState(
    String(candidates[0]?.app.id ?? ""),
  );
  const [type, setType] = useState<InterviewType>("Technical");
  const [interviewers, setInterviewers] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [duration, setDuration] = useState("60");
  const [scorecardItems, setScorecardItems] = useState("5");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onOpenChange(false);
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onOpenChange]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="schedule-interview-title"
      className="fixed left-1/2 top-1/2 max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-xl backdrop:bg-foreground/40 backdrop:backdrop-blur-sm"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const candidate = candidates.find(
            (row) => row.app.id === Number(applicationId),
          );
          if (!candidate) return;
          onSchedule(candidate, {
            type,
            interviewers: interviewers
              .split(",")
              .map((name) => name.trim())
              .filter(Boolean),
            scheduledFor,
            duration: Number(duration),
            scorecardItems: Number(scorecardItems),
          });
          onOpenChange(false);
        }}
      >
        <div className="border-b p-6">
          <p className="text-caption uppercase text-muted-foreground">
            New interview
          </p>
          <h2 id="schedule-interview-title" className="mt-1 text-heading">
            Schedule interview
          </h2>
          <p className="mt-1 text-body text-muted-foreground">
            Set the candidate, panel, and timing for the next interview.
          </p>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <FormField
            label="Candidate and role"
            htmlFor="schedule-candidate"
            className="sm:col-span-2"
          >
            <Select value={applicationId} onValueChange={setApplicationId}>
              <SelectTrigger id="schedule-candidate">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((row) => (
                  <SelectItem
                    key={row.app.id}
                    value={String(row.app.id)}
                  >
                    {row.candidate.name} · {row.job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Interview type" htmlFor="schedule-type">
            <Select
              value={type}
              onValueChange={(value) => setType(value as InterviewType)}
            >
              <SelectTrigger id="schedule-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERVIEW_TYPES.map((interviewType) => (
                  <SelectItem key={interviewType} value={interviewType}>
                    {interviewType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Date and time" htmlFor="schedule-time">
            <Input
              id="schedule-time"
              value={scheduledFor}
              onChange={(event) => setScheduledFor(event.target.value)}
              placeholder="e.g. 25 Jul · 10:00 SGT"
              required
            />
          </FormField>

          <FormField
            label="Interviewers"
            htmlFor="schedule-interviewers"
            className="sm:col-span-2"
          >
            <Input
              id="schedule-interviewers"
              value={interviewers}
              onChange={(event) => setInterviewers(event.target.value)}
              placeholder="Jordan Lee, Priya Anand"
              required
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple interviewers with commas.
            </p>
          </FormField>

          <FormField label="Duration (minutes)" htmlFor="schedule-duration">
            <Input
              id="schedule-duration"
              type="number"
              min="15"
              step="15"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              required
            />
          </FormField>

          <FormField label="Scorecard items" htmlFor="schedule-scorecard">
            <Input
              id="schedule-scorecard"
              type="number"
              min="1"
              max="20"
              value={scorecardItems}
              onChange={(event) => setScorecardItems(event.target.value)}
              required
            />
          </FormField>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t p-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit">
            <CalendarPlus />
            Schedule interview
          </Button>
        </div>
      </form>
    </dialog>
  );
}

function FormField({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

function InterviewRow({
  row,
  showFullActions,
  onConfirm,
  onReschedule,
  onRequestCancel,
  onJoin,
  onViewNotes,
  onView,
}: {
  row: EmployerInterviewRow;
  showFullActions: boolean;
  onConfirm: () => void;
  onReschedule: () => void;
  onRequestCancel: () => void;
  onJoin: () => void;
  onViewNotes: () => void;
  onView: () => void;
}) {
  const { status } = row.interview;
  const { candidate, job, interview } = row;

  return (
    <li className="rounded-xl border bg-card shadow-sm">
      <div className="flex flex-col gap-4 rounded-xl p-4 transition-colors hover:bg-foreground/5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold"
          >
            {candidate.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{candidate.name}</p>
            <small className="block truncate text-muted-foreground">
              {job.title} · {interview.type}
            </small>
            <small className="block truncate text-muted-foreground">
              Interviewers: {interview.interviewers.join(", ")}
            </small>
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

        <div className="flex shrink-0 flex-col items-end gap-2">
          <Badge variant={statusVariant(status)}>{status}</Badge>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {status === "Scheduled" && (
              <>
                <Button size="sm" onClick={onJoin}>
                  <ExternalLink />
                  Join
                </Button>
                <Button variant="outline" size="sm" onClick={onReschedule}>
                  <RefreshCcw />
                  Reschedule
                </Button>
                {showFullActions && (
                  <>
                    <Button variant="outline" size="sm" onClick={onViewNotes}>
                      <StickyNote />
                      View notes
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={onRequestCancel}
                    >
                      <X />
                      Cancel
                    </Button>
                  </>
                )}
              </>
            )}
            {showFullActions && status === "Pending confirmation" && (
              <>
                <Button size="sm" onClick={onConfirm}>
                  <Check />
                  Confirm
                </Button>
                <Button variant="outline" size="sm" onClick={onReschedule}>
                  <RefreshCcw />
                  Reschedule
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onRequestCancel}
                >
                  <X />
                  Cancel
                </Button>
              </>
            )}
            {showFullActions && status === "Reschedule requested" && (
              <>
                <Button size="sm" onClick={onReschedule}>
                  <RefreshCcw />
                  Propose new slot
                </Button>
                <Button variant="outline" size="sm" onClick={onViewNotes}>
                  <StickyNote />
                  View notes
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onRequestCancel}
                >
                  <X />
                  Cancel
                </Button>
              </>
            )}
            {showFullActions && status === "Completed" && (
              <Button variant="outline" size="sm" onClick={onViewNotes}>
                <StickyNote />
                View notes
              </Button>
            )}
            {showFullActions && status === "Cancelled" && (
              <Button variant="ghost" size="sm" onClick={onView}>
                View details
              </Button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
