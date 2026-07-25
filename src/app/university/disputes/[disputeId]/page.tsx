import { notFound } from "next/navigation";

import { DisputeThreadView } from "@/components/features/university/dispute-resolution";
import { universityDisputes } from "@/lib/university-helpers";

type PageProps = {
  params: Promise<{ disputeId: string }>;
};

export default async function UniversityDisputeDetailPage({ params }: PageProps) {
  const { disputeId: rawDisputeId } = await params;
  const disputeId = Number(rawDisputeId);
  if (!Number.isInteger(disputeId)) notFound();
  const dispute = universityDisputes.find((d) => d.id === disputeId);
  if (!dispute) notFound();

  return <DisputeThreadView initialDispute={dispute} />;
}
