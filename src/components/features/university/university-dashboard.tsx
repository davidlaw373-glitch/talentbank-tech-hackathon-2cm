import Link from "next/link";
import {
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileCheck2,
  GraduationCap,
  Lightbulb,
  UsersRound,
} from "lucide-react";

import {
  UniversityRoleHeader,
  UniversityUpcomingTasks,
} from "@/components/features/university/university-dashboard-role-content";
import {
  curriculumInsights,
  employmentOutcomes,
  graduates,
  universityActivity,
  universityProfile,
  verificationRecords,
} from "@/data/university";
import {
  calculateEmploymentMetrics,
  normalizeEmploymentOutcomes,
} from "@/lib/university-metrics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EmploymentStatus } from "@/types/university";

const normalizedEmploymentOutcomes = normalizeEmploymentOutcomes(
  graduates,
  employmentOutcomes
);
const employmentMetrics = calculateEmploymentMetrics(normalizedEmploymentOutcomes);

const outcomeOrder: EmploymentStatus[] = [
  "Employed",
  "Seeking",
  "Further study",
  "Not seeking",
  "Unknown",
];

const outcomeDistribution = outcomeOrder.map((status) => ({
  status,
  count: normalizedEmploymentOutcomes.filter((outcome) => outcome.status === status)
    .length,
}));

const verificationQueue = verificationRecords.filter(
  (record) => record.status === "Pending" || record.status === "Disputed"
);

const employmentByFaculty = universityProfile.faculties.map((faculty) => {
  const facultyGraduateIds = new Set(
    graduates
      .filter((graduate) => graduate.faculty === faculty)
      .map((graduate) => graduate.id)
  );
  const facultyOutcomes = normalizedEmploymentOutcomes.filter((outcome) =>
    facultyGraduateIds.has(outcome.graduateId)
  );
  const facultyMetrics = calculateEmploymentMetrics(facultyOutcomes);

  return {
    faculty: faculty.replace("Faculty of ", ""),
    employed: facultyMetrics.employed,
    laborForce: facultyMetrics.laborForce,
    rate: facultyMetrics.employmentRate,
  };
});

const pendingVerificationCount = verificationRecords.filter(
  (record) => record.status === "Pending"
).length;
const careersTasks = graduates
  .filter((graduate) =>
    ["Seeking", "Unknown"].includes(graduate.employmentStatus)
  )
  .slice(0, 3)
  .map(({ id, name, nextAction }) => ({ id, name, nextAction }));
const registryTasks = graduates
  .filter((graduate) =>
    ["Pending", "Disputed"].includes(graduate.verificationStatus)
  )
  .slice(0, 3)
  .map(({ id, name, nextAction }) => ({ id, name, nextAction }));

export function UniversityDashboard() {
  return (
    <div className="space-y-8">
      <UniversityRoleHeader institutionName={universityProfile.name} />

      <section
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
        aria-label="University outcome statistics"
      >
        <StatisticCard
          icon={GraduationCap}
          label="Total graduates"
          value={graduates.length}
          detail="Across tracked cohorts"
        />
        <StatisticCard
          icon={BriefcaseBusiness}
          label="Employment rate"
          value={`${employmentMetrics.employmentRate}%`}
          detail="Graduate outcomes in scope"
        />
        <StatisticCard
          icon={FileCheck2}
          label="Pending verifications"
          value={pendingVerificationCount}
          detail="Evidence awaiting review"
        />
        <StatisticCard
          icon={Clock3}
          label="Average days to employment"
          value={employmentMetrics.averageDaysToEmployment}
          detail="For employed graduates"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" aria-hidden />
                  Graduate outcome distribution
                </h2>
              </CardTitle>
              <CardDescription>
                A clear view of the latest reported graduate destinations.
              </CardDescription>
            </div>
            <Badge variant="secondary">Latest cohort</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {outcomeDistribution.map(({ status, count }) => {
              const percentage = Math.round(
                (count / normalizedEmploymentOutcomes.length) * 100
              );

              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium">{status}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {count} graduates {"\u00B7"} {percentage}%
                    </span>
                  </div>
                  <div
                    className="h-2.5 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-label={`${status} graduate outcomes`}
                    aria-valuemin={0}
                    aria-valuemax={normalizedEmploymentOutcomes.length}
                    aria-valuenow={count}
                  >
                    <div
                      className="h-full rounded-full bg-foreground/80"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
              <span>
                Based on {employmentMetrics.laborForce} graduates in the labour force
              </span>
              <span className="font-medium tabular-nums text-foreground">
                {employmentMetrics.coverageRate}% outcomes known
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4" aria-hidden />
                  Verification queue
                </h2>
              </CardTitle>
              <CardDescription>
                Evidence that needs a decision or resolution.
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/university/verification">View queue</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {verificationQueue.map((record) => (
              <div key={record.id} className="rounded-lg border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{record.evidenceName}</p>
                  <Badge variant={record.status === "Disputed" ? "outline" : "secondary"}>
                    {record.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {record.institutionRecord}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>
                <h2>Employment by field</h2>
              </CardTitle>
              <CardDescription>
                Compare labour-force outcomes across your faculties.
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/university/employment">Open employment</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="border-b text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <tr>
                    <th scope="col" className="pb-3 pr-4">Field</th>
                    <th scope="col" className="pb-3 px-4 text-right">Employed</th>
                    <th scope="col" className="pb-3 px-4 text-right">Labour force</th>
                    <th scope="col" className="pb-3 pl-4 text-right">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {employmentByFaculty.map((field) => (
                    <tr key={field.faculty} className="border-b last:border-0">
                      <th scope="row" className="py-4 pr-4 font-medium">
                        {field.faculty}
                      </th>
                      <td className="px-4 py-4 text-right tabular-nums">
                        {field.employed}
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums">
                        {field.laborForce}
                      </td>
                      <td className="pl-4 py-4 text-right font-semibold tabular-nums">
                        {field.rate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" aria-hidden />
                Curriculum signal
              </h2>
            </CardTitle>
            <CardDescription>{curriculumInsights[0].programme}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold">{curriculumInsights[0].title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {curriculumInsights[0].change}
              </p>
            </div>
            <blockquote className="border-l-2 border-primary pl-3 text-sm text-muted-foreground">
              {curriculumInsights[0].evidence}
            </blockquote>
            <div className="rounded-lg border bg-card p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Recommended action
              </p>
              <p className="mt-1 text-sm font-medium">
                {curriculumInsights[0].recommendation}
              </p>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3 text-xs">
              <span className="text-muted-foreground">Confidence</span>
              <span className="font-semibold tabular-nums">
                {curriculumInsights[0].confidence}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Advisory only - curriculum changes require university review.
            </p>
            <Button asChild variant="ghost" size="sm" className="px-0">
              <Link href="/university/insights">Explore insight</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <h2>Recent activity</h2>
            </CardTitle>
            <CardDescription>
              The latest movement across graduate records and market signals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {universityActivity.map((activity) => (
                <li key={activity} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>{activity}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <UniversityUpcomingTasks
          careersTasks={careersTasks}
          registryTasks={registryTasks}
        />
      </section>
    </div>
  );
}

function StatisticCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof UsersRound;
  label: string;
  value: number | string;
  detail: string;
}) {
  return (
    <Card className="lift-on-hover">
      <CardContent className="space-y-3 p-5 sm:p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <p className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
          {value}
        </p>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}
