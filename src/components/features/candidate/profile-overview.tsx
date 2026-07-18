"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ProfileBasicInfo } from "@/components/features/candidate/profile-basic-info";
import { ProfileEducationList } from "@/components/features/candidate/profile-education-list";
import { ProfileExperienceList } from "@/components/features/candidate/profile-experience-list";
import { ProfileProjectsList } from "@/components/features/candidate/profile-projects-list";
import { ProfileSkillsCard } from "@/components/features/candidate/profile-skills-card";
import { ProfileVerificationCard } from "@/components/features/candidate/profile-verification-card";
import type {
  Education,
  Evidence,
  Experience,
  ProfileBasics,
  Project,
} from "@/types/profile";

const PROFILE_DEFAULT: ProfileBasics = {
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

const TOTAL_SECTIONS = 6;

export function ProfileOverview() {
  const [basics, setBasics] = useState<ProfileBasics>(PROFILE_DEFAULT);
  const [experience, setExperience] =
    useState<Experience[]>(INITIAL_EXPERIENCE);
  const [education, setEducation] =
    useState<Education[]>(INITIAL_EDUCATION);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [skills, setSkills] = useState<string[]>(INITIAL_SKILLS);
  const [evidence, setEvidence] = useState<Evidence[]>(INITIAL_EVIDENCE);

  const pct = useMemo(() => {
    let done = 2; // basics + skills are always present at load
    if (experience.length > 0) done += 1;
    if (education.length > 0) done += 1;
    if (projects.length > 0) done += 1;
    if (evidence.some((e) => e.status === "Verified")) done += 1;
    return Math.round((Math.min(done, TOTAL_SECTIONS) / TOTAL_SECTIONS) * 100);
  }, [experience.length, education.length, projects.length, evidence]);

  return (
    <div className="space-y-6">
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

      <ProfileBasicInfo value={basics} onSave={setBasics} />

      <Tabs defaultValue="career" className="space-y-4">
        <TabsList>
          <TabsTrigger value="career">Career story</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="career" className="space-y-4">
          <ProfileExperienceList items={experience} onChange={setExperience} />
          <ProfileEducationList items={education} onChange={setEducation} />
          <ProfileProjectsList items={projects} onChange={setProjects} />
        </TabsContent>

        <TabsContent value="skills">
          <ProfileSkillsCard skills={skills} onChange={setSkills} />
        </TabsContent>

        <TabsContent value="verification">
          <ProfileVerificationCard items={evidence} onChange={setEvidence} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
