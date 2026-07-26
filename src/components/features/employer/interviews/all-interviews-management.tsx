"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

import { useToast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EmployerInterviewRow } from "@/lib/data-helpers";
import type { InterviewStatus } from "@/types/interview";
import {
  filterInterviewRows,
  getEmployerInterviewSeedRows,
  INTERVIEW_STATUSES,
  INTERVIEW_TYPES,
  type StatusFilter,
  type TypeFilter,
} from "./interview-data";
import {
  InterviewRow,
  type InterviewRowActions,
} from "./interview-row";
import styles from "./all-interviews-management.module.css";

export function AllInterviewsManagement() {
  const { push } = useToast();
  const [rows, setRows] = useState<EmployerInterviewRow[]>(
    getEmployerInterviewSeedRows,
  );
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [type, setType] = useState<TypeFilter>("All");
  const [pendingCancel, setPendingCancel] =
    useState<EmployerInterviewRow | null>(null);

  const filteredRows = useMemo(
    () => filterInterviewRows(rows, { query, status, type }),
    [query, rows, status, type],
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
    nextStatus: InterviewStatus,
    title: string,
    description: string,
  ) => {
    updateInterview(row.interview.id, { status: nextStatus });
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
    onRequestCancel: () => setPendingCancel(row),
    onJoin: () =>
      notify(
        row,
        "Completed",
        `Joined ${row.candidate.name}'s interview`,
        "Scorecard will unlock when the call ends.",
      ),
    onViewNotes: () =>
      push({
        title: `Opening notes for ${row.candidate.name}`,
        description: `${row.interview.scorecardItems} scorecard items ready for review.`,
        tone: "info",
      }),
    onView: () =>
      push({
        title: `Opening ${row.candidate.name}`,
        description: `${row.interview.type} · ${row.interview.scheduledFor}`,
        tone: "info",
      }),
  });

  return (
    <div className="space-y-8">
      <div className={`${styles.toolbar} border-b pb-6`}>
        <Button
          asChild
          variant="outline"
          size="icon"
          className="bg-surface-1 hover:bg-surface-2"
        >
          <Link
            href="/employer/interviews"
            aria-label="Back to interview overview"
          >
            <ArrowLeft />
          </Link>
        </Button>

        <section
          aria-label="Interview filters"
          className={styles.filters}
        >
          <div>
            <label htmlFor="all-interview-search" className="sr-only">
              Search interviews
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="all-interview-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Candidate, role, or interviewer"
                className="pl-9"
              />
            </div>
          </div>

          <Select
            value={status}
            onValueChange={(value) => setStatus(value as StatusFilter)}
          >
            <SelectTrigger aria-label="Interview status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All statuses</SelectItem>
              {INTERVIEW_STATUSES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={type}
            onValueChange={(value) => setType(value as TypeFilter)}
          >
            <SelectTrigger aria-label="Interview type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All interview types</SelectItem>
              {INTERVIEW_TYPES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>
      </div>

      <section aria-label="All interviews" className="space-y-4">
        <div>
          <h2>Interview schedule</h2>
          <p className="text-meta text-muted-foreground" aria-live="polite">
            {filteredRows.length}{" "}
            {filteredRows.length === 1 ? "interview" : "interviews"}
          </p>
        </div>

        {filteredRows.length === 0 ? (
          <p className="py-16 text-center text-body text-muted-foreground">
            No interviews match the current search and filters.
          </p>
        ) : (
          <ul aria-label="Complete interview list" className="space-y-4">
            {filteredRows.map((row) => (
              <InterviewRow
                key={row.interview.id}
                row={row}
                mode="all"
                actions={createRowActions(row)}
              />
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={pendingCancel !== null}
        onOpenChange={(open) => !open && setPendingCancel(null)}
        title={`Cancel interview with ${pendingCancel?.candidate.name ?? "candidate"}?`}
        description="Both sides will be notified by email. You can rebook afterwards if plans change."
        confirmLabel="Cancel interview"
        destructive
        onConfirm={() => {
          if (pendingCancel) {
            updateInterview(pendingCancel.interview.id, {
              status: "Cancelled",
            });
            push({
              title: `Cancelled ${pendingCancel.candidate.name}`,
              description: "Candidate has been notified of the cancellation.",
              tone: "info",
            });
          }
          setPendingCancel(null);
        }}
      />
    </div>
  );
}
