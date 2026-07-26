"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CalendarPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getEmployerCandidateRows } from "@/lib/data-helpers";
import type { Interview, InterviewType } from "@/types/interview";
import { INTERVIEW_TYPES } from "./interview-data";

export type ScheduleInterviewValues = Pick<
  Interview,
  | "type"
  | "interviewers"
  | "scheduledFor"
  | "duration"
  | "scorecardItems"
>;

type ScheduleCandidate = ReturnType<typeof getEmployerCandidateRows>[number];

export function InterviewScheduleDialog({
  open,
  candidates,
  onOpenChange,
  onSchedule,
}: {
  open: boolean;
  candidates: ScheduleCandidate[];
  onOpenChange: (open: boolean) => void;
  onSchedule: (
    candidate: ScheduleCandidate,
    values: ScheduleInterviewValues,
  ) => void;
}) {
  if (!open) return null;

  return (
    <InterviewScheduleDialogContent
      candidates={candidates}
      onOpenChange={onOpenChange}
      onSchedule={onSchedule}
    />
  );
}

function InterviewScheduleDialogContent({
  candidates,
  onOpenChange,
  onSchedule,
}: {
  candidates: ScheduleCandidate[];
  onOpenChange: (open: boolean) => void;
  onSchedule: (
    candidate: ScheduleCandidate,
    values: ScheduleInterviewValues,
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
    if (dialog && !dialog.open) dialog.showModal();
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
                  <SelectItem key={row.app.id} value={String(row.app.id)}>
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
