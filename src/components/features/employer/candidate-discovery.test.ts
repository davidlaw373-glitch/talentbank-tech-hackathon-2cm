import { describe, expect, it } from "vitest";

import type { EmployerCandidateRow } from "@/lib/data-helpers";
import {
  buildCandidateInsight,
  filterCandidateRows,
  filterRowsForCandidateView,
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
    appliedDate?: string;
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
      skills: [{ id: 1, name: overrides.skill ?? "React", status: "Verified" }],
      topSkills: [1],
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
      appliedDate: overrides.appliedDate ?? "2026-07-01",
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
      appliedDate: "2026-07-01",
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
      appliedDate: "2026-07-03",
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
      appliedDate: "2026-07-02",
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
        sort: ["latest"],
      }).map((row) => row.candidate.id),
    ).toEqual([1]);
  });

  it("combines role and stage filters", () => {
    expect(
      filterCandidateRows(rows, {
        query: "",
        role: "Data Engineer",
        stage: "Interview",
        sort: ["latest"],
      }).map((row) => row.candidate.id),
    ).toEqual([2]);
  });

  it("treats rejected as a side-state", () => {
    expect(
      filterCandidateRows(rows, {
        query: "",
        role: "All",
        stage: "Rejected",
        sort: ["latest"],
      }).map((row) => row.candidate.id),
    ).toEqual([3]);
  });

  it("sorts the newest applications first", () => {
    expect(
      filterCandidateRows(rows, {
        query: "",
        role: "All",
        stage: "All",
        sort: ["latest"],
      }).map((row) => row.candidate.id),
    ).toEqual([2, 3, 1]);
  });

  it("preserves the original order when sorting is disabled", () => {
    const unsortedRows = [
      makeRow(1, { score: 60, appliedDate: "2026-07-01" }),
      makeRow(2, { score: 95, appliedDate: "2026-07-03" }),
      makeRow(3, { score: 75, appliedDate: "2026-07-02" }),
    ];

    expect(
      filterCandidateRows(unsortedRows, {
        query: "",
        role: "All",
        stage: "All",
        sort: [],
      }).map((row) => row.candidate.id),
    ).toEqual([1, 2, 3]);
  });

  it("filters to verified candidates", () => {
    const mixedRows = [
      makeRow(1, { verification: "Verified", score: 70 }),
      makeRow(2, { verification: "None", score: 95 }),
      makeRow(3, { verification: "Pending", score: 80 }),
    ];

    expect(
      filterCandidateRows(mixedRows, {
        query: "",
        role: "All",
        stage: "All",
        sort: ["verified"],
      }).map((row) => row.candidate.id),
    ).toEqual([1]);
  });

  it("filters to starred candidates while preserving their order", () => {
    expect(
      filterCandidateRows(
        rows,
        {
          query: "",
          role: "All",
          stage: "All",
          sort: ["starred"],
        },
        new Set([1, 3]),
      ).map((row) => row.candidate.id),
    ).toEqual([1, 3]);
  });

  it("sorts AI Match from high to low", () => {
    expect(
      filterCandidateRows(rows, {
        query: "",
        role: "All",
        stage: "All",
        sort: ["match-desc"],
      }).map((row) => row.candidate.id),
    ).toEqual([1, 2, 3]);
  });

  it("combines verified and starred filters with latest sorting", () => {
    expect(
      filterCandidateRows(
        rows,
        {
          query: "",
          role: "All",
          stage: "All",
          sort: ["verified", "starred", "latest"],
        },
        new Set([1, 2]),
      ).map((row) => row.candidate.id),
    ).toEqual([1]);
  });
});

describe("filterRowsForCandidateView", () => {
  const rows = [
    makeRow(1, { stage: "Screening" }),
    makeRow(2, { stage: "Applied" }),
    makeRow(3, { stage: "Interview" }),
    makeRow(4, { stage: "Offer" }),
    makeRow(5, { stage: "Applied", rejected: true }),
  ];

  it("shows only the selected active pipeline stage", () => {
    expect(
      filterRowsForCandidateView(rows, "Screening").map(
        (row) => row.candidate.id,
      ),
    ).toEqual([1]);
    expect(
      filterRowsForCandidateView(rows, "Interview").map(
        (row) => row.candidate.id,
      ),
    ).toEqual([3]);
  });

  it("keeps rejected candidates out of active views", () => {
    expect(
      filterRowsForCandidateView(rows, "Applied").map(
        (row) => row.candidate.id,
      ),
    ).toEqual([2]);
    expect(
      filterRowsForCandidateView(rows, "Rejected").map(
        (row) => row.candidate.id,
      ),
    ).toEqual([5]);
  });

  it("shows every candidate in the all view", () => {
    expect(
      filterRowsForCandidateView(rows, "All").map(
        (row) => row.candidate.id,
      ),
    ).toEqual([1, 2, 3, 4, 5]);
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

  it("builds grounded AI reasons from real candidate/job data", () => {
    // makeRow(1) creates a candidate with skills=["React"] and job.mustHave=["React"]
    const row = makeRow(1);
    const insight = buildCandidateInsight(row);

    expect(insight.reasons).toHaveLength(3);
    expect(insight.reasons[0]).toContain("Current scope");
    expect(insight.reasons[1]).toContain("Demonstrated impact");
    expect(insight.reasons[2]).toContain("Must-have coverage");
    expect(insight.reasons.join(" ")).not.toContain("university-verified");
    expect(insight.caution).toBe(
      "Confirm ownership depth and decision-making scope in the first interview.",
    );
    expect(insight.skills).toEqual(["React"]);
  });

  it("shows skill gaps when candidate is missing some must-haves", () => {
    // Override the candidate to have no matching skills for the job's mustHave
    const row = makeRow(1, { skill: "Python" }); // job.mustHave still = ["React"]
    const insight = buildCandidateInsight(row);

    expect(insight.skills).toEqual([]);
    expect(insight.caution).toContain("React");
  });
});
