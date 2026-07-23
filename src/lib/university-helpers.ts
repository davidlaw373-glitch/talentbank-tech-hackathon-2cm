/**
 * Denormalized views on top of the new accessors, used by the university
 * pages. Each shape here matches what `src/data/university.ts` (the
 * back-compat shim) used to export, so migrating a page is a one-line
 * import swap. Unlike the shim, this module is the long-term home —
 * once the shim is deleted these helpers stay.
 */

import type {
  LegacyEmploymentRecord,
  LegacyGraduateRecord,
  LegacySkillDemand,
  LegacyUniversityDispute,
  VerificationRecordStatus,
} from "@/types/university";
import type { Credential, EmploymentOutcome } from "@/types/credential";

import { get as getUniversity } from "@/data/universities";
import { getForUniversity as getCredentialsForUniversity } from "@/data/credentials";
import { getForUniversity as getDisputesForUniversity } from "@/data/disputes";
import { getForUniversity as getCohortOutcomesForUniversity } from "@/data/cohort-outcomes";
import { list as marketSignalList } from "@/data/market-signals";
import { get as getEmployer } from "@/data/employers";
import { get as getCandidate } from "@/data/candidates";

import type { University } from "@/types/university";

const DEMO_UNIVERSITY_ID = 1;

export function getUniversityProfile(id: number = DEMO_UNIVERSITY_ID): University {
  const u = getUniversity(id);
  if (!u) {
    throw new Error(`University ${id} missing from universities.json`);
  }
  return u;
}

export const universityProfile: University = getUniversityProfile();

function initialsFromName(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  return (
    (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")
  ).toUpperCase();
}

function parseNameAndProgram(credentialName: string): {
  name: string;
  program: string;
} {
  // Non-candidate credentials have names like "Priya Ramasamy · BSc Software Engineering".
  const [namePart, programPart] = credentialName
    .split("·")
    .map((s) => s.trim());
  return { name: namePart ?? credentialName, program: programPart ?? "" };
}

function mapCredentialStatusToVerification(
  status: Credential["status"],
): VerificationRecordStatus {
  switch (status) {
    case "Verified":
      return "Verified";
    case "Pending":
      return "Pending review";
    case "Not started":
      return "Action required";
  }
}

export function getGraduateRecords(
  universityId: number = DEMO_UNIVERSITY_ID,
): LegacyGraduateRecord[] {
  const credentials = getCredentialsForUniversity(universityId);
  const result: LegacyGraduateRecord[] = [];

  for (const cred of credentials) {
    let name: string;
    let initials: string;
    let program: string;
    if (cred.candidateId !== null) {
      const candidate = getCandidate(cred.candidateId);
      if (!candidate) continue;
      name = candidate.name;
      initials = candidate.initials;
      program = cred.name;
    } else {
      const parsed = parseNameAndProgram(cred.name);
      name = parsed.name;
      initials = initialsFromName(parsed.name);
      program = parsed.program;
    }

    const company = cred.employerId
      ? getEmployer(cred.employerId)?.companyName
      : undefined;

    result.push({
      id: cred.id,
      name,
      initials,
      program,
      graduationYear: cred.graduationYear ?? 0,
      gpa: cred.gpa ?? "",
      status: mapCredentialStatusToVerification(cred.status),
      skills: cred.skills,
      capstone: cred.capstone,
      employment: cred.employment as EmploymentOutcome,
      company,
      role: cred.role,
    });
  }
  return result;
}

export const graduateRecords: LegacyGraduateRecord[] = getGraduateRecords();

export function getUniversityDisputes(
  universityId: number = DEMO_UNIVERSITY_ID,
): LegacyUniversityDispute[] {
  const disputes = getDisputesForUniversity(universityId);
  const credentials = getCredentialsForUniversity(universityId);
  return disputes.map((dispute) => {
    const cred = credentials.find((c) => c.id === dispute.credentialId);
    let name = "";
    let initials = "";
    if (cred) {
      if (cred.candidateId !== null) {
        const candidate = getCandidate(cred.candidateId);
        if (candidate) {
          name = candidate.name;
          initials = candidate.initials;
        }
      } else {
        const parsed = parseNameAndProgram(cred.name);
        name = parsed.name;
        initials = initialsFromName(parsed.name);
      }
    }
    return {
      id: dispute.id,
      graduateName: name,
      graduateInitials: initials,
      field: dispute.field,
      claim: dispute.claim,
      counter: dispute.counter,
      filedDate: dispute.filedDate,
      status: dispute.status,
    };
  });
}

export const universityDisputes: LegacyUniversityDispute[] =
  getUniversityDisputes();

export function getEmploymentOutcomes(
  universityId: number = DEMO_UNIVERSITY_ID,
): LegacyEmploymentRecord[] {
  return getCohortOutcomesForUniversity(universityId).map(
    ({ universityId: _u, ...rest }) => {
      void _u;
      return rest;
    },
  );
}

export const employmentOutcomes: LegacyEmploymentRecord[] =
  getEmploymentOutcomes();

export function getSkillDemand(): LegacySkillDemand[] {
  return marketSignalList.map(({ id: _id, ...rest }) => {
    void _id;
    return rest;
  });
}

export const skillDemand: LegacySkillDemand[] = getSkillDemand();
