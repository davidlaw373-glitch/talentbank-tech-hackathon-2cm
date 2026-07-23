export type TalentPoolStatus =
  | "Active"
  | "Contacted"
  | "Re-engaging"
  | "Stale";

export type TalentPoolTag =
  | "Silver medalist"
  | "Future role"
  | "Referral"
  | "Conference"
  | "Open to work"
  | "Senior IC"
  | "Specialist";

export type TalentPoolSource =
  | "Application"
  | "Referral"
  | "Open application"
  | "Conference";

/**
 * A candidate that an employer has bookmarked. One row per (employerId,
 * candidateId) pair — the same candidate can sit in multiple employers'
 * talent pools. The full set of recruitment metadata is stored on the
 * entry rather than derived so recruiters can edit notes and tags freely.
 */
export type TalentPoolEntry = {
  id: number;
  employerId: number;
  candidateId: number;
  status: TalentPoolStatus;
  savedAt: string;
  lastContactedAt: string | null;
  notes: string;
  tags: TalentPoolTag[];
  source: TalentPoolSource;
  sourceDetail: string;
  /** 0–100 score the recruiter uses to triage re-engagement. */
  reEngagementScore: number;
};
