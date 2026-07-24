"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Download,
  FileText,
  Sparkles,
  Wand2,
  AlertTriangle,
  Eye,
  Pencil,
  Plus,
  ArrowRight,
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
import { get as getCandidate } from "@/data/candidates";

const RESUME_SCORE = 78;

const CHECKS = [
  { id: "grammar", label: "Grammar", count: 2 },
  { id: "spelling", label: "Spelling", count: 1 },
  { id: "phrasing", label: "Phrasing", count: 3 },
  { id: "tone", label: "Tone", count: 0 },
  { id: "length", label: "Length", count: 1 },
];

const VERSIONS = [
  {
    id: "v-master",
    name: "master_v3.pdf",
    date: "8 July 2026",
    size: "212 KB",
    use: "Master resume — used for most applications",
    primary: true,
  },
  {
    id: "v-frontend",
    name: "frontend_v2.pdf",
    date: "21 June 2026",
    size: "198 KB",
    use: "Frontend-focused variant for IC roles",
    primary: false,
  },
  {
    id: "v-summer",
    name: "summer2024.pdf",
    date: "3 September 2024",
    size: "176 KB",
    use: "Internship variant used for 2024 applications",
    primary: false,
  },
];

const SUGGESTIONS = [
  {
    id: "metrics",
    title: "Add metrics to your bullet points",
    detail:
      "Hiring managers scan for measurable outcomes. Try “Reduced onboarding time by 28%” instead of “Improved onboarding”.",
  },
  {
    id: "typescript",
    title: "Mention TypeScript fluency earlier",
    detail:
      "Your summary leads with React. Move TypeScript to the front so recruiters see it within the first two lines.",
  },
  {
    id: "northstar",
    title: "Quantify the Northstar Labs project",
    detail:
      "Reference the user count, release frequency, or accessibility score you helped move.",
  },
];

