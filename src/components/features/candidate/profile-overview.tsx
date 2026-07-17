"use client";

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

import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/common/toast";
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
    id: "ev-1",
    name: "Computer Science degree",
    type: "Education",
    status: "Verified",
  },
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
  const { push } = useToast();
  const [profile, setProfile] = useState<ProfileFormState>(PROFILE_DEFAULT);
  const [editingProfile, setEditingProfile] = useState(false);
  const [draft, setDraft] = useState<ProfileFormState>(profile);
  const [skills, setSkills] = useState<string[]>(INITIAL_SKILLS);
  const [newSkill, setNewSkill] = useState("");
  const [experience, setExperience] = useState<Experience[]>(INITIAL_EXPERIENCE);
  const [education, setEducation] = useState<Education[]>(INITIAL_EDUCATION);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [evidence, setEvidence] = useState<Evidence[]>(INITIAL_EVIDENCE);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [experienceDraft, setExperienceDraft] = useState<Experience | null>(null);
  const [educationDraft, setEducationDraft] = useState<Education | null>(null);
  const [projectDraft, setProjectDraft] = useState<Project | null>(null);

  const totalSections = 6;
  const done = useMemo(() => {
    let d = 2; // profile basics + skills always present
    if (experience.length > 0) d++;
    if (education.length > 0) d++;
    if (projects.length > 0) d++;
    if (evidence.some((e) => e.status === "Verified")) d++;
    return Math.min(d, totalSections);
  }, [experience.length, education.length, projects.length, evidence]);
  const pct = Math.round((done / totalSections) * 100);

  // Add handlers
  const addSkill = () => {
    const v = newSkill.trim();
    if (!v) return;
    if (skills.includes(v)) {
      setNewSkill("");
      push({
        title: "Already in your list",
        description: `${v} is already on your skills.`,
        tone: "info",
      });
      return;
    }
    setSkills((s) => [...s, v]);
    setNewSkill("");
    push({
      title: "Skill added",
      description: v,
      tone: "success",
    });
  };

  const removeSkill = (skill: string) => {
    setSkills((s) => s.filter((x) => x !== skill));
    push({
      title: "Skill removed",
      description: skill,
      tone: "info",
    });
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
    push({ title: "Add experience form opened", tone: "info" });
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
    push({ title: "Add education form opened", tone: "info" });
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
    push({ title: "Add project form opened", tone: "info" });
  };

  const addEvidence = () => {
    const id = `ev-${Date.now()}`;
    setEvidence((ev) => [
      ...ev,
      { id, name: "New evidence item", type: "Other", status: "Not started" },
    ]);
    push({ title: "Add evidence form opened", tone: "info" });
  };

  const toggleEvidenceStatus = (id: string) => {
    setEvidence((ev) =>
      ev.map((e) =>
        e.id === id
          ? {
              ...e,
              status:
                e.status === "Not started"
                  ? "Pending"
                  : e.status === "Pending"
                    ? "Verified"
                    : "Not started",
            }
          : e
      )
    );
  };

  const saveProfile = () => {
    setProfile(draft);
    setEditingProfile(false);
    push({ title: "Basic info saved", tone: "success" });
  };

  const cancelProfile = () => {
    setDraft(profile);
    setEditingProfile(false);
  };

  const beginEditExperience = (item: Experience) => {
    setExperienceDraft({ ...item });
    setEditingExperienceId(item.id);
  };

  const saveExperience = () => {
    if (!experienceDraft) return;
    setExperience((list) =>
      list.map((item) =>
        item.id === experienceDraft.id ? experienceDraft : item
      )
    );
    setEditingExperienceId(null);
    setExperienceDraft(null);
    push({ title: "Experience updated", tone: "success" });
  };

  const cancelExperience = () => {
    setEditingExperienceId(null);
    setExperienceDraft(null);
  };

  const beginEditEducation = (item: Education) => {
    setEducationDraft({ ...item });
    setEditingEducationId(item.id);
  };

  const saveEducation = () => {
    if (!educationDraft) return;
    setEducation((list) =>
      list.map((item) =>
        item.id === educationDraft.id ? educationDraft : item
      )
    );
    setEditingEducationId(null);
    setEducationDraft(null);
    push({ title: "Education updated", tone: "success" });
  };

  const cancelEducation = () => {
    setEditingEducationId(null);
    setEducationDraft(null);
  };

  const beginEditProject = (item: Project) => {
    setProjectDraft({ ...item });
    setEditingProjectId(item.id);
  };

  const saveProject = () => {
    if (!projectDraft) return;
    setProjects((list) =>
      list.map((item) => (item.id === projectDraft.id ? projectDraft : item))
    );
    setEditingProjectId(null);
    setProjectDraft(null);
    push({ title: "Project updated", tone: "success" });
  };

  const cancelProject = () => {
    setEditingProjectId(null);
    setProjectDraft(null);
  };

  const requestVerification = (item: Evidence) => {
    push({
      title: "Verification requested",
      description: item.name,
      tone: "info",
    });
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
              aria-label="Edit basic info"
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
                experience.map((item) =>
                  editingExperienceId === item.id && experienceDraft ? (
                    <div
                      key={item.id}
                      className="space-y-3 rounded-lg border bg-card p-4"
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <FieldRow label="Role">
                          <Input
                            value={experienceDraft.role}
                            onChange={(value) =>
                              setExperienceDraft({
                                ...experienceDraft,
                                role: value,
                              })
                            }
                          />
                        </FieldRow>
                        <FieldRow label="Company">
                          <Input
                            value={experienceDraft.company}
                            onChange={(value) =>
                              setExperienceDraft({
                                ...experienceDraft,
                                company: value,
                              })
                            }
                          />
                        </FieldRow>
                        <FieldRow label="Period">
                          <Input
                            value={experienceDraft.period}
                            onChange={(value) =>
                              setExperienceDraft({
                                ...experienceDraft,
                                period: value,
                              })
                            }
                          />
                        </FieldRow>
                      </div>
                      <FieldRow label="Description">
                        <Textarea
                          value={experienceDraft.description}
                          onChange={(value) =>
                            setExperienceDraft({
                              ...experienceDraft,
                              description: value,
                            })
                          }
                          rows={3}
                        />
                      </FieldRow>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" onClick={saveExperience}>
                          <Check />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelExperience}
                        >
                          <X />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <EditableItem
                      key={item.id}
                      label={`${item.role} at ${item.company}`}
                      onEdit={() => beginEditExperience(item)}
                      onDelete={() =>
                        setExperience((list) =>
                          list.filter((x) => x.id !== item.id)
                        )
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
                  )
                )
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
                education.map((item) =>
                  editingEducationId === item.id && educationDraft ? (
                    <div
                      key={item.id}
                      className="space-y-3 rounded-lg border bg-card p-4"
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <FieldRow label="Qualification">
                          <Input
                            value={educationDraft.qualification}
                            onChange={(value) =>
                              setEducationDraft({
                                ...educationDraft,
                                qualification: value,
                              })
                            }
                          />
                        </FieldRow>
                        <FieldRow label="Institution">
                          <Input
                            value={educationDraft.institution}
                            onChange={(value) =>
                              setEducationDraft({
                                ...educationDraft,
                                institution: value,
                              })
                            }
                          />
                        </FieldRow>
                        <FieldRow label="Period">
                          <Input
                            value={educationDraft.period}
                            onChange={(value) =>
                              setEducationDraft({
                                ...educationDraft,
                                period: value,
                              })
                            }
                          />
                        </FieldRow>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" onClick={saveEducation}>
                          <Check />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEducation}
                        >
                          <X />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <EditableItem
                      key={item.id}
                      label={`${item.qualification} at ${item.institution}`}
                      onEdit={() => beginEditEducation(item)}
                      onDelete={() =>
                        setEducation((list) =>
                          list.filter((x) => x.id !== item.id)
                        )
                      }
                    >
                      <p className="text-sm font-semibold">{item.qualification}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.institution} · {item.period}
                      </p>
                    </EditableItem>
                  )
                )
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
                projects.map((item) =>
                  editingProjectId === item.id && projectDraft ? (
                    <div
                      key={item.id}
                      className="space-y-3 rounded-lg border bg-card p-4"
                    >
                      <FieldRow label="Project name">
                        <Input
                          value={projectDraft.name}
                          onChange={(value) =>
                            setProjectDraft({ ...projectDraft, name: value })
                          }
                        />
                      </FieldRow>
                      <FieldRow label="Description">
                        <Textarea
                          value={projectDraft.description}
                          onChange={(value) =>
                            setProjectDraft({
                              ...projectDraft,
                              description: value,
                            })
                          }
                          rows={3}
                        />
                      </FieldRow>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" onClick={saveProject}>
                          <Check />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelProject}
                        >
                          <X />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <EditableItem
                      key={item.id}
                      label={item.name}
                      onEdit={() => beginEditProject(item)}
                      onDelete={() =>
                        setProjects((list) =>
                          list.filter((x) => x.id !== item.id)
                        )
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
                  )
                )
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
                      onClick={() => removeSkill(skill)}
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
                  Click a status badge to cycle through Not started → Pending
                  → Verified.
                </CardDescription>
              </div>
              <Button size="sm" onClick={addEvidence}>
                <Plus />
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
                      <Plus />
                      Add evidence
                    </Button>
                  }
                />
              ) : (
                evidence.map((item) => (
                  <div
                    key={item.id}
                    className="group flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.type}</p>
                    </div>
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => requestVerification(item)}
                    >
                      Request verification
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Delete evidence"
                      onClick={() =>
                        setEvidence((ev) => ev.filter((x) => x.id !== item.id))
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
