import { notFound } from "next/navigation";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-caption">
          Dispute thread
        </p>
        <h1 className="text-heading">{dispute.graduateName}</h1>
        <p className="text-body text-muted-foreground">
          {dispute.field} · Filed {dispute.filedDate}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="flex items-center gap-2">
              Candidate claim
            </h2>
          </CardTitle>
          <CardDescription>As filed by the graduate.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-base">{dispute.claim}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Faculty counter</h2>
          </CardTitle>
          <CardDescription>Reviewer&apos;s response.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-base">{dispute.counter}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Status</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="outline">{dispute.status}</Badge>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline">
          <Link href="/university/disputes">Back to disputes</Link>
        </Button>
      </div>
    </div>
  );
}
