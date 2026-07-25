import { describe, expect, it } from "vitest";

import type { EmployerCandidateRow } from "@/lib/data-helpers";
import type { JobCandidateMatchScore } from "@/types/match-score";
import {
  buildCandidateInsight,
  filterCandidateRows,
  getCandidateAchievement,
} from "./candidate-discovery";

function makeRow(
  id: number,
  overrides: {
    name?: string;
    title?: string;
    company?: string;
    skill?: string;
    role?: string;
    stage?: EmployerCandidateRow["app"]["stage"];
    rejected?: boolean;
    verification?: EmployerCandidateRow["verification"];
    score?: number;
    description?: string;
  } = {},
): EmployerCandidateRow {
  const role = overrides.role ?? "Frontend Engineer";
  return {
    candidate: {
      id,
      name: overrides.name ?? `Candidate ${id}`,
      initials: `C${id}`,
      title: overrides.title ?? "Senior Engineer",
      location: "Singapore",
      email: `candidate${id}@example.com`,
      phone: "+65 0000 0000",
      summary: "Product-minded engineer with strong delivery signals.",
      profileCompletion: 90,
      verificationStatus: "Verified",
      skills: [overrides.skill ?? "React"],
      topSkills: [overrides.skill ?? "React"],
      experience: [
        {
          id: 1,
          company: overrides.company ?? "Helio",
          role: "Senior Engineer",
          period: "2022 - present",
          description:
            overrides.description ??
            "Reduced checkout latency by 35% across 12M daily sessions.",
        },
      ],
      education: [],
      projects: [],
      evidence: [],
      onboardingComplete: true,
    },
    job: {
      id,
      employerId: 1,
      title: role,
      location: "Singapore",
      workMode: "Hybrid",
      employmentType: "Full-time",
      posted: "2 days ago",
      salary: "SGD 140-180k",
      status: "Live",
      description: role,
      responsibilities: [],
      requirements: [],
      department: "Engineering",
      applicants: 1,
      filledScore: 100,
      mustHave: ["React"],
      niceToHave: [],
      summary: role,
      aboutCompany: "CareerOS",
    },
    app: {
      id,
      candidateId: id,
      jobId: id,
      appliedDate: "2026-07-01",
      stage: overrides.stage ?? "Applied",
      rejected: overrides.rejected ?? false,
      nextAction: "Review",
      timeline: [],
    },
    matchScore: overrides.score ?? 80,
    verification: overrides.verification ?? "Verified",
  };
}

describe("filterCandidateRows", () => {
  const rows = [
    makeRow(1, {
      name: "Aisha Khan",
      title: "Frontend Lead",
      company: "Helio",
      skill: "React",
      score: 94,
    }),
    makeRow(2, {
      name: "Miguel Santos",
      title: "Data Scientist",
      company: "Atlas",
      skill: "Python",
      role: "Data Engineer",
      stage: "Interview",
      verification: "Pending",
      score: 71,
    }),
    makeRow(3, {
      name: "Priya Rao",
      title: "Product Analyst",
      company: "Vertex",
      skill: "SQL",
      role: "Data Engineer",
      rejected: true,
      verification: "None",
      score: 62,
    }),
  ];

  it.each([
    "Aisha",
    "Frontend Lead",
    "Frontend Engineer",
    "Helio",
    "React",
  ])("searches candidate identity and evidence for %s", (query) => {
    expect(
      filterCandidateRows(rows, {
        query,
        role: "All",
        stage: "All",
        verification: "All",
        sort: "desc",
      }).map((row) => row.candidate.id),
    ).toEqual([1]);
  });

  it("combines role, stage, and verification filters", () => {
    expect(
      filterCandidateRows(rows, {
        query: "",
        role: "Data Engineer",
        stage: "Interview",
        verification: "None",
        sort: "desc",
      }).map((row) => row.candidate.id),
    ).toEqual([2]);
  });

  it("treats rejected as a side-state", () => {
    expect(
      filterCandidateRows(rows, {
        query: "",
        role: "All",
        stage: "Rejected",
        verification: "All",
        sort: "desc",
      }).map((row) => row.candidate.id),
    ).toEqual([3]);
  });

  it("sorts AI Match in ascending order", () => {
    expect(
      filterCandidateRows(rows, {
        query: "",
        role: "All",
        stage: "All",
        verification: "All",
        sort: "asc",
      }).map((row) => row.matchScore),
    ).toEqual([62, 71, 94]);
  });
});

describe("candidate evidence", () => {
  it("uses the latest experience impact", () => {
    expect(getCandidateAchievement(makeRow(1))).toBe(
      "Reduced checkout latency by 35% across 12M daily sessions.",
    );
  });

  it("falls back without fabricating an achievement", () => {
    const row = makeRow(1);
    expect(
      getCandidateAchievement({
        ...row,
        candidate: { ...row.candidate, experience: [], summary: "" },
      }),
    ).toBe("No impact summary provided yet.");
  });

  it("builds grounded AI reasons and exposes a skill gap", () => {
    const row = makeRow(1);
    const match: JobCandidateMatchScore = {
      id: 1,
      candidateId: 1,
      jobId: 1,
      score: 94,
      matchingSkills: ["React", "TypeScript"],
      missingSkills: ["GraphQL"],
    };

    const insight = buildCandidateInsight(row, match);

    expect(insight.reasons).toHaveLength(3);
    expect(insight.reasons[0]).toContain("Current scope");
    expect(insight.reasons[1]).toContain("Demonstrated impact");
    expect(insight.reasons[2]).toContain("Must-have coverage");
    expect(insight.reasons.join(" ")).not.toContain("university-verified");
    expect(insight.caution).toContain("GraphQL");
    expect(insight.skills).toEqual(["React", "TypeScript"]);
  });

  it("uses a positive caution when no gaps are recorded", () => {
    const row = makeRow(1);
    const insight = buildCandidateInsight(row, {
      id: 1,
      candidateId: 1,
      jobId: 1,
      score: 94,
      matchingSkills: ["React"],
      missingSkills: [],
    });

    expect(insight.caution).toBe(
      "Confirm ownership depth and decision-making scope in the first interview.",
    );
  });
});
