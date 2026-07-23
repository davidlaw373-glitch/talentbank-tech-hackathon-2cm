import matchScoresJson from "./match-scores.json";
import type { JobCandidateMatchScore } from "@/types/match-score";

const byId = new Map<number, JobCandidateMatchScore>();
for (const score of matchScoresJson as JobCandidateMatchScore[]) {
  byId.set(score.id, score);
}

export const list: JobCandidateMatchScore[] =
  matchScoresJson as JobCandidateMatchScore[];

export function get(id: number): JobCandidateMatchScore | undefined {
  return byId.get(id);
}

export function getForCandidate(
  candidateId: number,
): JobCandidateMatchScore[] {
  return list.filter((s) => s.candidateId === candidateId);
}

export function getForJob(jobId: number): JobCandidateMatchScore[] {
  return list.filter((s) => s.jobId === jobId);
}

export function getForPair(
  candidateId: number,
  jobId: number,
): JobCandidateMatchScore | undefined {
  return list.find(
    (s) => s.candidateId === candidateId && s.jobId === jobId,
  );
}
