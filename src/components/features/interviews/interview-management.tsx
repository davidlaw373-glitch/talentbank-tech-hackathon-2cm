"use client";

import * as React from "react";
import { useState } from "react";
import {
  CalendarClock,
  CalendarPlus,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageSquare,
  Sparkles,
  Users,
  Video,
  X,
} from "lucide-react";

import { useToast } from "@/components/common/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

type InterviewStat = {
  id: string;
  label: string;
  value: number;
  icon: typeof CalendarClock;
};

const STATS: InterviewStat[] = [
  { id: "upcoming", label: "Upcoming", value: 2, icon: CalendarClock },
  { id: "pending", label: "Pending confirmation", value: 1, icon: Clock },
  { id: "reschedule", label: "Reschedule requested", value: 0, icon: MessageSquare },
  { id: "completed", label: "Completed", value: 1, icon: Check },
];

const UPCOMING = [
  {
    id: "iv-1",
    role: "Senior Frontend Engineer",
    company: "Northstar Labs",
    round: "Technical round",
    when: "Tomorrow",
    time: "10:00 SGT",
    duration: "90 min",
    interviewers: ["Jordan Lee", "Priya Anand"],
  },
  {
    id: "iv-2",
    role: "Associate Product Engineer",
    company: "CivicWorks",
    round: "Behavioural round",
    when: "Friday",
    time: "14:00 MYT",
    duration: "45 min",
    interviewers: ["Mei Tan"],
  },
];

const MOCK_QUESTIONS = [
  "Walk me through how you would split a complex product surface into reusable components.",
  "How do you decide when to lift state up versus introduce a new context?",
  "Describe a recent accessibility issue you found and how you fixed it.",
  "How would you debug a sudden regression in our largest client dashboard?",
];

const COMPANY_NOTES = [
  "Series B SaaS serving community lenders across Southeast Asia.",
  "Engineering culture emphasises accessibility audits and shared component libraries.",
  "Hiring bar favours cross-functional ownership and steady release cadence.",
];

const SCORECARD = [
  "Technical depth & problem solving",
  "Communication and signal clarity",
  "System & accessibility thinking",
  "Culture add and team alignment",
];

const PAST = [
  {
    id: "past-1",
    role: "Final round",
    company: "Orbit Commerce",
    when: "Last week",
    feedback:
      "Strong communication, would benefit from more concrete trade-off examples in design reviews.",
  },
];

type RescheduleTarget = {
  id: string;
  company: string;
  role: string;
  round: string;
  interviewers: string[];
  /** Original time the candidate is rescheduling away from. */
  when: string;
  time: string;
};

type RescheduleSlot = {
  id: string;
  value: string;
};

const EMPTY_SLOTS: RescheduleSlot[] = [
  { id: "slot-1", value: "" },
  { id: "slot-2", value: "" },
  { id: "slot-3", value: "" },
];

/* ------------------------------------------------------------------ */
/* Reschedule dialog — collects up to 3 suggested times and a reason  */
/* ------------------------------------------------------------------ */

