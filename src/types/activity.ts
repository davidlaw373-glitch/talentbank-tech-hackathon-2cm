/**
 * A recent activity entry for the candidate dashboard "Recent activity"
 * feed. Each item is a self-contained line of copy keyed to the demo
 * candidate. New entries land at the top of the list in the JSON file.
 */
export type ActivityItem = {
  id: number;
  candidateId: number;
  body: string;
  /** Relative time label, e.g. "Just now" / "Yesterday" / "2 days ago". */
  timestamp: string;
};
