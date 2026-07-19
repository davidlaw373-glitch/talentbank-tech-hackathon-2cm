"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  FilePenLine,
  Plus,
  RefreshCw,
  Video,
  XCircle,
} from "lucide-react";
import {
  employerApplicants,
  employerInterviews,
  type EmployerInterview,
} from "@/data/employer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type InterviewDraft = {
  applicantId: string;
  date: string;
  time: string;
  format: EmployerInterview["format"];
  interviewer: string;
};

const EMPTY_DRAFT: InterviewDraft = { applicantId: "", date: "", time: "", format: "Video", interviewer: "" };

const statusTone: Record<EmployerInterview["status"], "default" | "secondary" | "outline"> = {
  Scheduled: "secondary",
  "Feedback due": "default",
  Completed: "outline",
  Cancelled: "outline",
};

export function InterviewManagement() {
  const [interviews, setInterviews] = useState(employerInterviews);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<InterviewDraft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const activeInterviews = useMemo(() => interviews.filter((item) => item.status !== "Cancelled" && item.status !== "Completed"), [interviews]);
  const feedbackDue = interviews.filter((item) => item.status === "Feedback due").length;

  function updateDraft<Key extends keyof InterviewDraft>(key: Key, value: InterviewDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function openCreate() {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(interview: EmployerInterview) {
    setDraft({ applicantId: interview.applicantId, date: interview.date, time: interview.time, format: interview.format, interviewer: interview.interviewer });
    setEditingId(interview.id);
    setShowForm(true);
  }

  function saveInterview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const applicant = employerApplicants.find((item) => item.id === draft.applicantId);
    if (!applicant) return;
    if (editingId) {
      setInterviews((current) => current.map((item) => item.id === editingId ? { ...item, date: draft.date, time: draft.time, format: draft.format, interviewer: draft.interviewer, status: "Scheduled" } : item));
      setNotice(`Interview with ${applicant.name} rescheduled.`);
    } else {
      setInterviews((current) => [{ id: `interview-${applicant.id}-${Date.now()}`, applicantId: applicant.id, candidate: applicant.name, initials: applicant.initials, role: applicant.role, date: draft.date, time: draft.time, format: draft.format, interviewer: draft.interviewer, status: "Scheduled" }, ...current]);
      setNotice(`Interview invitation prepared for ${applicant.name}.`);
    }
    setShowForm(false);
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
  }

  function updateStatus(interview: EmployerInterview, status: EmployerInterview["status"], message: string) {
    setInterviews((current) => current.map((item) => item.id === interview.id ? { ...item, status } : item));
    setFeedbackId(null);
    setNotice(message);
  }

  return <div className="space-y-8">
    <section className="flex flex-wrap items-start justify-between gap-4"><div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Interview management</p><h1>Keep every conversation moving</h1><p className="max-w-2xl text-muted-foreground">Schedule clear interviews, make changes without back-and-forth, and capture decisions while the discussion is fresh.</p></div><Button onClick={openCreate}><Plus />Schedule interview</Button></section>

    {notice && <div role="status" className="flex items-center gap-2 rounded-lg border bg-muted/40 p-4 text-sm"><CheckCircle2 className="h-4 w-4" aria-hidden />{notice}</div>}

    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[
      { label: "Upcoming", value: activeInterviews.length, hint: "Scheduled conversations", icon: CalendarClock },
      { label: "Feedback due", value: feedbackDue, hint: "Needs a decision", icon: FilePenLine },
      { label: "This week", value: interviews.filter((item) => item.status !== "Cancelled").length, hint: "Including completed", icon: Clock3 },
    ].map(({ label, value, hint, icon: Icon }) => <Card key={label}><CardContent className="p-5"><Icon className="h-4 w-4 text-muted-foreground" aria-hidden /><p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p><p className="mt-1 text-sm font-medium">{label}</p><p className="mt-0.5 text-xs text-muted-foreground">{hint}</p></CardContent></Card>)}</section>

    {showForm && <Card className="border-foreground/20"><CardHeader><CardTitle><h2>{editingId ? "Reschedule interview" : "Schedule an interview"}</h2></CardTitle><CardDescription>{editingId ? "Update the time or format; the candidate will receive the revised invitation." : "Choose a candidate and give the conversation a clear owner and format."}</CardDescription></CardHeader><CardContent><form className="grid gap-4 md:grid-cols-2" onSubmit={saveInterview}><label className="space-y-2 text-sm font-medium">Candidate<Select value={draft.applicantId} onValueChange={(value) => updateDraft("applicantId", value)} required><SelectTrigger><SelectValue placeholder="Choose a candidate" /></SelectTrigger><SelectContent>{employerApplicants.filter((item) => item.stage !== "Rejected").map((applicant) => <SelectItem key={applicant.id} value={applicant.id}>{applicant.name} · {applicant.role}</SelectItem>)}</SelectContent></Select></label><label className="space-y-2 text-sm font-medium">Interviewer<Input value={draft.interviewer} onChange={(event) => updateDraft("interviewer", event.target.value)} placeholder="e.g. Sam Lee · Engineering" required /></label><label className="space-y-2 text-sm font-medium">Date<Input type="date" value={draft.date} onChange={(event) => updateDraft("date", event.target.value)} required /></label><label className="space-y-2 text-sm font-medium">Time<Input type="time" value={draft.time} onChange={(event) => updateDraft("time", event.target.value)} required /></label><label className="space-y-2 text-sm font-medium">Format<Select value={draft.format} onValueChange={(value) => updateDraft("format", value as EmployerInterview["format"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Video">Video interview</SelectItem><SelectItem value="On-site">On-site interview</SelectItem></SelectContent></Select></label><div className="flex items-end gap-2"><Button type="submit">{editingId ? "Save new time" : "Send invitation"}</Button><Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button></div></form></CardContent></Card>}

    <section className="space-y-4" aria-label="Interview schedule"><div><h2 className="text-lg font-semibold">Schedule</h2><p className="mt-1 text-sm text-muted-foreground">All times are Malaysia Time (MYT).</p></div>{interviews.map((interview) => <Card key={interview.id}><CardContent className="p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center"><Badge variant="secondary" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg" aria-hidden>{interview.initials}</Badge><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{interview.candidate}</p><Badge variant={statusTone[interview.status]}>{interview.status}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{interview.role}</p><div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" aria-hidden />{interview.date} · {interview.time}</span><span className="inline-flex items-center gap-1">{interview.format === "Video" ? <Video className="h-3.5 w-3.5" aria-hidden /> : <CalendarClock className="h-3.5 w-3.5" aria-hidden />}{interview.format}</span><span>{interview.interviewer}</span></div></div><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => openEdit(interview)} disabled={interview.status === "Cancelled" || interview.status === "Completed"}><RefreshCw />Reschedule</Button>{interview.status === "Feedback due" && <Button size="sm" onClick={() => setFeedbackId(feedbackId === interview.id ? null : interview.id)}><FilePenLine />Record feedback</Button>}{interview.status === "Scheduled" && <Button variant="outline" size="sm" onClick={() => updateStatus(interview, "Cancelled", `Interview with ${interview.candidate} cancelled.`)}><XCircle />Cancel</Button>}</div></div>{feedbackId === interview.id && <form className="mt-5 grid gap-4 border-t pt-5" onSubmit={(event) => { event.preventDefault(); updateStatus(interview, "Completed", `Feedback saved for ${interview.candidate}. They are ready for the next decision.`); }}><label className="space-y-2 text-sm font-medium">Interview feedback<Textarea placeholder="Capture evidence, strengths, concerns, and the recommended next step." required /></label><div className="flex flex-wrap gap-2"><Button type="submit">Save feedback</Button><Button type="button" variant="outline" onClick={() => updateStatus(interview, "Completed", `${interview.candidate} moved to the offer decision queue.`)}>Recommend offer</Button><Button type="button" variant="ghost" onClick={() => setFeedbackId(null)}>Cancel</Button></div></form>}</CardContent></Card>)}</section>
  </div>;
}
