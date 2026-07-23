export type InterviewType =
  | "Phone screen"
  | "Technical"
  | "System design"
  | "Behavioural"
  | "Final";

export type InterviewStatus =
  | "Scheduled"
  | "Pending confirmation"
  | "Reschedule requested"
  | "Completed"
  | "Cancelled";

/**
 * A scheduled interview round tied to an `Application`. The candidate name
 * and role are derived from `applicationId` rather than stored as strings,
 * so renames propagate without edits here.
 */
export type Interview = {
  id: number;
  applicationId: number;
  type: InterviewType;
  interviewers: string[];
  /** Human-readable scheduling line, e.g. "Tomorrow · 10:00 SGT". */
  scheduledFor: string;
  duration: number;
  status: InterviewStatus;
  scorecardItems: number;
};
