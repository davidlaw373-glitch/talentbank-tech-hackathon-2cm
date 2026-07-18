/**
 * Single source of truth for profile completion. The dashboard, the profile
 * page, and any future surface all derive the same sections and percentage
 * from the same profile data — so the numbers can never disagree.
 */

export type ProfileCompletionInput = {
  skills: readonly unknown[];
  experience: readonly unknown[];
  education: readonly unknown[];
  projects: readonly unknown[];
  evidence: readonly { status: string }[];
};

export type ProfileSectionId =
  | "basics"
  | "skills"
  | "experience"
  | "education"
  | "projects"
  | "verification";

export type ProfileSection = {
  id: ProfileSectionId;
  label: string;
  hint: string;
  done: boolean;
};

export type ProfileCompletion = {
  sections: ProfileSection[];
  done: number;
  total: number;
  pct: number;
  /** First incomplete section — the recommended next action, if any. */
  next: ProfileSection | null;
};

export function getProfileCompletion(
  input: ProfileCompletionInput
): ProfileCompletion {
  const verifiedCount = input.evidence.filter(
    (e) => e.status === "Verified"
  ).length;

  // Demo: basic info is collected during onboarding, so it's always present.
  const sections: ProfileSection[] = [
    {
      id: "basics",
      label: "Basic info",
      hint: "Name, summary and contact details",
      done: true,
    },
    {
      id: "skills",
      label: "Skills",
      hint:
        input.skills.length > 0
          ? `${input.skills.length} skill${input.skills.length === 1 ? "" : "s"} added`
          : "Add your key skills",
      done: input.skills.length > 0,
    },
    {
      id: "experience",
      label: "Work experience",
      hint:
        input.experience.length > 0
          ? `${input.experience.length} role${input.experience.length === 1 ? "" : "s"} on file`
          : "Add a role to power matching",
      done: input.experience.length > 0,
    },
    {
      id: "education",
      label: "Education",
      hint:
        input.education.length > 0
          ? `${input.education.length} qualification${input.education.length === 1 ? "" : "s"} on file`
          : "Add a degree or program",
      done: input.education.length > 0,
    },
    {
      id: "projects",
      label: "Projects & portfolio",
      hint:
        input.projects.length > 0
          ? `${input.projects.length} project${input.projects.length === 1 ? "" : "s"} on file`
          : "Add a project to lift your match scores",
      done: input.projects.length > 0,
    },
    {
      id: "verification",
      label: "Verified credentials",
      hint:
        verifiedCount > 0
          ? `${verifiedCount} credential${verifiedCount === 1 ? "" : "s"} verified`
          : "Verify a credential to boost trust",
      done: verifiedCount > 0,
    },
  ];

  const done = sections.filter((s) => s.done).length;
  const total = sections.length;

  return {
    sections,
    done,
    total,
    pct: Math.round((done / total) * 100),
    next: sections.find((s) => !s.done) ?? null,
  };
}
