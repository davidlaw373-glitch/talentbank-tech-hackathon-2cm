import { notFound } from "next/navigation";

import {
  employerCandidates,
  employerJobs,
  getEmployerJob,
} from "@/data/employer";
import type { EmployerCandidate } from "@/types/employer";
import { JobDetailView } from "@/components/features/employer/job-detail-view";

type PageProps = {
  params: Promise<{ jobId: string }>;
};

export function generateStaticParams() {
  return employerJobs.map((job) => ({ jobId: job.id }));
}

export default async function EmployerJobDetailPage({ params }: PageProps) {
  const { jobId } = await params;
  const job = getEmployerJob(jobId);
  if (!job) notFound();

  const applicants: EmployerCandidate[] = employerCandidates
    .filter((c) => c.appliedFor === job.title)
    .slice(0, 3);

  return <JobDetailView job={job} applicants={applicants} />;
}
