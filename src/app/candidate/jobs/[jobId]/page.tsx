import { notFound } from "next/navigation";

import { JobDetails } from "@/components/features/jobs/job-details";
import { get as getJob } from "@/data/jobs";
import { getForCandidate as getMatchScoresForCandidate } from "@/data/match-scores";
import { get as getEmployer } from "@/data/employers";

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
  const matchScore = getMatchScoresForCandidate(DEMO_CANDIDATE_ID).find(
    (s) => s.jobId === jobId,
  );

  return <JobDetails job={job} employer={employer} matchScore={matchScore} />;
}