function RescheduleDialog({
  open,
  onOpenChange,
  target,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  target: RescheduleTarget | null;
  onSubmit: (payload: {
    target: RescheduleTarget;
    slots: string[];
    reason: string;
  }) => void;
}) {
  const dialogRef = React.useRef<HTMLDialogElement | null>(null);
  const titleId = React.useId();
  const formId = React.useId();

  // Local form state. The parent passes `key={target.id}` so the dialog
  // remounts (and the state resets) whenever a different interview is
  // opened for rescheduling — no manual reset effect needed.
  const [slots, setSlots] = useState<RescheduleSlot[]>(EMPTY_SLOTS);
  const [reason, setReason] = useState("");

  // Sync open state ↔ <dialog> show/close (same pattern as ConfirmDialog).
  React.useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && !node.open) {
      node.showModal();
    } else if (!open && node.open) {
      node.close();
    }
  }, [open]);

  React.useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    const onClose = () => onOpenChange(false);
    node.addEventListener("close", onClose);
    return () => node.removeEventListener("close", onClose);
  }, [onOpenChange]);

  const filledSlots = slots.map((slot) => slot.value.trim()).filter(Boolean);
  const canSubmit = filledSlots.length > 0;

  const updateSlot = (slotId: string, value: string) => {
    setSlots((current) =>
      current.map((slot) => (slot.id === slotId ? { ...slot, value } : slot))
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!target || !canSubmit) return;
    onSubmit({
      target,
      slots: filledSlots,
      reason: reason.trim(),
    });
    onOpenChange(false);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className={cn(
        "w-full max-w-lg p-0 rounded-lg shadow-xl",
        "bg-popover text-popover-foreground",
        "backdrop:bg-foreground/40 backdrop:backdrop-blur-sm",
        "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
        "border border-border",
      )}
      onClick={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      {target ? (
        <form
          id={formId}
          method="dialog"
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          <header className="space-y-1.5">
            <h2 id={titleId} className="text-lg font-semibold tracking-tight">
              Request a reschedule
            </h2>
            <p className="text-sm text-muted-foreground">
              <strong>{target.role}</strong> at {target.company} · originally{" "}
              {target.when} at {target.time}
            </p>
          </header>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Suggested times
              </p>
              <p className="text-[11px] text-muted-foreground">
                {filledSlots.length} of 3 added
              </p>
            </div>
            <div className="space-y-2">
              {slots.map((slot, index) => (
                <div
                  key={slot.id}
                  className="flex items-center gap-2 rounded-md border bg-card p-2"
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <Input
                    value={slot.value}
                    onChange={(event) =>
                      updateSlot(slot.id, event.target.value)
                    }
                    placeholder="e.g. Thu 24 Jul, 2:00–3:00 PM SGT"
                    aria-label={`Suggested time ${index + 1}`}
                    className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Add at least one slot. The interviewer will pick whichever works
              on their side.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`${formId}-reason`}
              className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
              Reason <span className="font-normal normal-case">(optional)</span>
            </label>
            <Textarea
              id={`${formId}-reason`}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              placeholder="e.g. Conflict with a final exam — happy to move mornings or another weekday."
              aria-label="Reason for rescheduling"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              Send request
            </Button>
          </div>
        </form>
      ) : null}
    </dialog>
  );
}

export function InterviewManagement() {
  const { push } = useToast();
  const [upcoming, setUpcoming] = useState(UPCOMING);
  const [prepOpen, setPrepOpen] = useState(true);
  const [selectedPrepId, setSelectedPrepId] = useState(UPCOMING[0]?.id ?? "");
  const [pastFeedbackOpen, setPastFeedbackOpen] = useState<Set<string>>(
    new Set()
  );
  const [pendingCancel, setPendingCancel] = useState<{
    id: string;
    company: string;
  } | null>(null);
  const [pendingReschedule, setPendingReschedule] =
    useState<RescheduleTarget | null>(null);

  const prepInterview =
    upcoming.find((interview) => interview.id === selectedPrepId) ??
    upcoming[0] ?? { id: "", company: "your", role: "", round: "", when: "", time: "", duration: "", interviewers: [] };

  const togglePrep = (id: string) => {
    if (selectedPrepId === id) {
      setPrepOpen((open) => !open);
      return;
    }
    setSelectedPrepId(id);
    setPrepOpen(true);
  };

  const togglePastFeedback = (id: string) => {
    setPastFeedbackOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openReschedule = (target: RescheduleTarget) => {
    setPendingReschedule(target);
  };

  const handleRescheduleSubmit = (payload: {
    target: RescheduleTarget;
    slots: string[];
    reason: string;
  }) => {
    const recipient = payload.target.interviewers[0] ?? "the team";
    const slotSummary =
      payload.slots.length === 1
        ? payload.slots[0]
        : `${payload.slots.length} suggested times`;
    push({
      title: `Reschedule request sent to ${recipient}`,
      description: payload.reason
        ? `${slotSummary} — "${payload.reason}"`
        : slotSummary,
      tone: "success",
    });
    setPendingReschedule(null);
  };

  return (
    <div className="space-y-8">
      {/* Stat row */}
      <section
        aria-label="Interview summary"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
      >
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.id}>
              <CardContent className="space-y-2 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Icon aria-hidden className="h-5 w-5" />
                </div>
                <p className="text-4xl font-semibold tabular-nums leading-none sm:text-5xl">
                  {s.id === "upcoming" ? upcoming.length : s.value}
                </p>
                <p className="text-base font-semibold tracking-tight">
                  {s.label}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Upcoming interviews */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-card-title">Upcoming interviews</h2>
            <p className="text-sm text-muted-foreground">
              You have {upcoming.length} scheduled this week.
            </p>
          </div>
          <Badge variant="secondary">{upcoming.length} confirmed</Badge>
        </div>

        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <CalendarClock aria-hidden className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">No interviews scheduled</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  We&apos;ll show each upcoming round here once a recruiter confirms.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {upcoming.map((iv) => (
              <Card key={iv.id}>
                <CardContent className="space-y-5 p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    {/* Left — date + time prominent */}
                    <div className="flex shrink-0 flex-col items-start gap-1 rounded-lg border bg-surface-tint p-4 sm:w-44">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {iv.when}
                      </p>
                      <p className="text-2xl font-semibold tracking-tight tabular-nums leading-tight">
                        {iv.time.split(" ")[0]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {iv.time.split(" ")[1]}
                      </p>
                      <Separator className="my-1" />
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock aria-hidden className="h-3 w-3" />
                        {iv.duration}
                      </div>
                      <Badge variant="outline" className="mt-1">
                        <Video aria-hidden className="mr-1 h-3 w-3" />
                        Video
                      </Badge>
                    </div>

                    {/* Right — role, interviewers, actions */}
                    <div className="flex-1 space-y-3">
                      <div className="space-y-1">
                        <p className="text-base font-semibold">{iv.role}</p>
                        <p className="text-sm text-muted-foreground">
                          {iv.company}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{iv.round}</Badge>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Users aria-hidden className="h-3 w-3" />
                          {iv.interviewers.join(", ")}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          aria-label={`Add ${iv.company} interview to calendar`}
                          onClick={() =>
                            push({
                              title: "Interview added to calendar",
                              description: `${iv.company} · ${iv.when} at ${iv.time}`,
                              tone: "success",
                            })
                          }
                        >
                          <CalendarPlus aria-hidden />
                          Add to calendar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          aria-label={`Reschedule ${iv.company} interview`}
                          onClick={() =>
                            openReschedule({
                              id: iv.id,
                              company: iv.company,
                              role: iv.role,
                              round: iv.round,
                              interviewers: iv.interviewers,
                              when: iv.when,
                              time: iv.time,
                            })
                          }
                        >
                          Reschedule
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          aria-label={`Cancel ${iv.company} interview`}
                          onClick={() =>
                            setPendingCancel({
                              id: iv.id,
                              company: iv.company,
                            })
                          }
                        >
                          <X aria-hidden />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          aria-label={`${
                            prepOpen && selectedPrepId === iv.id ? "Hide" : "Open"
                          } prep for ${iv.company} interview`}
                          aria-expanded={prepOpen && selectedPrepId === iv.id}
                          onClick={() => togglePrep(iv.id)}
                        >
                          {prepOpen && selectedPrepId === iv.id
                            ? "Hide prep"
                            : "View prep"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Interview prep */}
      <section>
        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>
                <h2 className="flex items-center gap-2 text-card-title">
                  <Sparkles aria-hidden className="h-4 w-4" />
                  Interview prep — {prepInterview.company} {prepInterview.round.toLowerCase()}
                </h2>
              </CardTitle>
              <CardDescription>
                Mock questions, company research, and the scorecard for your {prepInterview.company} interview.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              aria-label={prepOpen ? "Collapse prep" : "Expand prep"}
              aria-expanded={prepOpen}
              onClick={() => setPrepOpen((v) => !v)}
            >
              {prepOpen ? (
                <ChevronUp aria-hidden className="h-4 w-4" />
              ) : (
                <ChevronDown aria-hidden className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          {prepOpen && (
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Mock questions */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <h3 className="flex items-center gap-2">
                        <MessageSquare aria-hidden className="h-4 w-4" />
                        Mock questions
                      </h3>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <ol className="space-y-2">
                      {MOCK_QUESTIONS.map((q, i) => (
                        <li
                          key={q}
                          className="rounded-md border bg-card p-3"
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold"
                              aria-hidden
                            >
                              {i + 1}
                            </span>
                            {/* min-w-0 lets the long question wrap inside this
                                flex child — without it, the intrinsic width
                                of the text pushes the card past its column. */}
                            <p className="min-w-0 flex-1 text-sm leading-relaxed text-foreground">
                              {q}
                            </p>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                push({
                                  title: "Practice session started",
                                  description: q,
                                  tone: "info",
                                })
                              }
                            >
                              Practice
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>

                {/* Company research */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <h3>Company research</h3>
                    </CardTitle>
                    <CardDescription>{prepInterview.company} snapshot</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {COMPANY_NOTES.map((note) => (
                        <li
                          key={note}
                          className="flex items-start gap-2 rounded-md border bg-card p-3 text-xs leading-relaxed"
                        >
                          <span
                            className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/60"
                            aria-hidden
                          />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Scorecard preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <h3>Scorecard preview</h3>
                    </CardTitle>
                    <CardDescription>What your interviewers will rate.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {SCORECARD.map((line) => (
                        <li
                          key={line}
                          className="flex items-center justify-between gap-3 rounded-md border bg-card p-3 text-xs"
                        >
                          {/* min-w-0 lets the long label wrap inside this
                              flex child so the badge on the right is never
                              crowded off the card at narrow widths. */}
                          <span className="min-w-0 flex-1 leading-relaxed">
                            {line}
                          </span>
                          <Badge variant="outline" className="shrink-0">
                            1–5
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          )}
        </Card>
      </section>

      {/* Past interviews */}
      <section className="space-y-4">
        <div>
          <h2 className="text-card-title">Past interviews</h2>
          <p className="text-sm text-muted-foreground">
            Feedback from your most recent rounds.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {PAST.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle>
                  <h3>
                    {p.role} · {p.company}
                  </h3>
                </CardTitle>
                <CardDescription>{p.when}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pastFeedbackOpen.has(p.id) && (
                  <div className="rounded-md border-l-2 border-foreground/40 bg-surface-tint p-3 text-xs leading-relaxed">
                    <span className="font-semibold">Feedback: </span>
                    {p.feedback}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    aria-expanded={pastFeedbackOpen.has(p.id)}
                    onClick={() => togglePastFeedback(p.id)}
                  >
                    {pastFeedbackOpen.has(p.id)
                      ? "Hide feedback"
                      : "View feedback"}
                  </Button>
                  <Badge variant="secondary">Completed</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <ConfirmDialog
        open={pendingCancel !== null}
        onOpenChange={(open) => !open && setPendingCancel(null)}
        title="Cancel this interview?"
        description={
          pendingCancel ? (
            <>
              Your interview with <strong>{pendingCancel.company}</strong> will
              be cancelled. They&apos;ll be notified by email so you can rebook
              if needed.
            </>
          ) : null
        }
        confirmLabel="Cancel interview"
        destructive
        onConfirm={() => {
          if (pendingCancel) {
            setUpcoming((current) =>
              current.filter((interview) => interview.id !== pendingCancel.id),
            );
            if (selectedPrepId === pendingCancel.id) {
              setPrepOpen(false);
              setSelectedPrepId(upcoming[0]?.id ?? "");
            }
            push({
              title: "Interview cancelled — candidate notified",
              tone: "success",
            });
          }
          setPendingCancel(null);
        }}
      />

      <RescheduleDialog
        key={pendingReschedule?.id ?? "closed"}
        open={pendingReschedule !== null}
        onOpenChange={(open) => !open && setPendingReschedule(null)}
        target={pendingReschedule}
        onSubmit={handleRescheduleSubmit}
      />
    </div>
  );
}