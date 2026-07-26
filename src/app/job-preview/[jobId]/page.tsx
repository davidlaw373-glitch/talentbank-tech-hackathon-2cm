import { notFound } from "next/navigation";

import { JobPostingPreviewReport } from "@/components/features/jobs/job-posting-preview-report";
import { JobPreviewZoom } from "@/components/features/jobs/job-preview-zoom";
import { get as getEmployer } from "@/data/employers";
import { get as getJob } from "@/data/jobs";

type PageProps = {
  params: Promise<{ jobId: string }>;
};

export default async function JobPreviewPage({ params }: PageProps) {
  const { jobId: rawJobId } = await params;
  const jobId = Number(rawJobId);
  if (!Number.isInteger(jobId)) notFound();

  const job = getJob(jobId);
  if (!job) notFound();

  const employer = getEmployer(job.employerId);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="container mx-auto p-5 sm:p-7 lg:p-8"
    >
      <JobPreviewZoom>
        <JobPostingPreviewReport job={job} employer={employer} />
      </JobPreviewZoom>
    </main>
  );
}
