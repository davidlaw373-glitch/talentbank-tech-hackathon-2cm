/**
 * Market signal — supply/demand data per skill. Used by the candidate
 * path-navigator and the university analytics/employment pages. Global,
 * not tied to any one university or employer.
 */
export type MarketSignal = {
  id: number;
  skill: string;
  openings: number;
  /** 12-month delta in openings, expressed as a percentage. */
  delta: number;
};
