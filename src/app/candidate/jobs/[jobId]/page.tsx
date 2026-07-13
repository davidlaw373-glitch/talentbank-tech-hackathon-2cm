import { notFound } from "next/navigation";
import { JobDetails } from "@/components/features/jobs/job-details";
import { getJob, jobs } from "@/data/jobs";

export function generateStaticParams() {
  return jobs.map(job => ({ jobId: job.id }));
}

export default async function CandidateJobDetailsPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = getJob(jobId);
  if (!job) notFound();
  return <JobDetails job={job} />;
}
