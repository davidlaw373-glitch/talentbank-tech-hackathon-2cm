import { notFound } from "next/navigation";

import { JobDetails } from "@/components/features/jobs/job-details";
import { get as getJob } from "@/data/jobs";
import { getForCandidate as getMatchScoresForCandidate } from "@/data/match-scores";
import { get as getEmployer } from "@/data/employers";
import { getCandidateContext } from "@/lib/data-helpers";

type PageProps = {
  params: Promise<{ jobId: string }>;
};

const DEMO_CANDIDATE_ID = 1;

export default async function CandidateJobDetailPage({ params }: PageProps) {
  const { jobId: rawJobId } = await params;
  const jobId = Number(rawJobId);
  if (!Number.isInteger(jobId)) notFound();
  const job = getJob(jobId);
  if (!job) notFound();

  const employer = getEmployer(job.employerId);
  const { candidate } = getCandidateContext(DEMO_CANDIDATE_ID);
  const matchScore = getMatchScoresForCandidate(DEMO_CANDIDATE_ID).find(
    (s) => s.jobId === jobId,
  );
  const candidateSkills = candidate.skills.map((s) => s.name);

  return (
    <JobDetails
      job={job}
      employer={employer}
      matchScore={matchScore}
      candidateSkills={candidateSkills}
    />
  );
}