import {
  getEmployerCandidateRows,
  getEmployerOfferRows,
  type EmployerOfferRow,
} from "@/lib/data-helpers";
import type { Offer, OfferDecision } from "@/types/offer";

export type DecisionFilter = OfferDecision | "All";
export type RoleFilter = string | "All";

export const OFFER_DECISIONS: OfferDecision[] = [
  "Pending",
  "Accepted",
  "Declined",
  "Expired",
];

const DECISION_PRIORITY: Record<OfferDecision, number> = {
  Pending: 0,
  Accepted: 1,
  Declined: 2,
  Expired: 3,
};

export function getEmployerOfferSeedRows(): EmployerOfferRow[] {
  const existing = getEmployerOfferRows(1);
  const usedApplications = new Set(existing.map((row) => row.application.id));
  const availableCandidates = getEmployerCandidateRows(1).filter(
    (row) => !usedApplications.has(row.app.id),
  );
  const examples: Array<
    Pick<Offer, "baseSalary" | "startDate" | "sentDate" | "decision">
  > = [
    {
      baseSalary: "SGD 128,000",
      startDate: "20 Aug 2026",
      sentDate: "1 week ago",
      decision: "Accepted",
    },
    {
      baseSalary: "SGD 118,000",
      startDate: "1 Sep 2026",
      sentDate: "10 days ago",
      decision: "Declined",
    },
    {
      baseSalary: "SGD 96,000",
      startDate: "15 Aug 2026",
      sentDate: "3 weeks ago",
      decision: "Expired",
    },
  ];

  const demoRows = examples
    .map((details, index): EmployerOfferRow | null => {
      const source = availableCandidates[index];
      if (!source) return null;
      return {
        application: source.app,
        candidate: source.candidate,
        job: source.job,
        offer: {
          id: 100 + index,
          applicationId: source.app.id,
          matchScore: source.matchScore,
          ...details,
        },
      };
    })
    .filter((row): row is EmployerOfferRow => row !== null);

  return [...existing, ...demoRows];
}

export function sortOfferRowsByPriority(rows: EmployerOfferRow[]) {
  return [...rows].sort((a, b) => {
    const decisionDifference =
      DECISION_PRIORITY[a.offer.decision] -
      DECISION_PRIORITY[b.offer.decision];
    return decisionDifference || b.offer.matchScore - a.offer.matchScore;
  });
}

export function filterOfferRows(
  rows: EmployerOfferRow[],
  filters: {
    query: string;
    decision: DecisionFilter;
    role: RoleFilter;
  },
) {
  const normalizedQuery = filters.query.trim().toLowerCase();
  return sortOfferRowsByPriority(rows).filter((row) => {
    const searchable =
      `${row.candidate.name} ${row.job.title}`.toLowerCase();
    return (
      (!normalizedQuery || searchable.includes(normalizedQuery)) &&
      (filters.decision === "All" ||
        row.offer.decision === filters.decision) &&
      (filters.role === "All" || row.job.title === filters.role)
    );
  });
}
