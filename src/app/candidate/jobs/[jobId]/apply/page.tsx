import { notFound } from "next/navigation";
import { JobApplicationForm } from "@/components/features/jobs/job-application-form";
import { getJob, jobs } from "@/data/jobs";

export function generateStaticParams() {
  return jobs.map(job => ({ jobId: job.id }));
}

export default async function CandidateJobApplicationPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = getJob(jobId);
  if (!job) notFound();
  return <JobApplicationForm job={job} />;
}
