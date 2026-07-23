/**
 * AI-derived match between a `Candidate` and a `Job`. One record per
 * (candidateId, jobId) pair. Skills lists are stored on the score (not
 * recomputed at render time) so the dataset remains stable for the demo.
 */
export type JobCandidateMatchScore = {
  id: number;
  candidateId: number;
  jobId: number;
  /** 0–100 fit score. */
  score: number;
  /** Skills the candidate has that overlap with the job's must/nice list. */
  matchingSkills: string[];
  /** Skills the job asks for that the candidate does not list. */
  missingSkills: string[];
};
