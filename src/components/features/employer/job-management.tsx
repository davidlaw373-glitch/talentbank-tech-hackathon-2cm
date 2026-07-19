"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FilePenLine,
  MapPin,
  Plus,
  Search,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";

import { managedJobs, type ManagedJob } from "@/data/employer";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type JobDraft = Omit<ManagedJob, "requirements" | "benefits" | "applications" | "inProgress" | "posted"> & {
  requirementsText: string;
  benefitsText: string;
};

const EMPTY_DRAFT: JobDraft = {
  id: "",
  title: "",
  department: "Engineering",
  location: "Kuala Lumpur, Malaysia",
  workMode: "Hybrid",
  employmentType: "Full-time",
  salary: "",
  summary: "",
  requirementsText: "",
  benefitsText: "",
  status: "Open",
};

function toDraft(job: ManagedJob): JobDraft {
  return {
    ...job,
    requirementsText: job.requirements.join("\n"),
    benefitsText: job.benefits.join("\n"),
  };
}

function listFromText(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function JobManagement() {
  const [jobs, setJobs] = useState<ManagedJob[]>(managedJobs);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ManagedJob["status"]>("all");
  const [draft, setDraft] = useState<JobDraft>(EMPTY_DRAFT);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const filteredJobs = useMemo(() => {
    const search = query.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesQuery = !search || `${job.title} ${job.department} ${job.location}`.toLowerCase().includes(search);
      const matchesStatus = statusFilter === "all" || job.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [jobs, query, statusFilter]);

  const openCount = jobs.filter((job) => job.status === "Open").length;
  const totalApplications = jobs.reduce((total, job) => total + job.applications, 0);
  const totalInProgress = jobs.reduce((total, job) => total + job.inProgress, 0);

  function updateDraft<Key extends keyof JobDraft>(key: Key, value: JobDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function startCreate() {
    setDraft(EMPTY_DRAFT);
    setFormMode("create");
    setNotice(null);
  }

  function startEdit(job: ManagedJob) {
    setDraft(toDraft(job));
    setFormMode("edit");
    setNotice(null);
  }

  function saveJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = draft.title.trim();
    const nextJob: ManagedJob = {
      ...draft,
      id: draft.id || `${slugify(title)}-${Date.now()}`,
      title,
      requirements: listFromText(draft.requirementsText),
      benefits: listFromText(draft.benefitsText),
      applications: formMode === "edit" ? jobs.find((job) => job.id === draft.id)?.applications ?? 0 : 0,
      inProgress: formMode === "edit" ? jobs.find((job) => job.id === draft.id)?.inProgress ?? 0 : 0,
      posted: formMode === "edit" ? jobs.find((job) => job.id === draft.id)?.posted ?? "Updated just now" : "Published just now",
    };

    setJobs((current) =>
      formMode === "edit"
        ? current.map((job) => (job.id === nextJob.id ? nextJob : job))
        : [nextJob, ...current]
    );
    setFormMode(null);
    setDraft(EMPTY_DRAFT);
    setNotice(formMode === "edit" ? `${nextJob.title} updated.` : `${nextJob.title} created and ${nextJob.status === "Open" ? "published" : "saved as closed"}.`);
  }

  function toggleStatus(job: ManagedJob) {
    const nextStatus: ManagedJob["status"] = job.status === "Open" ? "Closed" : "Open";
    setJobs((current) => current.map((item) => (item.id === job.id ? { ...item, status: nextStatus, posted: nextStatus === "Open" ? "Reopened just now" : "Closed just now" } : item)));
    setNotice(`${job.title} is now ${nextStatus.toLowerCase()}.`);
  }

  function deleteJob(job: ManagedJob) {
    setJobs((current) => current.filter((item) => item.id !== job.id));
    setConfirmDeleteId(null);
    setExpandedJobId((current) => (current === job.id ? null : current));
    setNotice(`${job.title} deleted.`);
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Job management</p>
          <h1>Keep every role clear and current</h1>
          <p className="max-w-2xl text-muted-foreground">Create roles, refine the details candidates see, and control which openings are live.</p>
        </div>
        <Button onClick={startCreate}><Plus />New job</Button>
      </section>

      {notice && <div role="status" className="flex items-center gap-2 rounded-lg border bg-muted/40 p-4 text-sm"><CheckCircle2 className="h-4 w-4" aria-hidden />{notice}</div>}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: "Open roles", value: openCount, hint: "Live to candidates", icon: BriefcaseBusiness },
          { label: "Applications", value: totalApplications, hint: "Across all roles", icon: ClipboardList },
          { label: "In progress", value: totalInProgress, hint: "Being reviewed", icon: UsersRound },
        ].map((stat) => {
          const Icon = stat.icon;
          return <Card key={stat.label} className="lift-on-hover"><CardContent className="space-y-3 p-5"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"><Icon className="h-5 w-5" aria-hidden /></div><p className="text-3xl font-semibold tracking-tight tabular-nums">{stat.value}</p><div><p className="text-sm font-medium">{stat.label}</p><p className="text-xs text-muted-foreground">{stat.hint}</p></div></CardContent></Card>;
        })}
      </section>

      {formMode && (
        <form onSubmit={saveJob}>
          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div><CardTitle><h2>{formMode === "create" ? "Create a job" : `Edit ${draft.title}`}</h2></CardTitle><CardDescription>Set the core details candidates need to decide whether to apply.</CardDescription></div>
              <Button type="button" variant="ghost" size="icon" aria-label="Close job editor" onClick={() => setFormMode(null)}><X /></Button>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium">Job title<Input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} placeholder="e.g. Full-stack Engineer" required /></label>
              <label className="space-y-1.5 text-sm font-medium">Department<Input value={draft.department} onChange={(event) => updateDraft("department", event.target.value)} required /></label>
              <label className="space-y-1.5 text-sm font-medium">Location<Input value={draft.location} onChange={(event) => updateDraft("location", event.target.value)} required /></label>
              <label className="space-y-1.5 text-sm font-medium">Salary<Input value={draft.salary} onChange={(event) => updateDraft("salary", event.target.value)} placeholder="RM 6,000–8,000 monthly" required /></label>
              <div className="space-y-1.5 text-sm font-medium"><span>Work mode</span><Select value={draft.workMode} onValueChange={(value) => updateDraft("workMode", value as ManagedJob["workMode"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Remote">Remote</SelectItem><SelectItem value="Hybrid">Hybrid</SelectItem><SelectItem value="On-site">On-site</SelectItem></SelectContent></Select></div>
              <div className="space-y-1.5 text-sm font-medium"><span>Employment type</span><Select value={draft.employmentType} onValueChange={(value) => updateDraft("employmentType", value as ManagedJob["employmentType"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Part-time">Part-time</SelectItem><SelectItem value="Contract">Contract</SelectItem><SelectItem value="Internship">Internship</SelectItem></SelectContent></Select></div>
              <div className="space-y-1.5 text-sm font-medium"><span>Publishing status</span><Select value={draft.status} onValueChange={(value) => updateDraft("status", value as ManagedJob["status"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Open">Open to applications</SelectItem><SelectItem value="Closed">Closed</SelectItem></SelectContent></Select></div>
              <label className="space-y-1.5 text-sm font-medium md:col-span-2">Role summary<Textarea value={draft.summary} onChange={(event) => updateDraft("summary", event.target.value)} required /></label>
              <label className="space-y-1.5 text-sm font-medium">Requirements<Textarea value={draft.requirementsText} onChange={(event) => updateDraft("requirementsText", event.target.value)} placeholder={"React and TypeScript experience\nStrong written communication"} required /><span className="block text-xs font-normal text-muted-foreground">Add one requirement per line.</span></label>
              <label className="space-y-1.5 text-sm font-medium">Benefits<Textarea value={draft.benefitsText} onChange={(event) => updateDraft("benefitsText", event.target.value)} placeholder={"Learning budget\nFlexible hybrid schedule"} required /><span className="block text-xs font-normal text-muted-foreground">Add one benefit per line.</span></label>
              <div className="flex flex-wrap justify-end gap-2 md:col-span-2"><Button type="button" variant="outline" onClick={() => setFormMode(null)}><X />Cancel</Button><Button type="submit"><FilePenLine />{formMode === "create" ? "Create job" : "Save changes"}</Button></div>
            </CardContent>
          </Card>
        </form>
      )}

      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end">
          <label className="flex-1 space-y-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"><span>Search roles</span><span className="relative block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" aria-hidden /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Job title, department, or location" className="pl-9 normal-case tracking-normal" /></span></label>
          <div className="space-y-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"><span>Status</span><Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | ManagedJob["status"])}><SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All roles</SelectItem><SelectItem value="Open">Open</SelectItem><SelectItem value="Closed">Closed</SelectItem></SelectContent></Select></div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div><h2>{filteredJobs.length} role{filteredJobs.length === 1 ? "" : "s"}</h2><p className="text-sm text-muted-foreground">Review candidate demand and update your roles as hiring changes.</p></div>
        {filteredJobs.length === 0 ? <Card><CardContent className="p-10 text-center"><BriefcaseBusiness className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden /><p className="mt-3 text-sm font-medium">No roles match those filters</p><p className="mt-1 text-xs text-muted-foreground">Try a different search or status filter.</p></CardContent></Card> : filteredJobs.map((job) => {
          const expanded = expandedJobId === job.id;
          const deleting = confirmDeleteId === job.id;
          return <Card key={job.id} className="lift-on-hover"><CardContent className="space-y-4 p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted"><BriefcaseBusiness className="h-5 w-5" aria-hidden /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-base font-semibold">{job.title}</h3><Badge variant={job.status === "Open" ? "secondary" : "outline"}>{job.status}</Badge><Badge variant="outline">{job.department}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{job.summary}</p><div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground"><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" aria-hidden />{job.location} · {job.workMode}</span><span>{job.employmentType}</span><span>{job.salary}</span></div></div><div className="flex flex-wrap gap-4 text-left lg:text-right"><div><p className="text-2xl font-semibold tabular-nums">{job.applications}</p><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Applications</p></div><div><p className="text-2xl font-semibold tabular-nums">{job.inProgress}</p><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">In progress</p></div></div></div><div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"><p className="text-xs text-muted-foreground">{job.posted}</p><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" size="sm" onClick={() => setExpandedJobId(expanded ? null : job.id)}>{expanded ? <ChevronUp /> : <ChevronDown />}{expanded ? "Hide details" : "View details"}</Button><Button type="button" variant="outline" size="sm" onClick={() => startEdit(job)}><FilePenLine />Edit</Button><Button type="button" variant="outline" size="sm" onClick={() => toggleStatus(job)}>{job.status === "Open" ? "Close role" : "Reopen role"}</Button>{deleting ? <Button type="button" variant="destructive" size="sm" onClick={() => deleteJob(job)}><Trash2 />Confirm remove</Button> : <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDeleteId(job.id)}><Trash2 />Delete</Button>}</div></div>{deleting && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">Removing this role cannot be undone. Select “Confirm remove” to continue.</p>}{expanded && <div className="grid gap-4 border-t pt-4 sm:grid-cols-2"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Requirements</p><ul className="mt-2 space-y-2 text-sm">{job.requirements.map((requirement) => <li key={requirement} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{requirement}</li>)}</ul></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Benefits</p><ul className="mt-2 space-y-2 text-sm">{job.benefits.map((benefit) => <li key={benefit} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{benefit}</li>)}</ul></div></div>}</CardContent></Card>;
        })}
      </section>
    </div>
  );
}
