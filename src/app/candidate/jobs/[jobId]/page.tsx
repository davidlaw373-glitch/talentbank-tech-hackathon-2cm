import { notFound } from "next/navigation";

import { JobDetails } from "@/components/features/jobs/job-details";
import { jobs } from "@/data/jobs";

type PageProps = {
  params: Promise<{ jobId: string }>;
};

export default async function CandidateJobDetailPage({ params }: PageProps) {
  const { jobId } = await params;
  const job = jobs.find((j) => j.id === jobId);
  if (!job) notFound();
  return <JobDetails job={job} />;
}
