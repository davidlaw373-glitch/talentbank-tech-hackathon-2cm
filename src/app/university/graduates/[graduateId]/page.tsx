import { notFound } from "next/navigation";
import Link from "next/link";
import { Award, Briefcase, CalendarDays, GraduationCap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { STATUS_VARIANT } from "@/components/features/university/verification-pipeline";
import { graduateRecords } from "@/lib/university-helpers";

/** Parses a "3.78 / 4.00" style GPA string into a 0-100 share for the bar. */
function gpaShare(gpa: string): number {
  const match = gpa.match(/([\d.]+)\s*\/\s*([\d.]+)/);
  if (!match) return 0;
  const [, numerator, denominator] = match;
  const scale = Number(denominator);
  if (!scale) return 0;
  return Math.max(0, Math.min(100, Math.round((Number(numerator) / scale) * 100)));
}

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
      <header className="rounded-xl border border-border/20 bg-card p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted">
            <span className="text-base font-medium">{graduate.initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-caption">Graduate record</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="text-heading">{graduate.name}</h1>
              <Badge variant={STATUS_VARIANT[graduate.status]}>
                {graduate.status}
              </Badge>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <GraduationCap className="h-3.5 w-3.5" aria-hidden />
              {graduate.program}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" aria-hidden />
                Class of {graduate.graduationYear}
              </span>
              {graduate.company ? (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" aria-hidden />
                  {graduate.role ? `${graduate.role} · ` : ""}
                  {graduate.company}
                </span>
              ) : null}
            </div>
          </div>
          {graduate.gpa ? (
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-4xl font-semibold tabular-nums leading-none">
                {graduate.gpa.split("/")[0].trim()}
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                GPA
              </span>
              <div className="mt-2 h-1 w-12 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-chart-1"
                  style={{ width: `${gpaShare(graduate.gpa)}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <Award className="h-4 w-4" aria-hidden />
                Capstone
              </h2>
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
              <h2 className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" aria-hidden />
                Employment
              </h2>
            </CardTitle>
            <CardDescription>Current outcome</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-base font-medium">{graduate.employment}</p>
            {graduate.company ? (
              <p className="text-sm text-muted-foreground">
                {graduate.role ? `${graduate.role} · ` : ""}
                {graduate.company}
              </p>
            ) : null}
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