export function ResumeAssistant() {
  const { push } = useToast();
  const [coverLetterTarget, setCoverLetterTarget] = useState("");
  const [versions, setVersions] = useState(VERSIONS);
  const [suggestions, setSuggestions] = useState(SUGGESTIONS);

  // Read the demo candidate from the JSON dataset — same source as
  // the profile page and the dashboard.
  const candidate = getCandidate(1) ?? {
    id: 0,
    name: "Alex Morgan",
    initials: "AM",
    title: "Frontend Developer",
    location: "",
    email: "",
    phone: "",
    summary: "",
    profileCompletion: 0,
    verificationStatus: "Not started",
    skills: [],
    topSkills: [],
    experience: [],
    education: [],
    projects: [],
    evidence: [],
  };

  const makePrimary = (id: string, name: string) => {
    setVersions((current) =>
      current.map((version) => ({ ...version, primary: version.id === id }))
    );
    push({
      title: "Primary resume updated",
      description: `${name} will be used for future applications.`,
      tone: "success",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Resume
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              push({
                title: "Tailoring against your top matches…",
                tone: "info",
              })
            }
          >
            <Wand2 aria-hidden />
            Generate tailored resume
          </Button>
          <Button asChild variant="outline">
            <Link href="/candidate/resume/quality-checks">
              <AlertTriangle aria-hidden />
              Quality checks
            </Link>
          </Button>
          <Button
            onClick={() =>
              push({ title: "Resume upload started", tone: "info" })
            }
          >
            <Plus aria-hidden />
            Upload new resume
          </Button>
        </div>
      </div>

      {/* Two-column layout: preview + assistant */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Resume preview — 2 cols on its own */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <FileText aria-hidden className="h-4 w-4" />
                  Current resume
                </h2>
              </CardTitle>
              <CardDescription>
                master_v3.pdf · last updated 8 July 2026
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                aria-label="Edit resume"
                onClick={() =>
                  push({ title: "Resume editor opened", tone: "info" })
                }
              >
                <Pencil aria-hidden />
                Edit
              </Button>
              <Button
                size="sm"
                aria-label="Download resume"
                onClick={() =>
                  push({ title: "Resume download started", tone: "success" })
                }
              >
                <Download aria-hidden />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Page 1 */}
              <article
                aria-label="Resume page 1 preview"
                className="flex aspect-[8.5/11] flex-col gap-3 rounded-md border bg-background p-5"
              >
                <header className="space-y-1">
                  <p className="text-base font-semibold leading-tight">
                    {candidate.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {candidate.title} · {candidate.location}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {candidate.email} · {candidate.phone}
                  </p>
                </header>
                <Separator />
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Summary
                  </p>
                  <p className="text-xs">{candidate.summary}</p>
                </div>
                <Separator />
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Experience
                  </p>
                  {candidate.experience.map((exp) => (
                    <div key={exp.company} className="space-y-0.5">
                      <p className="text-xs font-semibold">
                        {exp.role} · {exp.company}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {exp.period}
                      </p>
                      <ul className="ml-3 list-disc space-y-0.5 text-[11px]">
                        <li>{exp.description}</li>
                        <li>
                          Partnered with design and product to ship features
                          used by 12,000+ learners.
                        </li>
                        <li>Cut page load time by 35% across top flows.</li>
                      </ul>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Skills
                  </p>
                  <p className="text-[11px]">
                    {candidate.skills.join(" · ")}
                  </p>
                </div>
              </article>

              {/* Page 2 */}
              <article
                aria-label="Resume page 2 preview"
                className="flex aspect-[8.5/11] flex-col gap-3 rounded-md border bg-background p-5"
              >
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Education
                  </p>
                  {candidate.education.map((edu) => (
                    <div key={edu.institution}>
                      <p className="text-xs font-semibold">
                        {edu.qualification}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {edu.institution} · {edu.period}
                      </p>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Projects
                  </p>
                  {candidate.projects.map((proj) => (
                    <div key={proj.name} className="space-y-0.5">
                      <p className="text-xs font-semibold">{proj.name}</p>
                      <p className="text-[11px]">{proj.description}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Stack: {proj.skills.join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Verified credentials
                  </p>
                  <ul className="ml-3 list-disc space-y-0.5 text-[11px]">
                    {candidate.evidence.map((e) => (
                      <li key={e.name}>
                        {e.name} ({e.status})
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </div>
          </CardContent>
        </Card>

        {/* AI assistant panel — 2 cols */}
        <div className="space-y-4 lg:col-span-2">
          {/* Score gauge */}
          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <Sparkles aria-hidden className="h-4 w-4" />
                  Resume score
                </h2>
              </CardTitle>
              <CardDescription>
                Based on clarity, keywords, and impact framing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-5">
                <div
                  aria-label={`Resume score ${RESUME_SCORE} out of 100`}
                  role="img"
                  className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-md border-8 border-muted"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-semibold tabular-nums leading-none">
                      {RESUME_SCORE}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      / 100
                    </span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium">Good — small wins ahead</p>
                  <p className="text-xs text-muted-foreground">
                    Quantify your impact and surface your top skills earlier
                    to push past 85.
                  </p>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-chart-1"
                      style={{ width: `${RESUME_SCORE}%` }}
                      aria-hidden
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checks */}
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Quality checks</h2>
              </CardTitle>
              <CardDescription>
                Tap a check to see suggested fixes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {CHECKS.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-md border bg-card p-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-muted"
                      aria-hidden
                    >
                      {c.count > 0 ? (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <p className="text-sm font-medium">{c.label}</p>
                  </div>
                  <Badge variant={c.count > 0 ? "outline" : "secondary"}>
                    {c.count === 0
                      ? "Clear"
                      : `${c.count} found`}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Cover letter generator */}
          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <Wand2 aria-hidden className="h-4 w-4" />
                  Generate cover letter
                </h2>
              </CardTitle>
              <CardDescription>
                Paste the role or company to draft a tailored letter.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="block space-y-1.5">
                <small className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Role or company
                </small>
                <Input
                  value={coverLetterTarget}
                  onChange={(event) => setCoverLetterTarget(event.target.value)}
                  placeholder="e.g. Senior Frontend Engineer at Northstar Labs"
                  aria-label="Role or company for cover letter"
                />
              </label>
              <Button
                className="w-full"
                onClick={() => {
                  push({
                    title: "Cover letter drafted",
                    description: coverLetterTarget.trim()
                      ? `Tailored for ${coverLetterTarget.trim()}.`
                      : "Add a role or company to refine the draft.",
                    tone: "success",
                  });
                }}
              >
                <Wand2 aria-hidden />
                Generate
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Resume versions */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2>Resume versions</h2>
            <p className="text-sm text-muted-foreground">
              Switch the version you use when applying.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/candidate/profile">
              Manage versions
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {versions.map((v) => (
            <Card key={v.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle>
                    <h3 className="flex items-center gap-2">
                      <FileText aria-hidden className="h-4 w-4" />
                      {v.name}
                    </h3>
                  </CardTitle>
                  {v.primary && <Badge variant="secondary">Primary</Badge>}
                </div>
                <CardDescription>
                  {v.date} · {v.size}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{v.use}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    aria-label={`Preview ${v.name}`}
                    onClick={() =>
                      push({
                        title: "Resume preview opened",
                        description: v.name,
                        tone: "info",
                      })
                    }
                  >
                    <Eye aria-hidden />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    aria-label={`Download ${v.name}`}
                    onClick={() =>
                      push({
                        title: "Resume download started",
                        description: v.name,
                        tone: "success",
                      })
                    }
                  >
                    <Download aria-hidden />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant={v.primary ? "secondary" : "outline"}
                    aria-pressed={v.primary}
                    onClick={() => makePrimary(v.id, v.name)}
                  >
                    <Check aria-hidden />
                    {v.primary ? "Primary resume" : "Use as primary"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tailored suggestions */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <Sparkles aria-hidden className="h-4 w-4" />
                Tailored suggestions
              </h2>
            </CardTitle>
            <CardDescription>
              Pattern-based tips drawn from resumes that land interviews.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="space-y-3">
              {suggestions.map((s, i) => (
                <li
                  key={s.id}
                  className="flex items-start gap-3 rounded-md border bg-card p-4"
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.detail}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      aria-label={`Apply suggestion: ${s.title}`}
                      onClick={() =>
                        push({
                          title: "Suggestion applied",
                          description: s.title,
                          tone: "success",
                        })
                      }
                    >
                      Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      aria-label={`Dismiss suggestion: ${s.title}`}
                      onClick={() => {
                        setSuggestions((current) =>
                          current.filter((suggestion) => suggestion.id !== s.id)
                        );
                        push({
                          title: "Suggestion dismissed",
                          description: s.title,
                          tone: "info",
                        });
                      }}
                    >
                      Dismiss
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}