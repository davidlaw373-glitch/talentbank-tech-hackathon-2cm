"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  EyeOff,
  FileText,
  Search,
  Sparkles,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import {
  employerApplicants,
  type ApplicantStage,
  type EmployerApplicant,
} from "@/data/employer";
import { useCareerOSDemo } from "@/components/common/careeros-demo-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { selectCredentialProjection } from "@/lib/university-demo-state";

const STAGES: ApplicantStage[] = [
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Rejected",
];

const stageTone: Record<ApplicantStage, "default" | "secondary" | "outline"> = {
  Applied: "outline",
  Screening: "secondary",
  Interview: "secondary",
  Offer: "default",
  Rejected: "outline",
};

function resumeFile(candidate: EmployerApplicant) {
  return `data:text/plain;charset=utf-8,${encodeURIComponent(
    `${candidate.name}\n${candidate.role}\n\n${candidate.summary}\n\nSkills: ${candidate.skills.join(", ")}`
  )}`;
}

export function CandidateManagement() {
  const { state } = useCareerOSDemo();
  const alexCredential = selectCredentialProjection(state, "graduate-alex");
  const [applicants, setApplicants] = useState(employerApplicants);
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<"all" | ApplicantStage>("all");
  const [sort, setSort] = useState<"fit" | "newest">("fit");
  const [blindScreening, setBlindScreening] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const visibleApplicants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return applicants
      .filter((applicant) => {
        const searchable = `${applicant.name} ${applicant.role} ${applicant.skills.join(" ")}`.toLowerCase();
        return (!normalizedQuery || searchable.includes(normalizedQuery)) && (stage === "all" || applicant.stage === stage);
      })
      .sort((first, second) => (sort === "fit" ? second.fit - first.fit : 0));
  }, [applicants, query, sort, stage]);

  const activeCount = applicants.filter((applicant) => applicant.stage !== "Rejected").length;
  const shortlistCount = applicants.filter((applicant) => applicant.shortlisted).length;

  function updateApplicant(id: string, update: Partial<EmployerApplicant>) {
    setApplicants((current) => current.map((applicant) => (applicant.id === id ? { ...applicant, ...update } : applicant)));
  }

  function updateStage(applicant: EmployerApplicant, nextStage: ApplicantStage) {
    updateApplicant(applicant.id, {
      stage: nextStage,
      shortlisted: nextStage === "Rejected" ? false : applicant.shortlisted,
    });
    setNotice(`${applicant.name} moved to ${nextStage.toLowerCase()}.`);
  }

  function toggleShortlist(applicant: EmployerApplicant) {
    updateApplicant(applicant.id, { shortlisted: !applicant.shortlisted });
    setNotice(`${applicant.name} ${applicant.shortlisted ? "removed from" : "added to"} the shortlist.`);
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Candidate management</p>
          <h1>Make fair, confident hiring decisions</h1>
          <p className="max-w-2xl text-muted-foreground">Review every application, keep the shortlist focused, and move the right people to the next step.</p>
        </div>
        <Button variant={blindScreening ? "secondary" : "outline"} onClick={() => setBlindScreening((current) => !current)} aria-pressed={blindScreening}>
          <EyeOff />{blindScreening ? "Blind screening on" : "Use blind screening"}
        </Button>
      </section>

      {notice && <div role="status" className="flex items-center gap-2 rounded-lg border bg-muted/40 p-4 text-sm"><CheckCircle2 className="h-4 w-4" aria-hidden />{notice}</div>}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Applications", value: applicants.length, hint: "In this review" },
          { label: "Active", value: activeCount, hint: "Not declined" },
          { label: "Shortlisted", value: shortlistCount, hint: "Ready to progress" },
          { label: "New today", value: applicants.filter((applicant) => applicant.appliedOn === "Today").length, hint: "Needs first review" },
        ].map((stat) => <Card key={stat.label}><CardContent className="p-5"><p className="text-2xl font-semibold tabular-nums">{stat.value}</p><p className="mt-1 text-sm font-medium">{stat.label}</p><p className="mt-0.5 text-xs text-muted-foreground">{stat.hint}</p></CardContent></Card>)}
      </section>

      <Card>
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search applicants, roles, or skills" aria-label="Search applicants" /></div>
          <Select value={stage} onValueChange={(value) => setStage(value as "all" | ApplicantStage)}><SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All stages" /></SelectTrigger><SelectContent><SelectItem value="all">All stages</SelectItem>{STAGES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
          <Select value={sort} onValueChange={(value) => setSort(value as "fit" | "newest")}><SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="fit">Best fit</SelectItem><SelectItem value="newest">Newest</SelectItem></SelectContent></Select>
        </CardContent>
      </Card>

      {blindScreening && <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4 text-sm"><EyeOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /><p>Names and locations are hidden in this view so the initial review can stay focused on experience, skills, and role fit.</p></div>}

      <section className="space-y-3" aria-label="Application list">
        {visibleApplicants.length === 0 ? <Card><CardContent className="p-10 text-center"><UsersRound className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden /><p className="mt-3 text-sm font-medium">No applications match these filters</p><p className="mt-1 text-xs text-muted-foreground">Try a different search or stage.</p></CardContent></Card> : visibleApplicants.map((applicant, index) => {
          const expanded = expandedId === applicant.id;
          const displayName = blindScreening ? `Candidate ${String(index + 1).padStart(2, "0")}` : applicant.name;
          const trustedCredential = applicant.id === "alex-morgan" && alexCredential?.trustLabel ? alexCredential : null;
          return <Card key={applicant.id} className="overflow-hidden"><CardContent className="p-0"><div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center"><Badge variant="secondary" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg" aria-hidden>{blindScreening ? "?" : applicant.initials}</Badge><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{displayName}</p><Badge variant={stageTone[applicant.stage]}>{applicant.stage}</Badge>{applicant.shortlisted && <Badge variant="secondary">Shortlisted</Badge>}</div><p className="mt-1 text-sm text-muted-foreground">{applicant.role} · {applicant.experience}</p>{!blindScreening && <p className="mt-1 text-xs text-muted-foreground">{applicant.location} · Applied {applicant.appliedOn}</p>}<div className="mt-3 flex flex-wrap gap-1.5">{applicant.skills.map((skill) => <Badge key={skill} variant="outline" className="text-[10px]">{skill}</Badge>)}</div></div><div className="flex items-center gap-4 lg:text-right"><div><p className="text-2xl font-semibold tabular-nums">{applicant.fit}%</p><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Role fit</p></div><Button variant="outline" size="sm" onClick={() => setExpandedId(expanded ? null : applicant.id)} aria-expanded={expanded}>{expanded ? <ChevronUp /> : <ChevronDown />}{expanded ? "Hide" : "Review"}</Button></div></div>{expanded && <div className="border-t bg-muted/20 p-5"><div className="grid gap-5 lg:grid-cols-[1fr_auto]"><div><div className="flex items-center gap-2"><Sparkles className="h-4 w-4" aria-hidden /><p className="text-sm font-medium">Candidate summary</p></div><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{applicant.summary}</p>{trustedCredential && <div className="mt-4 flex max-w-xl items-start gap-3 rounded-lg border bg-background p-3"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium">{trustedCredential.qualification}</p><Badge variant="secondary">{trustedCredential.trustLabel}</Badge></div><p className="mt-1 text-xs text-muted-foreground">Issued by {trustedCredential.institution}</p></div></div>}<div className="mt-4 flex flex-wrap gap-2"><Button asChild variant="outline" size="sm"><a href={resumeFile(applicant)} download={`${applicant.name.replaceAll(" ", "-")}-resume.txt`}><Download />Download resume</a></Button>{applicant.portfolio && <Badge variant="outline" className="h-8"><FileText className="mr-1 h-3.5 w-3.5" aria-hidden />{applicant.portfolio}</Badge>}</div></div><div className="flex flex-wrap items-start gap-2 lg:max-w-sm lg:justify-end"><Select value={applicant.stage} onValueChange={(value) => updateStage(applicant, value as ApplicantStage)}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent>{STAGES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><Button variant="outline" size="sm" onClick={() => toggleShortlist(applicant)}><UserRoundPlus />{applicant.shortlisted ? "Remove shortlist" : "Shortlist"}</Button>{applicant.stage !== "Interview" && applicant.stage !== "Rejected" && <Button size="sm" onClick={() => updateStage(applicant, "Interview")}>Schedule interview</Button>}</div></div></div>}</CardContent></Card>;
        })}
      </section>
    </div>
  );
}
