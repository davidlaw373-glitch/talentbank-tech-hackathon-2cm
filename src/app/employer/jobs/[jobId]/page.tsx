import { notFound } from "next/navigation";

import { getByEmployer as getJobsByEmployer } from "@/data/jobs";
import { getEmployerCandidateRows } from "@/lib/data-helpers";
import { JobDetailView } from "@/components/features/employer/job-detail-view";

type PageProps = {
  params: Promise<{ jobId: string }>;
};

const DEMO_EMPLOYER_ID = 1;

export function generateStaticParams() {
  return getJobsByEmployer(DEMO_EMPLOYER_ID).map((job) => ({
    jobId: String(job.id),
  }));
}

export default async function EmployerJobDetailPage({ params }: PageProps) {
  const { jobId: rawJobId } = await params;
  const jobId = Number(rawJobId);
  if (!Number.isInteger(jobId)) notFound();
  const job = getJobsByEmployer(DEMO_EMPLOYER_ID).find((j) => j.id === jobId);
  if (!job) notFound();

  const applicants = getEmployerCandidateRows(DEMO_EMPLOYER_ID)
    .filter((r) => r.job.id === jobId)
    .sort((a, b) => b.matchScore - a.matchScore);

  return <JobDetailView job={job} applicants={applicants} />;
}
