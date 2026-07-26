"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ProfileBasicInfo } from "@/components/features/candidate/profile-basic-info";
import { ProfileEducationList } from "@/components/features/candidate/profile-education-list";
import { ProfileExperienceList } from "@/components/features/candidate/profile-experience-list";
import { ProfileProjectsList } from "@/components/features/candidate/profile-projects-list";
import { ProfileSkillsCard } from "@/components/features/candidate/profile-skills-card";
import {
  normalize,
} from "@/components/features/candidate/credential-derivations";
import {
  buildSkillLexicon,
  detectCandidateSkills,
} from "@/components/features/candidate/skill-parser";
import { get as getCandidate } from "@/data/candidates";
import { getForCandidate as getCredentialsForCandidate } from "@/data/credentials";
import { list as marketSignals } from "@/data/market-signals";
import { list as jobs } from "@/data/jobs";
import { onboardingStorageKey } from "@/lib/onboarding-store";
import type { Candidate, Skill } from "@/types/candidate";
import type { CandidateDraft } from "@/types/onboarding";

function isEmptyDraft(draft: CandidateDraft): boolean {
  return (
    draft.name === "" &&
    draft.email === "" &&
    draft.title === "" &&
    draft.location === "" &&
    draft.phone === "" &&
    draft.summary === "" &&
    draft.roleTypes.length === 0 &&
    draft.workModes.length === 0 &&
    draft.skills.length === 0 &&
    draft.projects.length === 0
  );
}

/**
 * Read the persisted onboarding draft once after mount. We deliberately
 * bypass the external-store hooks here so the profile component is purely
 * a consumer — the wizard owns all writes to the same key.
 */
function readPersistedDraft(): CandidateDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(onboardingStorageKey("candidate"));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      parsed.version !== 1 ||
      !parsed.draft
    ) {
      return null;
    }
    const draft = parsed.draft as CandidateDraft;
    if (isEmptyDraft(draft)) return null;
    return draft;
  } catch {
    return null;
  }
}

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
    skills: [],
    topSkills: [],
    experience: [],
    education: [],
    projects: [],
    onboardingComplete: false,
  };

  // University-issued credentials — immutable, never held in editable state.
  // Drives the deterministic skill parser's lexicon only; verification now
  // lives on each `Skill.status`, so no separate verified-skill projection.
  const credentials = getCredentialsForCandidate(DEMO_CANDIDATE_ID);

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
  const [skills, setSkills] = useState<Skill[]>(safeSeed.skills);
  const [dismissed, setDismissed] = useState<string[]>([]);

  // Apply the persisted onboarding draft once after mount. The wizard owns
  // writes to the same storage key; we only read so a tab can never get
  // its in-progress edits overwritten by a separate window. We defer the
  // state writes to a setTimeout so the initial hydration paint is stable
  // before the overlay merges in.
  const overlayAppliedRef = useRef(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (overlayAppliedRef.current) return;
      overlayAppliedRef.current = true;
      const persisted = readPersistedDraft();
      if (!persisted) return;
      setBasics((prev) => ({
        name: persisted.name || prev.name,
        title: persisted.title || prev.title,
        location: persisted.location || prev.location,
        email: persisted.email || prev.email,
        phone: persisted.phone || prev.phone,
        summary: persisted.summary || prev.summary,
      }));
      if (persisted.skills.length > 0) {
        setSkills((prev) => {
          const existing = new Set(prev.map((s) => normalize(s.name)));
          // Mint ids above the largest existing id so the hydrated entries
          // never collide with persisted records.
          let nextId = Math.max(0, ...prev.map((s) => s.id), 1000);
          const additions = persisted.skills
            .map((name) => name.trim())
            .filter((name) => name !== "")
            .filter((name) => !existing.has(normalize(name)))
            .map<Skill>((name) => ({
              id: ++nextId,
              name,
              status: "Not started",
            }));
          if (additions.length === 0) return prev;
          return [...prev, ...additions];
        });
      }
      if (persisted.projects.length > 0) {
        setProjects((prev) => {
          const next = [...prev];
          // Skip empty-name placeholders left behind by the wizard's
          // "Add project" button — they're never saved back to candidates
          // and would render as blank cards here.
          const valid = persisted.projects.filter(
            (project) => project.name.trim() !== "",
          );
          for (const project of valid) {
            const idx = next.findIndex((p) => p.name === project.name);
            const mapped = {
              id:
                idx >= 0
                  ? next[idx]!.id
                  : Math.max(0, ...next.map((p) => p.id), 1000) + 1,
              name: project.name,
              description: project.description,
              skills: project.skills,
              status: "Not started" as const,
            };
            if (idx >= 0) next[idx] = mapped;
            else next.push(mapped);
          }
          return next;
        });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Suggestions are derived (never stored) so editing prose updates them live.
  // The candidate's existing skills — verified or not — are excluded so we
  // never re-suggest something the candidate already has.
  const suggestions = useMemo(
    () =>
      detectCandidateSkills(
        { summary: basics.summary, experience, projects },
        lexicon,
        [...skills.map((s) => s.name), ...dismissed],
      ),
    [basics.summary, experience, projects, lexicon, skills, dismissed],
  );

  const acceptSkills = (incoming: string[]) => {
    setSkills((current) => {
      const existing = new Set(current.map((s) => normalize(s.name)));
      let nextId = Math.max(0, ...current.map((s) => s.id), 1000);
      const additions = incoming
        .map((name) => name.trim())
        .filter((name) => name !== "")
        .filter((name) => !existing.has(normalize(name)))
        .map<Skill>((name) => ({
          id: ++nextId,
          name,
          status: "Not started",
        }));
      return [...current, ...additions];
    });
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

      <div className="space-y-4">
        <ProfileSkillsCard
          skills={skills}
          suggestions={suggestions}
          onChange={setSkills}
          onAcceptSkills={acceptSkills}
          onDismissSuggestion={dismissSuggestion}
        />
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
      </div>
    </div>
  );
}
