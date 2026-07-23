import jobsJson from "./jobs.json";
import applicationsJson from "./applications.json";
import type { Job } from "@/types/job";

const byId = new Map<number, Job>();
for (const job of jobsJson as Job[]) {
  byId.set(job.id, job);
}

export const list: Job[] = jobsJson as Job[];

export function get(id: number): Job | undefined {
  return byId.get(id);
}

export function getByEmployer(employerId: number): Job[] {
  return list.filter((j) => j.employerId === employerId);
}

export function getByStatus(status: Job["status"]): Job[] {
  return list.filter((j) => j.status === status);
}

/**
 * Number of applications filed against a job. Computed on every call;
 * if this becomes a hot path we can memoize.
 */
export function getApplicantCount(jobId: number): number {
  let count = 0;
  for (const app of applicationsJson as Array<{ jobId: number }>) {
    if (app.jobId === jobId) count++;
  }
  return count;
}
