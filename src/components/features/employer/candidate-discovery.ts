import type { EmployerCandidateRow } from "@/lib/data-helpers";
import type { ApplicationStage } from "@/types/application";
import type { JobCandidateMatchScore } from "@/types/match-score";

export type CandidateStageFilter = ApplicationStage | "All" | "Rejected";
export type CandidateView = ApplicationStage | "Rejected";
export type CandidateSort = "latest" | "verified";

export type CandidateDiscoveryFilters = {
  query: string;
  role: string;
  stage: CandidateStageFilter;
  sort: CandidateSort;
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

export function filterRowsForCandidateView(
  rows: EmployerCandidateRow[],
  view: CandidateView,
): EmployerCandidateRow[] {
  return rows.filter((row) =>
    view === "Rejected"
      ? row.app.rejected
      : !row.app.rejected && row.app.stage === view,
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
        stageMatches
      );
    })
    .toSorted((a, b) => {
      if (filters.sort === "latest") {
        return (
          b.app.appliedDate.localeCompare(a.app.appliedDate) ||
          b.matchScore - a.matchScore
        );
      }

      if (filters.sort === "verified") {
        const verifiedDifference =
          Number(b.verification === "Verified") -
          Number(a.verification === "Verified");

        return verifiedDifference || b.matchScore - a.matchScore;
      }

      return b.matchScore - a.matchScore;
    });
}

export function buildCandidateInsight(
  row: EmployerCandidateRow,
  match: JobCandidateMatchScore | undefined,
): CandidateInsight {
  const matchingSkills = match?.matchingSkills.slice(0, 3) ?? [];
  const latestExperience = row.candidate.experience[0];
  const evidencedSkills = new Set(
    [...row.candidate.skills, ...(match?.matchingSkills ?? [])].map((skill) =>
      skill.toLocaleLowerCase(),
    ),
  );
  const coveredMustHaves = row.job.mustHave.filter((skill) =>
    evidencedSkills.has(skill.toLocaleLowerCase()),
  );
  const coverageSummary = row.job.mustHave.length
    ? `${coveredMustHaves.length}/${row.job.mustHave.length}${
        coveredMustHaves.length
          ? ` (${coveredMustHaves.slice(0, 3).join(", ")})`
          : ""
      }`
    : matchingSkills.length
      ? matchingSkills.join(", ")
      : "role-relevant experience";
  const reasons = [
    latestExperience
      ? `Current scope: ${latestExperience.role} at ${latestExperience.company} (${latestExperience.period}), providing recent evidence for ${row.job.title}.`
      : `Current scope: profile experience aligns with ${row.job.title}.`,
    `Demonstrated impact: ${getCandidateAchievement(row)}`,
    `Must-have coverage: ${coverageSummary}.`,
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
      ? `Validate hands-on depth in ${match.missingSkills
          .slice(0, 2)
          .join(" and ")} with a recent production example.`
      : "Confirm ownership depth and decision-making scope in the first interview.",
    skills: matchingSkills,
  };
}
