import {
  getEmployerCandidateRows,
  getEmployerInterviewRows,
  type EmployerInterviewRow,
} from "@/lib/data-helpers";
import type {
  Interview,
  InterviewStatus,
  InterviewType,
} from "@/types/interview";

export type StatusFilter = InterviewStatus | "All";
export type TypeFilter = InterviewType | "All";

export type InterviewFilters = {
  query: string;
  status: StatusFilter;
  type: TypeFilter;
};

export const INTERVIEW_STATUSES: InterviewStatus[] = [
  "Scheduled",
  "Pending confirmation",
  "Reschedule requested",
  "Completed",
  "Cancelled",
];

export const INTERVIEW_TYPES: InterviewType[] = [
  "Phone screen",
  "Technical",
  "System design",
  "Behavioural",
  "Final",
];

const STATUS_PRIORITY: Record<InterviewStatus, number> = {
  Scheduled: 0,
  "Pending confirmation": 1,
  "Reschedule requested": 2,
  Completed: 3,
  Cancelled: 4,
};

export function getEmployerInterviewSeedRows(): EmployerInterviewRow[] {
  const existing = getEmployerInterviewRows(1);
  const usedApplications = new Set(
    existing.map((row) => row.application.id),
  );
  const additions: Array<
    Pick<
      Interview,
      | "type"
      | "interviewers"
      | "scheduledAt"
      | "scheduledFor"
      | "duration"
      | "status"
      | "scorecardItems"
    >
  > = [
    {
      type: "Technical",
      interviewers: ["Priya Anand", "Daniel Wong"],
      scheduledAt: "2026-07-31T09:30:00+08:00",
      scheduledFor: "Fri · 09:30 SGT",
      duration: 60,
      status: "Scheduled",
      scorecardItems: 5,
    },
    {
      type: "Behavioural",
      interviewers: ["Mei Tan"],
      scheduledAt: "2026-08-03T11:00:00+08:00",
      scheduledFor: "Mon · 11:00 SGT",
      duration: 45,
      status: "Scheduled",
      scorecardItems: 4,
    },
    {
      type: "Final",
      interviewers: ["Jordan Lee", "Anika Patel"],
      scheduledAt: "2026-08-04T16:00:00+08:00",
      scheduledFor: "Tue · 16:00 SGT",
      duration: 60,
      status: "Pending confirmation",
      scorecardItems: 6,
    },
  ];

  const availableCandidates = getEmployerCandidateRows(1).filter(
    (row) => !usedApplications.has(row.app.id),
  );

  const demoRows = additions
    .map((details, index): EmployerInterviewRow | null => {
      const source = availableCandidates[index];
      if (!source) return null;
      return {
        application: source.app,
        candidate: source.candidate,
        job: source.job,
        interview: {
          id: 100 + index,
          applicationId: source.app.id,
          ...details,
        },
      };
    })
    .filter((row): row is EmployerInterviewRow => row !== null);

  return [...existing, ...demoRows];
}

export function sortInterviewRowsByPriority(rows: EmployerInterviewRow[]) {
  return [...rows].sort(
    (a, b) =>
      STATUS_PRIORITY[a.interview.status] -
      STATUS_PRIORITY[b.interview.status],
  );
}

export function filterInterviewRows(
  rows: EmployerInterviewRow[],
  filters: InterviewFilters,
) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return sortInterviewRowsByPriority(rows).filter((row) => {
    const searchableText =
      `${row.candidate.name} ${row.job.title} ${row.interview.interviewers.join(" ")}`.toLowerCase();

    return (
      (!normalizedQuery || searchableText.includes(normalizedQuery)) &&
      (filters.status === "All" ||
        row.interview.status === filters.status) &&
      (filters.type === "All" || row.interview.type === filters.type)
    );
  });
}
