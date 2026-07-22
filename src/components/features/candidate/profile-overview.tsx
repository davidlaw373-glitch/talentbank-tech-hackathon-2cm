"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Sparkles,
  BadgeCheck,
  Check,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useCareerOSDemo } from "@/components/common/careeros-demo-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { selectCredentialProjection } from "@/lib/university-demo-state";
import type { AcademicVerificationStatus } from "@/types/university";

type VerificationStatus = "Verified" | "Pending" | "Not started";

type Experience = {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
};

type Education = {
  id: string;
  institution: string;
  qualification: string;
  period: string;
};

type Project = {
  id: string;
  name: string;
  description: string;
  skills: string[];
};

type Evidence = {
  id: string;
  name: string;
  type: string;
  status: VerificationStatus | AcademicVerificationStatus;
  issuer?: string;
  displayStatus?: string;
};

function canEditEvidenceStatus(evidence: Evidence) {
  return !evidence.issuer;
}

type ProfileFormState = {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  summary: string;
};

const PROFILE_DEFAULT: ProfileFormState = {
  name: "Alex Morgan",
  title: "Frontend Developer",
  location: "Kuala Lumpur, Malaysia",
  email: "alex.morgan@example.com",
  phone: "+60 12 345 6789",
  summary:
    "Product-minded frontend developer who enjoys turning complex workflows into accessible, dependable experiences.",
};

const INITIAL_EXPERIENCE: Experience[] = [
  {
    id: "exp-1",
    company: "Northstar Labs",
    role: "Frontend Developer Intern",
    period: "Jan–Jun 2024",
    description:
      "Built reusable product interfaces and improved core accessibility checks.",
  },
];

const INITIAL_EDUCATION: Education[] = [
  {
    id: "edu-1",
    institution: "University of Malaya",
    qualification: "BSc Computer Science",
    period: "2020–2024",
  },
];

const INITIAL_PROJECTS: Project[] = [];

const INITIAL_SKILLS: string[] = [
  "TypeScript",
  "React",
  "Next.js",
  "Accessibility",
  "Product discovery",
];

const INITIAL_EVIDENCE: Evidence[] = [
  {
    id: "ev-2",
    name: "Northstar Labs internship",
    type: "Experience",
    status: "Pending",
  },
  {
    id: "ev-3",
    name: "Project portfolio",
    type: "Portfolio",
    status: "Verified",
  },
];

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <small className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </small>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
    />
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 px-6 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

function EditableItem({
  onEdit,
  onDelete,
  children,
  label,
}: {
  onEdit: () => void;
  onDelete: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="group relative rounded-lg border bg-card p-4">
      <div
        role="group"
        aria-label={`Actions for ${label}`}
        className="mb-3 flex items-center justify-end gap-2 sm:absolute sm:right-3 sm:top-3 sm:mb-0 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
      >
        <Button
          size="sm"
          variant="outline"
          onClick={onEdit}
          className="h-8 gap-1.5 px-2 text-xs"
          aria-label={`Edit ${label}`}
        >
          <Pencil className="h-3 w-3" aria-hidden />
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onDelete}
          className="h-8 gap-1.5 px-2 text-xs text-destructive hover:bg-destructive/10"
          aria-label={`Remove ${label}`}
        >
          <Trash2 className="h-3 w-3" aria-hidden />
          Remove
        </Button>
      </div>
      <div className="sm:pr-32">{children}</div>
    </div>
  );
}

