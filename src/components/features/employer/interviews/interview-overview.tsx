"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CalendarPlus,
  ClipboardList,
  Clock,
  Filter,
  Users,
} from "lucide-react";

import { PageHeading } from "@/components/common/page-heading";
import { useToast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getEmployerCandidateRows,
  type EmployerInterviewRow,
} from "@/lib/data-helpers";
import type { InterviewStatus } from "@/types/interview";
import {
  getEmployerInterviewSeedRows,
  sortInterviewRowsByPriority,
} from "./interview-data";
import {
  InterviewRow,
  type InterviewRowActions,
} from "./interview-row";
import {
  InterviewScheduleDialog,
  type ScheduleInterviewValues,
} from "./interview-schedule-dialog";

export function InterviewOverview() {
  const { push } = useToast();
  const [rows, setRows] = useState<EmployerInterviewRow[]>(
    getEmployerInterviewSeedRows,
  );
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const scheduleCandidates = useMemo(() => getEmployerCandidateRows(1), []);

  const counts = useMemo(
    () => ({
      upcoming: rows.filter((row) => row.interview.status === "Scheduled")
        .length,
      pending: rows.filter(
        (row) => row.interview.status === "Pending confirmation",
      ).length,
      reschedule: rows.filter(
        (row) => row.interview.status === "Reschedule requested",
      ).length,
      completed: rows.filter(
        (row) => row.interview.status === "Completed",
      ).length,
    }),
    [rows],
  );
  const priorityRows = useMemo(
    () => sortInterviewRowsByPriority(rows),
    [rows],
  );

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

  const createRowActions = (
    row: EmployerInterviewRow,
  ): InterviewRowActions => ({
    onConfirm: () =>
      notify(
        row,
        "Scheduled",
        `Confirmed ${row.candidate.name}`,
        "Calendar invite sent to all interviewers.",
      ),
    onReschedule: () =>
      notify(
        row,
        "Scheduled",
        `Rescheduled ${row.candidate.name}`,
        "A new slot was proposed and the candidate will be notified.",
      ),
    onRequestCancel: () => undefined,
    onJoin: () =>
      notify(
        row,
        "Completed",
        `Joined ${row.candidate.name}'s interview`,
        "Scorecard will unlock when the call ends.",
      ),
    onViewNotes: () => undefined,
    onView: () => undefined,
  });

  const scheduleInterview = (
    candidateRow: ReturnType<typeof getEmployerCandidateRows>[number],
    interviewDetails: ScheduleInterviewValues,
  ) => {
    const nextId = Math.max(0, ...rows.map((row) => row.interview.id)) + 1;
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
  };

  const summaries = [
    { label: "Upcoming", value: counts.upcoming, icon: Calendar },
    { label: "Pending confirmation", value: counts.pending, icon: Clock },
    {
      label: "Reschedule requested",
      value: counts.reschedule,
      icon: ClipboardList,
    },
    { label: "Completed", value: counts.completed, icon: Users },
  ];

  return (
    <div className="space-y-8">
      <PageHeading
        title="Interview management"
        description="Review priority interviews and act on what needs attention next."
        action={
          <Button onClick={() => setScheduleOpen(true)}>
            <CalendarPlus />
            Schedule interview
          </Button>
        }
      />

      <section
        aria-label="Interview status counts"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
      >
        {summaries.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-5">
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-3xl font-semibold tracking-tight tabular-nums">
                  {value}
                </p>
                <p className="text-sm font-medium">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2>Priority interviews</h2>
            <p className="text-sm text-muted-foreground">
              Interviews ordered by what needs attention next.
            </p>
          </div>
          <Button
            asChild
            className="bg-highlight-soft text-foreground hover:bg-highlight-soft/80"
          >
            <Link href="/employer/interviews/all">View all interviews</Link>
          </Button>
        </div>

        {priorityRows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"
              >
                <Filter className="h-5 w-5 text-muted-foreground" />
              </span>
              <div>
                <p className="text-sm font-medium">
                  No priority interviews yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Schedule an interview when a candidate is ready for the next
                  step.
                </p>
              </div>
              <Button size="sm" onClick={() => setScheduleOpen(true)}>
                Schedule interview
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ul aria-label="Priority interviews" className="space-y-3">
            {priorityRows.map((row) => (
              <InterviewRow
                key={row.interview.id}
                row={row}
                mode="priority"
                actions={createRowActions(row)}
              />
            ))}
          </ul>
        )}
      </section>

      <InterviewScheduleDialog
        open={scheduleOpen}
        candidates={scheduleCandidates}
        onOpenChange={setScheduleOpen}
        onSchedule={scheduleInterview}
      />
    </div>
  );
}
