import type { EmployerCandidateRow } from "@/lib/data-helpers";
import type { ApplicationStage } from "@/types/application";
import type { JobCandidateMatchScore } from "@/types/match-score";

export type CandidateStageFilter = ApplicationStage | "All" | "Rejected";
export type CandidateVerificationFilter =
  | EmployerCandidateRow["verification"]
  | "All";
export type CandidateMatchSort = "desc" | "asc";

export type CandidateDiscoveryFilters = {
  query: string;
  role: string;
  stage: CandidateStageFilter;
  verification: CandidateVerificationFilter;
  sort: CandidateMatchSort;
};

export type CandidateInsight = {
  verdict: string;
  reasons: string[];
  caution: string;
  skills: string[];
};

export function getCandidateAchievement(row: EmployerCandidateRow): string {
  return (
    row.candidate.experience[0]?.description.trim() ||
    row.candidate.summary.trim() ||
    "No impact summary provided yet."
  );
}

export function filterCandidateRows(
  rows: EmployerCandidateRow[],
  filters: CandidateDiscoveryFilters,
): EmployerCandidateRow[] {
  const query = filters.query.trim().toLocaleLowerCase();

  return rows
    .filter((row) => {
      const searchable = [
        row.candidate.name,
        row.candidate.title,
        row.job.title,
        ...row.candidate.experience.flatMap((experience) => [
          experience.company,
          experience.role,
        ]),
        ...row.candidate.skills,
      ]
        .join(" ")
        .toLocaleLowerCase();
      const stageMatches =
        filters.stage === "All" ||
        (filters.stage === "Rejected"
          ? row.app.rejected
          : !row.app.rejected && row.app.stage === filters.stage);

      return (
        (!query || searchable.includes(query)) &&
        (filters.role === "All" || row.job.title === filters.role) &&
        stageMatches &&
        (filters.verification === "All" ||
          row.verification === filters.verification)
      );
    })
    .toSorted((a, b) =>
      filters.sort === "desc"
        ? b.matchScore - a.matchScore
        : a.matchScore - b.matchScore,
    );
}

export function buildCandidateInsight(
  row: EmployerCandidateRow,
  match: JobCandidateMatchScore | undefined,
): CandidateInsight {
  const matchingSkills = match?.matchingSkills.slice(0, 3) ?? [];
  const reasons = [
    matchingSkills.length
      ? `Matches ${matchingSkills.join(", ")} for ${row.job.title}.`
      : `Experience aligns with the ${row.job.title} application.`,
    getCandidateAchievement(row),
    row.verification === "Verified"
      ? "Profile evidence includes university-verified credentials."
      : `Credential review status: ${row.verification.toLowerCase()}.`,
  ];

  return {
    verdict:
      row.matchScore >= 85
        ? "Strong profile to shortlist"
        : row.matchScore >= 70
          ? "Worth a closer review"
          : "Review role gaps before saving",
    reasons,
    caution: match?.missingSkills.length
      ? `Validate ${match.missingSkills.slice(0, 2).join(" and ")} during screening.`
      : "No must-have skill gaps identified.",
    skills: matchingSkills,
  };
}
