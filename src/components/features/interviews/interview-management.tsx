"use client";

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

import { PageHeading } from "@/components/common/page-heading";
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
import { Separator } from "@/components/ui/separator";

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

export function InterviewManagement() {
  const { push } = useToast();
  const [upcoming, setUpcoming] = useState(UPCOMING);
  const [prepOpen, setPrepOpen] = useState(true);
  const [selectedPrepId, setSelectedPrepId] = useState(UPCOMING[0]?.id ?? "");
  const [pastFeedbackOpen, setPastFeedbackOpen] = useState<Set<string>>(
    new Set()
  );

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

  return (
    <div className="space-y-8">
      <PageHeading
        title="Interviews"
        description="Manage every scheduled round, prep confidently, and keep past feedback within reach."
        action={
          <Button
            variant="outline"
            onClick={() =>
              push({
                title: "Connected to Google Calendar",
                tone: "success",
              })
            }
          >
            <CalendarPlus aria-hidden />
            Calendar sync
          </Button>
        }
      />

      {/* Stat row */}
      <section
        aria-label="Interview summary"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
      >
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.id} className="lift-on-hover">
              <CardContent className="space-y-2 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Icon aria-hidden className="h-5 w-5" />
                </div>
                <p className="text-3xl font-semibold tabular-nums leading-none">
                  {s.id === "upcoming" ? upcoming.length : s.value}
                </p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Upcoming interviews */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2>Upcoming interviews</h2>
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
              <Card key={iv.id} className="lift-on-hover">
                <CardContent className="space-y-5 p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    {/* Left — date + time prominent */}
                    <div className="flex shrink-0 flex-col items-start gap-1 rounded-lg border bg-muted/30 p-4 sm:w-44">
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
                            push({
                              title: `Reschedule request sent to ${iv.interviewers[0]}`,
                              tone: "success",
                            })
                          }
                        >
                          Reschedule
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          aria-label={`Cancel ${iv.company} interview`}
                          onClick={() => {
                            setUpcoming((current) =>
                              current.filter((interview) => interview.id !== iv.id)
                            );
                            if (selectedPrepId === iv.id) {
                              setPrepOpen(false);
                              setSelectedPrepId(upcoming[0]?.id ?? "");
                            }
                            push({
                              title: "Interview cancelled — candidate notified",
                              tone: "success",
                            });
                          }}
                        >
                          <X aria-hidden />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
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
                <h2 className="flex items-center gap-2">
                  <Sparkles aria-hidden className="h-4 w-4" />
                  Interview prep — {prepInterview.company} {prepInterview.round.toLowerCase()}
                </h2>
              </CardTitle>
              <CardDescription>
                Mock questions, company research, and the scorecard for your {prepInterview.company} interview.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
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
                          className="flex items-start gap-2 rounded-md border bg-card p-3"
                        >
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold"
                            aria-hidden
                          >
                            {i + 1}
                          </span>
                          <div className="flex-1 space-y-2">
                            <p className="text-xs leading-relaxed">{q}</p>
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
                              Practice this question
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
                          className="flex items-center justify-between rounded-md border bg-card p-3 text-xs"
                        >
                          <span>{line}</span>
                          <Badge variant="outline">1–5</Badge>
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
          <h2>Past interviews</h2>
          <p className="text-sm text-muted-foreground">
            Feedback from your most recent rounds.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {PAST.map((p) => (
            <Card key={p.id} className="lift-on-hover">
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
                  <div className="rounded-md border-l-2 border-foreground/40 bg-muted/40 p-3 text-xs leading-relaxed">
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
    </div>
  );
}