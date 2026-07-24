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
import { graduateRecords } from "@/lib/university-helpers";

type PageProps = {
  params: Promise<{ graduateId: string }>;
};

export default async function UniversityGraduateDetailPage({ params }: PageProps) {
  const { graduateId: rawGraduateId } = await params;
  const graduateId = Number(rawGraduateId);
  if (!Number.isInteger(graduateId)) notFound();
  const graduate = graduateRecords.find((g) => g.id === graduateId);
  if (!graduate) notFound();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-caption">
          Graduate record
        </p>
        <h1 className="text-heading">{graduate.name}</h1>
        <p className="text-body text-muted-foreground">
          {graduate.program} · Class of {graduate.graduationYear}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <h2>Capstone</h2>
            </CardTitle>
            <CardDescription>Final-year project</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base">{graduate.capstone}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Verification</h2>
            </CardTitle>
            <CardDescription>Current status</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{graduate.status}</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Skills recorded</h2>
          </CardTitle>
          <CardDescription>From the graduate&apos;s transcript and capstone.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {graduate.skills.map((skill) => (
            <Badge key={skill} variant="outline">
              {skill}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline">
          <Link href="/university/verification">Back to verification</Link>
        </Button>
        <Button asChild>
          <Link href="/university/graduates">Back to graduates</Link>
        </Button>
      </div>
    </div>
  );
}
