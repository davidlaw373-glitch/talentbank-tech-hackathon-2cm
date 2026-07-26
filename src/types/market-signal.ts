/**
 * Market signal — supply/demand data per skill. Used by the candidate
 * path-navigator and the university analytics/employment pages. Global,
 * not tied to any one university or employer.
 */
export type MarketSignal = {
  id: number;
  skill: string;
  /** Current openings (most recent year). */
  openings: number;
  /** 12-month delta in openings, expressed as a percentage. */
  delta: number;
  /**
   * Yearly openings for the last 5 years, oldest first. The last element
   * is the same value as `openings`. Powers the multi-year trend chart on
   * the university analytics page so admins can see which skills are
   * rising vs cooling when planning the next syllabus revision.
   */
  history: number[];
};
