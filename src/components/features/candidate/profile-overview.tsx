"use client";

import { useState } from "react";
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
  Loader2,
} from "lucide-react";

import { candidateProfile } from "@/data/candidate";
import { getProfileCompletion } from "@/lib/profile-completion";
import { EmptyState } from "@/components/common/empty-state";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { VERIFICATION_TONE } from "@/lib/status";

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
  status: VerificationStatus;
};

type ProfileFormState = {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  summary: string;
};

// State initializes from the shared fixture so every surface tells the same
// story. Demo only: edits live in local state and are never persisted.
const PROFILE_DEFAULT: ProfileFormState = {
  name: candidateProfile.name,
  title: candidateProfile.title,
  location: candidateProfile.location,
  email: candidateProfile.email,
  phone: candidateProfile.phone,
  summary: candidateProfile.summary,
};

const INITIAL_EXPERIENCE: Experience[] = candidateProfile.experience.map(
  (e, i) => ({ id: `exp-${i}`, ...e })
);
const INITIAL_EDUCATION: Education[] = candidateProfile.education.map(
  (e, i) => ({ id: `edu-${i}`, ...e })
);
const INITIAL_PROJECTS: Project[] = candidateProfile.projects.map((p, i) => ({
  id: `prj-${i}`,
  ...p,
}));
const INITIAL_EVIDENCE: Evidence[] = candidateProfile.evidence.map((e, i) => ({
  id: `ev-${i}`,
  ...e,
}));
const INITIAL_SKILLS: string[] = [...candidateProfile.skills];

function LabeledInput({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function LabeledTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="resize-none"
      />
    </div>
  );
}

/** A list item with real inline editing: Edit swaps the view for a draft
 *  form; Save commits to parent state, Cancel discards. New items mount in
 *  editing mode via `startEditing`. */
function EditableItem<T extends { id: string }>({
  item,
  startEditing = false,
  onSave,
  onDelete,
  label,
  renderView,
  renderForm,
}: {
  item: T;
  startEditing?: boolean;
  onSave: (draft: T) => void;
  onDelete: () => void;
  label: string;
  renderView: (item: T) => React.ReactNode;
  renderForm: (draft: T, setDraft: (d: T) => void) => React.ReactNode;
}) {
  const [editing, setEditing] = useState(startEditing);
  const [draft, setDraft] = useState<T>(item);

  const startEdit = () => {
    setDraft(item);
    setEditing(true);
  };
  const cancel = () => setEditing(false);
  const save = () => {
    onSave(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="rounded-lg border border-primary/30 bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {renderForm(draft, setDraft)}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={cancel}>
            <X aria-hidden />
            Cancel
          </Button>
          <Button size="sm" onClick={save}>
            <Check aria-hidden />
            Save
          </Button>
        </div>
      </div>
    );
  }

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
          onClick={startEdit}
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
      <div className="sm:pr-32">{renderView(item)}</div>
    </div>
  );
}

