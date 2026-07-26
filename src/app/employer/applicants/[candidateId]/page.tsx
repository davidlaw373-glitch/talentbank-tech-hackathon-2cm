import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";

import {
  getEmployerCandidateRows,
} from "@/lib/data-helpers";
import { resolveTopSkills } from "@/types/candidate";
import { CandidateActions } from "@/components/features/employer/candidate-actions";
import { CandidateProfileOverview } from "@/components/features/employer/candidate-profile-overview";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const DEMO_EMPLOYER_ID = 1;

type PageProps = {
  params: Promise<{ candidateId: string }>;
};

export function generateStaticParams() {
  return getEmployerCandidateRows(DEMO_EMPLOYER_ID).map((row) => ({
    candidateId: String(row.candidate.id),
  }));
}

export default async function EmployerCandidateDetailPage({
  params,
}: PageProps) {
  const { candidateId: rawCandidateId } = await params;
  const candidateId = Number(rawCandidateId);
  if (!Number.isInteger(candidateId)) notFound();

  const rows = getEmployerCandidateRows(DEMO_EMPLOYER_ID);
  const row = rows.find(
    (candidateRow) => candidateRow.candidate.id === candidateId,
  );
  if (!row) notFound();

  const { candidate, app, job, matchScore } = row;
  return (
    <div className="space-y-8">
      <CandidateProfileOverview
        candidate={candidate}
        applicationId={app.id}
        timeline={app.timeline}
        initialStage={app.stage}
        initialRejected={app.rejected}
        appliedFor={job.title}
      />

      <section
        data-slot="candidate-evaluation"
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
      >
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" aria-hidden />
                Match overview
              </h2>
            </CardTitle>
            <CardDescription>
              How strong a fit this candidate is for the role they applied to.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-5xl font-semibold tracking-tight tabular-nums">
                  {matchScore}
                </p>
                <small className="text-muted-foreground">
                  Match score out of 100
                </small>
              </div>
              <div className="flex-1">
                <div
                  aria-hidden
                  className="h-3 w-full overflow-hidden rounded-full bg-muted"
                >
                  <span
                    className="block h-full rounded-full bg-chart-1"
                    style={{ width: `${matchScore}%` }}
                  />
                </div>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-base font-semibold">Top skills</h3>
              <div className="flex flex-wrap gap-2">
                {resolveTopSkills(candidate.skills, candidate.topSkills).map((skill) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-base font-semibold">Summary</h3>
              <p className="text-muted-foreground">{candidate.summary}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardContent
            className="h-full p-5"
            aria-label="Application actions"
          >
            <CandidateActions
              applicationId={app.id}
              candidateName={candidate.name}
              appliedFor={job.title}
              initialStage={app.stage}
              initialRejected={app.rejected}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
