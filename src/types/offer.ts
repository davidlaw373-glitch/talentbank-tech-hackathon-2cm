export type OfferDecision = "Pending" | "Accepted" | "Declined" | "Expired";

/**
 * An offer extended on top of an `Application`. Candidate and role are
 * derived from `applicationId`; this record holds the offer-specific terms
 * and decision state.
 */
export type Offer = {
  id: number;
  applicationId: number;
  baseSalary: string;
  startDate: string;
  sentDate: string;
  decision: OfferDecision;
  /** AI match score snapshot at the time the offer was drafted. */
  matchScore: number;
};
