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

import { employerInterviews } from "@/data/employer";
import type { EmployerInterview, InterviewStatus } from "@/types/employer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const [interviews, setInterviews] = useState<EmployerInterview[]>(employerInterviews);
  const [tab, setTab] = useState<TabValue>("Upcoming");

  const counts = useMemo(() => {
    return {
      Upcoming: interviews.filter((i) => tabMatches("Upcoming", i.status)).length,
      Pending: interviews.filter((i) => tabMatches("Pending", i.status)).length,
      Reschedule: interviews.filter((i) => tabMatches("Reschedule", i.status)).length,
      Completed: interviews.filter((i) => tabMatches("Completed", i.status)).length,
      Cancelled: interviews.filter((i) => tabMatches("Cancelled", i.status)).length,
    };
  }, [interviews]);

  const visible: EmployerInterview[] = interviews.filter((i) =>
    tabMatches(tab, i.status),
  );

  const updateInterview = (id: string, patch: Partial<EmployerInterview>) => {
    setInterviews((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    );
  };

  const onSchedule = () => {
    push({
      title: "Schedule interview opened",
      description: "Pick a slot and interviewer to add a new session.",
      tone: "info",
    });
  };

  const onConfirm = (i: EmployerInterview) => {
    updateInterview(i.id, { status: "Scheduled" });
    push({
      title: `Confirmed ${i.candidateName}`,
      description: "Calendar invite sent to all interviewers.",
      tone: "success",
    });
  };

  const onReschedule = (i: EmployerInterview) => {
    updateInterview(i.id, { status: "Scheduled" });
    push({
      title: `Rescheduled ${i.candidateName}`,
      description: "New slot proposed — candidate will be notified.",
      tone: "success",
    });
  };

  const onCancel = (i: EmployerInterview) => {
    updateInterview(i.id, { status: "Cancelled" });
    push({
      title: `Cancelled ${i.candidateName}`,
      description: "Candidate has been notified of the cancellation.",
      tone: "info",
    });
  };

  const onJoin = (i: EmployerInterview) => {
    updateInterview(i.id, { status: "Completed" });
    push({
      title: `Joined ${i.candidateName}'s interview`,
      description: "Scorecard will unlock when the call ends.",
      tone: "success",
    });
  };

  const onViewNotes = (i: EmployerInterview) => {
    push({
      title: `Opening notes for ${i.candidateName}`,
      description: `${i.scorecardItems} scorecard items ready for review.`,
      tone: "info",
    });
  };

  const onView = (i: EmployerInterview) => {
    push({
      title: `Opening ${i.candidateName}`,
      description: `${i.type} · ${i.scheduledFor}`,
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
                  {visible.map((interview) => (
                    <InterviewRow
                      key={interview.id}
                      interview={interview}
                      onConfirm={() => onConfirm(interview)}
                      onReschedule={() => onReschedule(interview)}
                      onCancel={() => onCancel(interview)}
                      onJoin={() => onJoin(interview)}
                      onViewNotes={() => onViewNotes(interview)}
                      onView={() => onView(interview)}
                    />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InterviewRow({
  interview,
  onConfirm,
  onReschedule,
  onCancel,
  onJoin,
  onViewNotes,
  onView,
}: {
  interview: EmployerInterview;
  onConfirm: () => void;
  onReschedule: () => void;
  onCancel: () => void;
  onJoin: () => void;
  onViewNotes: () => void;
  onView: () => void;
}) {
  const { status } = interview;
  return (
    <li
      className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold"
        >
          {interview.candidateInitials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {interview.candidateName}
          </p>
          <small className="block truncate text-muted-foreground">
            {interview.role} · {interview.type}
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
              <Button variant="destructive" size="sm" onClick={onCancel}>
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
              <Button variant="destructive" size="sm" onClick={onCancel}>
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
              <Button variant="destructive" size="sm" onClick={onCancel}>
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
