"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  CalendarPlus,
  Check,
  ClipboardList,
  Clock,
  ExternalLink,
  RefreshCcw,
  StickyNote,
  Users,
  X,
} from "lucide-react";

import {
  getEmployerInterviewRows,
  type EmployerInterviewRow,
} from "@/lib/data-helpers";
import type { InterviewStatus } from "@/types/interview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeading } from "@/components/common/page-heading";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/components/common/toast";

type TabValue = "Upcoming" | "Pending" | "Reschedule" | "Completed" | "Cancelled";

const TABS: Array<{ value: TabValue; label: string }> = [
  { value: "Upcoming", label: "Upcoming" },
  { value: "Pending", label: "Pending" },
  { value: "Reschedule", label: "Reschedule" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];

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

function tabMatches(tab: TabValue, status: InterviewStatus) {
  switch (tab) {
    case "Upcoming":
      return status === "Scheduled";
    case "Pending":
      return status === "Pending confirmation";
    case "Reschedule":
      return status === "Reschedule requested";
    case "Completed":
      return status === "Completed";
    case "Cancelled":
      return status === "Cancelled";
  }
}

export default function EmployerInterviewsPage() {
  const { push } = useToast();
  const seedRows = getEmployerInterviewRows(1);
  const [rows, setRows] = useState<EmployerInterviewRow[]>(seedRows);
  const [tab, setTab] = useState<TabValue>("Upcoming");

  const counts = useMemo(() => {
    return {
      Upcoming: rows.filter((r) => tabMatches("Upcoming", r.interview.status))
        .length,
      Pending: rows.filter((r) => tabMatches("Pending", r.interview.status))
        .length,
      Reschedule: rows.filter((r) => tabMatches("Reschedule", r.interview.status))
        .length,
      Completed: rows.filter((r) => tabMatches("Completed", r.interview.status))
        .length,
      Cancelled: rows.filter((r) => tabMatches("Cancelled", r.interview.status))
        .length,
    };
  }, [rows]);

  const visible: EmployerInterviewRow[] = rows.filter((r) =>
    tabMatches(tab, r.interview.status),
  );

  const updateInterview = (
    id: number,
    patch: Partial<EmployerInterviewRow["interview"]>,
  ) => {
    setRows((prev) =>
      prev.map((r) =>
        r.interview.id === id
          ? { ...r, interview: { ...r.interview, ...patch } }
          : r,
      ),
    );
  };

  const onSchedule = () => {
    push({
      title: "Schedule interview opened",
      description: "Pick a slot and interviewer to add a new session.",
      tone: "info",
    });
  };

  const onConfirm = (r: EmployerInterviewRow) => {
    updateInterview(r.interview.id, { status: "Scheduled" });
    push({
      title: `Confirmed ${r.candidate.name}`,
      description: "Calendar invite sent to all interviewers.",
      tone: "success",
    });
  };

  const onReschedule = (r: EmployerInterviewRow) => {
    updateInterview(r.interview.id, { status: "Scheduled" });
    push({
      title: `Rescheduled ${r.candidate.name}`,
      description: "New slot proposed — candidate will be notified.",
      tone: "success",
    });
  };

  const [pendingCancel, setPendingCancel] = useState<EmployerInterviewRow | null>(
    null,
  );

  const onCancel = (r: EmployerInterviewRow) => {
    updateInterview(r.interview.id, { status: "Cancelled" });
    push({
      title: `Cancelled ${r.candidate.name}`,
      description: "Candidate has been notified of the cancellation.",
      tone: "info",
    });
  };

  const onJoin = (r: EmployerInterviewRow) => {
    updateInterview(r.interview.id, { status: "Completed" });
    push({
      title: `Joined ${r.candidate.name}'s interview`,
      description: "Scorecard will unlock when the call ends.",
      tone: "success",
    });
  };

  const onViewNotes = (r: EmployerInterviewRow) => {
    push({
      title: `Opening notes for ${r.candidate.name}`,
      description: `${r.interview.scorecardItems} scorecard items ready for review.`,
      tone: "info",
    });
  };

  const onView = (r: EmployerInterviewRow) => {
    push({
      title: `Opening ${r.candidate.name}`,
      description: `${r.interview.type} · ${r.interview.scheduledFor}`,
      tone: "info",
    });
  };

  return (
    <div className="space-y-8">
      <PageHeading
        title="Interview management"
        description="Every interview across your pipeline, organised by what needs your attention next."
        action={
          <Button onClick={onSchedule}>
            <CalendarPlus />
            Schedule interview
          </Button>
        }
      />

      {/* Summary tiles */}
      <section
        aria-label="Interview status counts"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {[
          { label: "Upcoming", value: counts.Upcoming, icon: Calendar },
          { label: "Pending confirmation", value: counts.Pending, icon: Clock },
          { label: "Reschedule requested", value: counts.Reschedule, icon: ClipboardList },
          { label: "Completed", value: counts.Completed, icon: Users },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-5">
                <span
                  aria-hidden
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-3xl font-semibold tracking-tight tabular-nums">
                    {s.value}
                  </p>
                  <p className="text-sm font-medium">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
        <TabsList aria-label="Filter interviews by status">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
              <span className="ml-2 text-xs text-muted-foreground tabular-nums">
                {counts[t.value]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>
                  {tab} · {visible.length} interview
                  {visible.length === 1 ? "" : "s"}
                </h2>
              </CardTitle>
              <CardDescription>
                Sorted by when the candidate needs the next step.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <span
                    aria-hidden
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"
                  >
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      Nothing in {tab.toLowerCase()} right now
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Switch to another tab to see what&apos;s on the books.
                    </p>
                  </div>
                </div>
              ) : (
                <ul className="divide-y">
                  {visible.map((r) => (
                    <InterviewRow
                      key={r.interview.id}
                      row={r}
                      onConfirm={() => onConfirm(r)}
                      onReschedule={() => onReschedule(r)}
                      onRequestCancel={() => setPendingCancel(r)}
                      onJoin={() => onJoin(r)}
                      onViewNotes={() => onViewNotes(r)}
                      onView={() => onView(r)}
                    />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={pendingCancel !== null}
        onOpenChange={(open) => !open && setPendingCancel(null)}
        title={`Cancel interview with ${pendingCancel?.candidate.name ?? "candidate"}?`}
        description="Both sides will be notified by email. You can rebook afterwards if plans change."
        confirmLabel="Cancel interview"
        destructive
        onConfirm={() => {
          if (pendingCancel) onCancel(pendingCancel);
          setPendingCancel(null);
        }}
      />
    </div>
  );
}

function InterviewRow({
  row,
  onConfirm,
  onReschedule,
  onRequestCancel,
  onJoin,
  onViewNotes,
  onView,
}: {
  row: EmployerInterviewRow;
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
    <li
      className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
    >
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
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              <Calendar className="h-3 w-3" aria-hidden />
              {interview.scheduledFor}
            </Badge>
            <Badge variant="secondary">
              {interview.duration} min
            </Badge>
            <Badge variant="outline">
              {interview.scorecardItems} scorecard items
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Badge variant={statusVariant(status)}>{status}</Badge>
        <div className="flex flex-wrap items-center gap-2">
          {status === "Scheduled" ? (
            <>
              <Button variant="default" size="sm" onClick={onJoin}>
                <ExternalLink />
                Join
              </Button>
              <Button variant="outline" size="sm" onClick={onReschedule}>
                <RefreshCcw />
                Reschedule
              </Button>
              <Button variant="outline" size="sm" onClick={onViewNotes}>
                <StickyNote />
                View notes
              </Button>
              <Button variant="destructive" size="sm" onClick={onRequestCancel}>
                <X />
                Cancel
              </Button>
            </>
          ) : null}
          {status === "Pending confirmation" ? (
            <>
              <Button variant="default" size="sm" onClick={onConfirm}>
                <Check />
                Confirm
              </Button>
              <Button variant="outline" size="sm" onClick={onReschedule}>
                <RefreshCcw />
                Reschedule
              </Button>
              <Button variant="destructive" size="sm" onClick={onRequestCancel}>
                <X />
                Cancel
              </Button>
            </>
          ) : null}
          {status === "Reschedule requested" ? (
            <>
              <Button variant="default" size="sm" onClick={onReschedule}>
                <RefreshCcw />
                Propose new slot
              </Button>
              <Button variant="outline" size="sm" onClick={onViewNotes}>
                <StickyNote />
                View notes
              </Button>
              <Button variant="destructive" size="sm" onClick={onRequestCancel}>
                <X />
                Cancel
              </Button>
            </>
          ) : null}
          {status === "Completed" ? (
            <Button variant="outline" size="sm" onClick={onViewNotes}>
              <StickyNote />
              View notes
            </Button>
          ) : null}
          {status === "Cancelled" ? (
            <Button variant="ghost" size="sm" onClick={onView}>
              View details
            </Button>
          ) : null}
        </div>
      </div>
    </li>
  );
}
