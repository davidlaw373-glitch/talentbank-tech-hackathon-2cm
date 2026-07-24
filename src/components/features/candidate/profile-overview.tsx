"use client";

import { useMemo, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ProfileBasicInfo } from "@/components/features/candidate/profile-basic-info";
import { ProfileEducationList } from "@/components/features/candidate/profile-education-list";
import { ProfileExperienceList } from "@/components/features/candidate/profile-experience-list";
import { ProfileProjectsList } from "@/components/features/candidate/profile-projects-list";
import { ProfileSkillsCard } from "@/components/features/candidate/profile-skills-card";
import { ProfileVerificationCard } from "@/components/features/candidate/profile-verification-card";
import {
  dedupe,
  getVerifiedSkillSet,
  normalize,
  toCredentialView,
} from "@/components/features/candidate/credential-derivations";
import {
  buildSkillLexicon,
  detectCandidateSkills,
} from "@/components/features/candidate/skill-parser";
import { get as getCandidate } from "@/data/candidates";
import { getForCandidate as getCredentialsForCandidate } from "@/data/credentials";
import { get as getUniversity } from "@/data/universities";
import { list as marketSignals } from "@/data/market-signals";
import { list as jobs } from "@/data/jobs";
import type { Candidate } from "@/types/candidate";

const DEMO_CANDIDATE_ID = 1;

export function ProfileOverview() {
  // Read the demo candidate at module load. When auth lands, this becomes
  // an async loader keyed on the signed-in user id.
  const safeSeed: Candidate = getCandidate(DEMO_CANDIDATE_ID) ?? {
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

  // University-issued credentials — immutable, never held in editable state.
  const credentials = getCredentialsForCandidate(DEMO_CANDIDATE_ID);
  const credentialViews = useMemo(
    () =>
      credentials.map((credential) =>
        toCredentialView(credential, getUniversity(credential.universityId)),
      ),
    [credentials],
  );
  const verifiedSkills = useMemo(
    () => getVerifiedSkillSet(credentials),
    [credentials],
  );

  // Data-driven skill lexicon powering the deterministic parser.
  const lexicon = useMemo(
    () => buildSkillLexicon({ credentials, marketSignals, jobs }),
    [credentials],
  );

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
  const [dismissed, setDismissed] = useState<string[]>([]);

  // Suggestions are derived (never stored) so editing prose updates them live.
  const suggestions = useMemo(
    () =>
      detectCandidateSkills(
        { summary: basics.summary, experience, projects },
        lexicon,
        [...skills, ...verifiedSkills, ...dismissed],
      ),
    [basics.summary, experience, projects, lexicon, skills, verifiedSkills, dismissed],
  );

  const acceptSkills = (incoming: string[]) => {
    setSkills((current) => dedupe([...current, ...incoming]));
  };
  const dismissSuggestion = (skill: string) => {
    setDismissed((current) =>
      current.some((s) => normalize(s) === normalize(skill))
        ? current
        : [...current, skill],
    );
  };

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
          <ProfileExperienceList
            items={experience}
            onChange={setExperience}
            lexicon={lexicon}
            onAcceptSkills={acceptSkills}
          />
          <ProfileEducationList items={education} onChange={setEducation} />
          <ProfileProjectsList
            items={projects}
            onChange={setProjects}
            lexicon={lexicon}
          />
        </TabsContent>

        <TabsContent value="skills">
          <ProfileSkillsCard
            skills={skills}
            verifiedSkills={verifiedSkills}
            suggestions={suggestions}
            onChange={setSkills}
            onAcceptSkills={acceptSkills}
            onDismissSuggestion={dismissSuggestion}
          />
        </TabsContent>

        <TabsContent value="verification">
          <ProfileVerificationCard
            credentials={credentialViews}
            items={evidence}
            onChange={setEvidence}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
