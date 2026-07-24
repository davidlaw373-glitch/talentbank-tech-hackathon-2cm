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
import { get as getCandidate } from "@/data/candidates";
import type { Candidate } from "@/types/candidate";

const TOTAL_SECTIONS = 6;

export function ProfileOverview() {
  // Read the demo candidate at module load. When auth lands, this becomes
  // an async loader keyed on the signed-in user id.
  const safeSeed: Candidate = getCandidate(1) ?? {
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

  const [basics, setBasics] = useState(() => ({
    name: safeSeed.name,
    title: safeSeed.title,
    location: safeSeed.location,
    email: safeSeed.email,
    phone: safeSeed.phone,
    summary: safeSeed.summary,
  }));
  const [experience, setExperience] = useState(safeSeed.experience);
  const [education, setEducation] = useState(safeSeed.education);
  const [projects, setProjects] = useState(safeSeed.projects);
  const [skills, setSkills] = useState<string[]>(safeSeed.skills);
  const [evidence, setEvidence] = useState(safeSeed.evidence);

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
          <h1 className="text-display">Your profile</h1>
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
