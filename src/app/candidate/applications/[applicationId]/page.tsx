import { notFound } from "next/navigation";
import { ApplicationDetails } from "@/components/features/applications/application-details";
import { applications, getApplication } from "@/data/applications";

export function generateStaticParams() {
  return applications.map(application => ({ applicationId: application.id }));
}

export default async function CandidateApplicationDetailsPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await params;
  const application = getApplication(applicationId);
  if (!application) notFound();
  return <ApplicationDetails application={application} />;
}