export function ProfileOverview() {
  const [profile, setProfile] = useState<ProfileFormState>(PROFILE_DEFAULT);
  const [editingProfile, setEditingProfile] = useState(false);
  const [draft, setDraft] = useState<ProfileFormState>(profile);
  const [skills, setSkills] = useState<string[]>(INITIAL_SKILLS);
  const [newSkill, setNewSkill] = useState("");
  const [experience, setExperience] = useState<Experience[]>(INITIAL_EXPERIENCE);
  const [education, setEducation] = useState<Education[]>(INITIAL_EDUCATION);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [evidence, setEvidence] = useState<Evidence[]>(INITIAL_EVIDENCE);
  /** Ids of evidence items going through the simulated verification flow. */
  const [verifyingIds, setVerifyingIds] = useState<string[]>([]);
  /** Ids of freshly added items — they mount in editing mode, once. */
  const [freshIds, setFreshIds] = useState<string[]>([]);

  const completion = getProfileCompletion({
    skills,
    experience,
    education,
    projects,
    evidence,
  });

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
    setFreshIds((f) => [...f, id]);
    setExperience((e) => [
      ...e,
      { id, company: "", role: "", period: "", description: "" },
    ]);
  };

  const addEducation = () => {
    const id = `edu-${Date.now()}`;
    setFreshIds((f) => [...f, id]);
    setEducation((e) => [
      ...e,
      { id, institution: "", qualification: "", period: "" },
    ]);
  };

  const addProject = () => {
    const id = `prj-${Date.now()}`;
    setFreshIds((f) => [...f, id]);
    setProjects((p) => [
      ...p,
      { id, name: "", description: "", skills: [] },
    ]);
  };

  const addEvidence = () => {
    const id = `ev-${Date.now()}`;
    setEvidence((ev) => [
      ...ev,
      { id, name: "New evidence item", type: "Other", status: "Not started" },
    ]);
  };

  // Demo only: simulates the institution verifying the credential — the item
  // flips to Pending with a spinner, then to Verified after a short delay.
  const requestVerification = (id: string) => {
    setEvidence((ev) =>
      ev.map((e) => (e.id === id ? { ...e, status: "Pending" } : e))
    );
    setVerifyingIds((ids) => [...ids, id]);
    window.setTimeout(() => {
      setEvidence((ev) =>
        ev.map((e) => (e.id === id ? { ...e, status: "Verified" } : e))
      );
      setVerifyingIds((ids) => ids.filter((x) => x !== id));
    }, 2500);
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
        <Badge variant="secondary">{completion.pct}% complete</Badge>
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
              <Pencil aria-hidden />
              Edit
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={cancelProfile}>
                <X aria-hidden />
                Cancel
              </Button>
              <Button size="sm" onClick={saveProfile}>
                <Check aria-hidden />
                Save
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {editingProfile ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <LabeledInput
                id="profile-name"
                label="Full name"
                value={draft.name}
                onChange={(v) => setDraft({ ...draft, name: v })}
              />
              <LabeledInput
                id="profile-title"
                label="Title"
                value={draft.title}
                onChange={(v) => setDraft({ ...draft, title: v })}
              />
              <LabeledInput
                id="profile-location"
                label="Location"
                value={draft.location}
                onChange={(v) => setDraft({ ...draft, location: v })}
              />
              <LabeledInput
                id="profile-email"
                label="Email"
                value={draft.email}
                onChange={(v) => setDraft({ ...draft, email: v })}
              />
              <LabeledInput
                id="profile-phone"
                label="Phone"
                value={draft.phone}
                onChange={(v) => setDraft({ ...draft, phone: v })}
              />
              <div className="sm:col-span-2">
                <LabeledTextarea
                  id="profile-summary"
                  label="Summary"
                  value={draft.summary}
                  onChange={(v) => setDraft({ ...draft, summary: v })}
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <small className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Name
                </small>
                <p className="mt-1 text-sm font-medium">{profile.name}</p>
              </div>
              <div>
                <small className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Title
                </small>
                <p className="mt-1 text-sm font-medium">{profile.title}</p>
              </div>
              <div>
                <small className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Location
                </small>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  {profile.location}
                </p>
              </div>
              <div>
                <small className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
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
                <small className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
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
                <Plus aria-hidden />
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
                      <Plus aria-hidden />
                      Add experience
                    </Button>
                  }
                />
              ) : (
                experience.map((item) => (
                  <EditableItem
                    key={item.id}
                    item={item}
                    startEditing={freshIds.includes(item.id)}
                    label={item.role || "New role"}
                    onSave={(d) => {
                      setExperience((e) =>
                        e.map((x) => (x.id === d.id ? d : x))
                      );
                      setFreshIds((f) => f.filter((x) => x !== d.id));
                    }}
                    onDelete={() =>
                      setExperience((e) => e.filter((x) => x.id !== item.id))
                    }
                    renderView={(x) => (
                      <>
                        <p className="text-sm font-semibold">{x.role}</p>
                        <p className="text-xs text-muted-foreground">
                          {x.company} · {x.period}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {x.description}
                        </p>
                      </>
                    )}
                    renderForm={(d, setD) => (
                      <>
                        <LabeledInput
                          id={`${d.id}-role`}
                          label="Role"
                          value={d.role}
                          onChange={(v) => setD({ ...d, role: v })}
                          placeholder="Frontend Developer Intern"
                        />
                        <LabeledInput
                          id={`${d.id}-company`}
                          label="Company"
                          value={d.company}
                          onChange={(v) => setD({ ...d, company: v })}
                          placeholder="Northstar Labs"
                        />
                        <LabeledInput
                          id={`${d.id}-period`}
                          label="Period"
                          value={d.period}
                          onChange={(v) => setD({ ...d, period: v })}
                          placeholder="Jan–Jun 2024"
                        />
                        <div className="sm:col-span-2">
                          <LabeledTextarea
                            id={`${d.id}-description`}
                            label="What you did"
                            value={d.description}
                            onChange={(v) => setD({ ...d, description: v })}
                            placeholder="Built reusable product interfaces…"
                            rows={2}
                          />
                        </div>
                      </>
                    )}
                  />
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
                <Plus aria-hidden />
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
                      <Plus aria-hidden />
                      Add education
                    </Button>
                  }
                />
              ) : (
                education.map((item) => (
                  <EditableItem
                    key={item.id}
                    item={item}
                    startEditing={freshIds.includes(item.id)}
                    label={item.qualification || "New qualification"}
                    onSave={(d) => {
                      setEducation((e) =>
                        e.map((x) => (x.id === d.id ? d : x))
                      );
                      setFreshIds((f) => f.filter((x) => x !== d.id));
                    }}
                    onDelete={() =>
                      setEducation((e) => e.filter((x) => x.id !== item.id))
                    }
                    renderView={(x) => (
                      <>
                        <p className="text-sm font-semibold">{x.qualification}</p>
                        <p className="text-xs text-muted-foreground">
                          {x.institution} · {x.period}
                        </p>
                      </>
                    )}
                    renderForm={(d, setD) => (
                      <>
                        <LabeledInput
                          id={`${d.id}-qualification`}
                          label="Qualification"
                          value={d.qualification}
                          onChange={(v) => setD({ ...d, qualification: v })}
                          placeholder="BSc Computer Science"
                        />
                        <LabeledInput
                          id={`${d.id}-institution`}
                          label="Institution"
                          value={d.institution}
                          onChange={(v) => setD({ ...d, institution: v })}
                          placeholder="University of Malaya"
                        />
                        <LabeledInput
                          id={`${d.id}-period`}
                          label="Period"
                          value={d.period}
                          onChange={(v) => setD({ ...d, period: v })}
                          placeholder="2020–2024"
                        />
                      </>
                    )}
                  />
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
                <Plus aria-hidden />
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
                      <Plus aria-hidden />
                      Add a project
                    </Button>
                  }
                />
              ) : (
                projects.map((item) => (
                  <EditableItem
                    key={item.id}
                    item={item}
                    startEditing={freshIds.includes(item.id)}
                    label={item.name || "New project"}
                    onSave={(d) => {
                      setProjects((p) =>
                        p.map((x) => (x.id === d.id ? d : x))
                      );
                      setFreshIds((f) => f.filter((x) => x !== d.id));
                    }}
                    onDelete={() =>
                      setProjects((p) => p.filter((x) => x.id !== item.id))
                    }
                    renderView={(x) => (
                      <>
                        <p className="text-sm font-semibold">{x.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {x.description}
                        </p>
                        {x.skills.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {x.skills.map((s) => (
                              <Badge key={s} variant="outline">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    renderForm={(d, setD) => (
                      <>
                        <LabeledInput
                          id={`${d.id}-name`}
                          label="Project name"
                          value={d.name}
                          onChange={(v) => setD({ ...d, name: v })}
                          placeholder="Community Skills Exchange"
                        />
                        <LabeledInput
                          id={`${d.id}-skills`}
                          label="Skills used (comma separated)"
                          value={d.skills.join(", ")}
                          onChange={(v) =>
                            setD({
                              ...d,
                              skills: v
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="Next.js, TypeScript"
                        />
                        <div className="sm:col-span-2">
                          <LabeledTextarea
                            id={`${d.id}-description`}
                            label="What is it?"
                            value={d.description}
                            onChange={(v) => setD({ ...d, description: v })}
                            placeholder="A responsive platform that connects mentors…"
                            rows={2}
                          />
                        </div>
                      </>
                    )}
                  />
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
                      <X className="h-3 w-3" aria-hidden />
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
                <label htmlFor="new-skill" className="sr-only">
                  Add a skill
                </label>
                <Input
                  id="new-skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Add a skill (e.g. TypeScript)"
                />
                <Button onClick={addSkill}>
                  <Plus aria-hidden />
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
                  Request verification for a credential — your institution
                  confirms it, usually within a day.
                </CardDescription>
              </div>
              <Button size="sm" onClick={addEvidence}>
                <Plus aria-hidden />
                Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {evidence.length === 0 ? (
                <EmptyState
                  icon={BadgeCheck}
                  title="No evidence added"
                  description="Issued credentials strengthen your match score."
                  action={
                    <Button size="sm" onClick={addEvidence}>
                      <Plus aria-hidden />
                      Add evidence
                    </Button>
                  }
                />
              ) : (
                evidence.map((item) => {
                  const tone = VERIFICATION_TONE[item.status];
                  const ToneIcon = tone.icon;
                  const verifying = verifyingIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className="group flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {verifying ? (
                          <Badge variant="warning" className="gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                            Verifying…
                          </Badge>
                        ) : (
                          <Badge
                            variant={tone.variant}
                            className={cn(
                              "gap-1",
                              item.status === "Not started" && "opacity-60"
                            )}
                          >
                            <ToneIcon className="h-3 w-3" aria-hidden />
                            {tone.label}
                          </Badge>
                        )}
                        {item.status === "Not started" && !verifying && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => requestVerification(item.id)}
                            aria-label={`Request verification for ${item.name}`}
                          >
                            Request verification
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                          aria-label={`Delete ${item.name}`}
                          onClick={() =>
                            setEvidence((ev) => ev.filter((x) => x.id !== item.id))
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
