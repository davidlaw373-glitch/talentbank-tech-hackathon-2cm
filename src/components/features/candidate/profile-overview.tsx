"use client";

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ProfileBasicInfo } from "@/components/features/candidate/profile-basic-info";
import { ProfileEducationList } from "@/components/features/candidate/profile-education-list";
import { ProfileExperienceList } from "@/components/features/candidate/profile-experience-list";
import { ProfileProjectsList } from "@/components/features/candidate/profile-projects-list";
import { ProfileSkillsCard } from "@/components/features/candidate/profile-skills-card";
import { ProfileVerificationCard } from "@/components/features/candidate/profile-verification-card";
import { get as getCandidate } from "@/data/candidates";
import type { Candidate } from "@/types/candidate";

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

  return (
    <div className="space-y-6">
      <ProfileBasicInfo value={basics} onSave={setBasics} />

      <Tabs defaultValue="career" className="space-y-4">
        <TabsList>
          <TabsTrigger
            value="career"
            className="cursor-pointer text-muted-foreground transition-colors hover:bg-accent-soft hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            Career story
          </TabsTrigger>
          <TabsTrigger
            value="skills"
            className="cursor-pointer text-muted-foreground transition-colors hover:bg-accent-soft hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            Skills
          </TabsTrigger>
          <TabsTrigger
            value="verification"
            className="cursor-pointer text-muted-foreground transition-colors hover:bg-accent-soft hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            Verification
          </TabsTrigger>
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