export function ProfileOverview() {
  const { state } = useCareerOSDemo();
  const [profile, setProfile] = useState<ProfileFormState>(PROFILE_DEFAULT);
  const [editingProfile, setEditingProfile] = useState(false);
  const [draft, setDraft] = useState<ProfileFormState>(profile);
  const [skills, setSkills] = useState<string[]>(INITIAL_SKILLS);
  const [newSkill, setNewSkill] = useState("");
  const [experience, setExperience] = useState<Experience[]>(INITIAL_EXPERIENCE);
  const [education, setEducation] = useState<Education[]>(INITIAL_EDUCATION);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [evidence, setEvidence] = useState<Evidence[]>(INITIAL_EVIDENCE);
  const credentialProjection = useMemo(
    () => selectCredentialProjection(state, "graduate-alex"),
    [state]
  );
  const displayedEvidence = useMemo<Evidence[]>(
    () => [
      ...(credentialProjection
        ? [
            {
              id: "university-alex-degree",
              name: credentialProjection.qualification,
              type: "Education",
              status: credentialProjection.verificationStatus,
              issuer: credentialProjection.institution,
              displayStatus:
                credentialProjection.trustLabel ??
                credentialProjection.verificationStatus,
            },
          ]
        : []),
      ...evidence,
    ],
    [credentialProjection, evidence]
  );

  const totalSections = 6;
  const done = useMemo(() => {
    let d = 2; // profile basics + skills always present
    if (experience.length > 0) d++;
    if (education.length > 0) d++;
    if (projects.length > 0) d++;
    if (displayedEvidence.some((item) => item.status === "Verified")) d++;
    return Math.min(d, totalSections);
  }, [displayedEvidence, education.length, experience.length, projects.length]);
  const pct = Math.round((done / totalSections) * 100);

  // Add handlers
  const addSkill = () => {
    const v = newSkill.trim();
    if (!v) return;
    if (skills.includes(v)) {
      setNewSkill("");
      return;
    }
    setSkills((s) => [...s, v]);
    setNewSkill("");
  };

  const addExperience = () => {
    const id = `exp-${Date.now()}`;
    setExperience((e) => [
      ...e,
      {
        id,
        company: "New company",
        role: "New role",
        period: "Year–Year",
        description: "Describe the work you did here.",
      },
    ]);
  };

  const addEducation = () => {
    const id = `edu-${Date.now()}`;
    setEducation((e) => [
      ...e,
      {
        id,
        institution: "New institution",
        qualification: "Degree or program",
        period: "Year–Year",
      },
    ]);
  };

  const addProject = () => {
    const id = `prj-${Date.now()}`;
    setProjects((p) => [
      ...p,
      {
        id,
        name: "New project",
        description: "What is it and what did you build?",
        skills: [],
      },
    ]);
  };

  const addEvidence = () => {
    const id = `ev-${Date.now()}`;
    setEvidence((ev) => [
      ...ev,
      { id, name: "New evidence item", type: "Other", status: "Not started" },
    ]);
  };

  const toggleEvidenceStatus = (id: string) => {
    setEvidence((ev) =>
      ev.map((e) => {
        if (e.id !== id) return e;
        if (!canEditEvidenceStatus(e)) return e;

        return {
          ...e,
          status:
            e.status === "Not started"
              ? "Pending"
              : e.status === "Pending"
                ? "Verified"
                : "Not started",
        };
      })
    );
  };

  const saveProfile = () => {
    setProfile(draft);
    setEditingProfile(false);
  };

  const cancelProfile = () => {
    setDraft(profile);
    setEditingProfile(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Candidate profile
          </p>
          <h1>Your profile</h1>
          <p className="text-muted-foreground">
            Keep your career story accurate so employers can understand your
            capabilities and evidence.
          </p>
        </div>
        <Badge variant="secondary">{pct}% complete</Badge>
      </header>

      {/* Profile card */}
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>
              <h2>Basic info</h2>
            </CardTitle>
            <CardDescription>
              Name, title, location, contact details, and summary.
            </CardDescription>
          </div>
          {!editingProfile ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDraft(profile);
                setEditingProfile(true);
              }}
            >
              <Pencil />
              Edit
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={cancelProfile}>
                <X />
                Cancel
              </Button>
              <Button size="sm" onClick={saveProfile}>
                <Check />
                Save
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {editingProfile ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldRow label="Full name">
                <Input
                  value={draft.name}
                  onChange={(v) => setDraft({ ...draft, name: v })}
                />
              </FieldRow>
              <FieldRow label="Title">
                <Input
                  value={draft.title}
                  onChange={(v) => setDraft({ ...draft, title: v })}
                />
              </FieldRow>
              <FieldRow label="Location">
                <Input
                  value={draft.location}
                  onChange={(v) => setDraft({ ...draft, location: v })}
                />
              </FieldRow>
              <FieldRow label="Email">
                <Input
                  value={draft.email}
                  onChange={(v) => setDraft({ ...draft, email: v })}
                />
              </FieldRow>
              <FieldRow label="Phone">
                <Input
                  value={draft.phone}
                  onChange={(v) => setDraft({ ...draft, phone: v })}
                />
              </FieldRow>
              <div className="sm:col-span-2">
                <FieldRow label="Summary">
                  <Textarea
                    value={draft.summary}
                    onChange={(v) => setDraft({ ...draft, summary: v })}
                    rows={3}
                  />
                </FieldRow>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <small className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Name
                </small>
                <p className="mt-1 text-sm font-medium">{profile.name}</p>
              </div>
              <div>
                <small className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Title
                </small>
                <p className="mt-1 text-sm font-medium">{profile.title}</p>
              </div>
              <div>
                <small className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Location
                </small>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  {profile.location}
                </p>
              </div>
              <div>
                <small className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Contact
                </small>
                <p className="mt-1 flex items-center gap-1.5 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  {profile.email}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  {profile.phone}
                </p>
              </div>
              <div className="sm:col-span-2">
                <small className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Summary
                </small>
                <p className="mt-1 text-sm">{profile.summary}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="career" className="space-y-4">
        <TabsList>
          <TabsTrigger value="career">Career story</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        {/* Career story */}
        <TabsContent value="career" className="space-y-4">
          {/* Experience */}
          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>
                  <h2>Experience</h2>
                </CardTitle>
                <CardDescription>
                  Roles you have held, internships included.
                </CardDescription>
              </div>
              <Button size="sm" onClick={addExperience}>
                <Plus />
                Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {experience.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No experience added"
                  description="Add a role to power matching for relevant jobs."
                  action={
                    <Button size="sm" onClick={addExperience}>
                      <Plus />
                      Add experience
                    </Button>
                  }
                />
              ) : (
                experience.map((item) => (
                  <EditableItem
                    key={item.id}
                    label={`${item.role} at ${item.company}`}
                    onEdit={() => {
                      /* prototype: stay read-only in this build */
                    }}
                    onDelete={() =>
                      setExperience((e) => e.filter((x) => x.id !== item.id))
                    }
                  >
                    <p className="text-sm font-semibold">{item.role}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.company} · {item.period}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </EditableItem>
                ))
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>
                  <h2>Education</h2>
                </CardTitle>
                <CardDescription>
                  Degrees, programs, or relevant coursework.
                </CardDescription>
              </div>
              <Button size="sm" onClick={addEducation}>
                <Plus />
                Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {education.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No education added"
                  description="Degrees unlock higher match scores."
                  action={
                    <Button size="sm" onClick={addEducation}>
                      <Plus />
                      Add education
                    </Button>
                  }
                />
              ) : (
                education.map((item) => (
                  <EditableItem
                    key={item.id}
                    label={`${item.qualification} at ${item.institution}`}
                    onEdit={() => {
                      /* prototype */
                    }}
                    onDelete={() =>
                      setEducation((e) => e.filter((x) => x.id !== item.id))
                    }
                  >
                    <p className="text-sm font-semibold">{item.qualification}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.institution} · {item.period}
                    </p>
                  </EditableItem>
                ))
              )}
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>
                  <h2>Projects</h2>
                </CardTitle>
                <CardDescription>
                  Side projects, capstone work, open-source contributions.
                </CardDescription>
              </div>
              <Button size="sm" onClick={addProject}>
                <Plus />
                Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {projects.length === 0 ? (
                <EmptyState
                  icon={Sparkles}
                  title="No projects yet"
                  description="Portfolios boost match scores by ~12%."
                  action={
                    <Button size="sm" onClick={addProject}>
                      <Plus />
                      Add a project
                    </Button>
                  }
                />
              ) : (
                projects.map((item) => (
                  <EditableItem
                    key={item.id}
                    label={item.name}
                    onEdit={() => {
                      /* prototype */
                    }}
                    onDelete={() =>
                      setProjects((p) => p.filter((x) => x.id !== item.id))
                    }
                  >
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    {item.skills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.skills.map((s) => (
                          <Badge key={s} variant="outline">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </EditableItem>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills */}
        <TabsContent value="skills">
          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>
                  <h2>Skills and capabilities</h2>
                </CardTitle>
                <CardDescription>
                  Used to inform your match scores on every job.
                </CardDescription>
              </div>
              <Badge variant="secondary">{skills.length} listed</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() =>
                        setSkills((s) => s.filter((x) => x !== skill))
                      }
                      aria-label={`Remove ${skill}`}
                      className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-foreground/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {skills.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No skills yet — add one below.
                  </p>
                )}
              </div>

              {/* Add skill form */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Add a skill (e.g. TypeScript)"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <Button onClick={addSkill}>
                  <Plus />
                  Add skill
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification */}
        <TabsContent value="verification">
          <Card id="verification">
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>
                  <h2>Verification and supporting evidence</h2>
                </CardTitle>
                <CardDescription>
                  Evidence you add can move from Not started → Pending →
                  Verified. Credentials managed by an issuer are read-only.
                </CardDescription>
              </div>
              <Button size="sm" onClick={addEvidence}>
                <Plus />
                Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {displayedEvidence.length === 0 ? (
                <EmptyState
                  icon={BadgeCheck}
                  title="No evidence added"
                  description="Issued credentials strengthen your match score."
                  action={
                    <Button size="sm" onClick={addEvidence}>
                      <Plus />
                      Add evidence
                    </Button>
                  }
                />
              ) : (
                displayedEvidence.map((item) => (
                  <div
                    key={item.id}
                    className="group flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.issuer ? `${item.type} \u00B7 ${item.issuer}` : item.type}
                      </p>
                    </div>
                    {canEditEvidenceStatus(item) ? (
                      <button
                        type="button"
                        onClick={() => toggleEvidenceStatus(item.id)}
                        aria-label={`Status: ${item.status}. Click to change.`}
                        className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <Badge
                          variant={
                            item.status === "Verified"
                              ? "secondary"
                              : item.status === "Pending"
                                ? "outline"
                                : "outline"
                          }
                          className={cn(
                            "cursor-pointer",
                            item.status === "Not started" && "opacity-60"
                          )}
                        >
                          {item.status}
                        </Badge>
                      </button>
                    ) : (
                      <div className="text-right">
                        <Badge
                          variant={
                            item.status === "Rejected"
                              ? "destructive"
                              : item.status === "Verified"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {item.displayStatus ?? item.status}
                        </Badge>
                        {item.issuer && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Managed by {item.issuer}
                          </p>
                        )}
                      </div>
                    )}
                    {canEditEvidenceStatus(item) && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Delete evidence"
                        onClick={() =>
                          setEvidence((ev) =>
                            ev.filter((x) => x.id !== item.id)
                          )
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
