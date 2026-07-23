import applicationsJson from "./applications.json";
import type {
  Application,
  ApplicationTimelineStep,
} from "@/types/candidate";

const byId = new Map<number, Application>();
for (const application of applicationsJson as Application[]) {
  byId.set(application.id, application);
}

export const list: Application[] = applicationsJson as Application[];

export function get(id: number): Application | undefined {
  return byId.get(id);
}

export function getByCandidate(candidateId: number): Application[] {
  return list.filter((a) => a.candidateId === candidateId);
}

export function getByJob(jobId: number): Application[] {
  return list.filter((a) => a.jobId === jobId);
}

export function getActiveByCandidate(candidateId: number): Application[] {
  return getByCandidate(candidateId).filter((a) => !a.rejected);
}

/**
 * Derive the most-recent update copy for an application. Replaces the
 * legacy `update` string on the `Application` shape — keeps the timeline
 * as the single source of truth so the latest message always reflects
 * the latest stage.
 */
export function getApplicationUpdate(app: Application): string {
  const last: ApplicationTimelineStep | undefined =
    app.timeline[app.timeline.length - 1];
  if (!last) return "";
  if (last.complete) {
    return `${last.label} complete — ${last.date}`;
  }
  return `In progress: ${last.label} — ${last.date}`;
}
