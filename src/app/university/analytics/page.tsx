import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { employmentOutcomes, skillDemand } from "@/lib/university-helpers";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeading } from "@/components/common/page-heading";
import {
  AnalyticsActions,
  CurriculumRecommendations,
  CustomSliceBuilder,
  ReportsArchive,
} from "@/components/features/university/analytics-interactions";

const REPORTS = [
  {
    id: "r-001",
    title: "Cohort outcome snapshot",
    type: "PDF",
    issued: "Issued 12 Jul 2026",
  },
  {
    id: "r-002",
    title: "Skill demand & curriculum gap",
    type: "Excel",
    issued: "Issued 5 Jul 2026",
  },
  {
    id: "r-003",
    title: "Verification pipeline review",
    type: "PDF",
    issued: "Issued 28 Jun 2026",
  },
];

function pct(part: number, total: number) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

function EmploymentTrendChart() {
  const maxBar = 100;
  const sorted = [...employmentOutcomes].sort((a, b) => {
    const yearA = Number(a.cohort.match(/\d{4}/)?.[0] ?? 0);
    const yearB = Number(b.cohort.match(/\d{4}/)?.[0] ?? 0);
    return yearA - yearB;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        {sorted.map((c) => {
          const employedPct = pct(c.employed, c.total);
          const gradPct = pct(c.inGradSchool, c.total);
          const seekingPct = pct(c.seeking, c.total);
          const year = c.cohort.match(/\d{4}/)?.[0] ?? c.cohort;
          return (
            <div
              key={c.id}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="flex w-full items-end justify-center gap-1.5">
                <div className="flex w-full flex-col items-center gap-1">
                  <small className="font-semibold tabular-nums">
                    {employedPct}%
                  </small>
                  <div
                    className="w-full rounded-t-md bg-foreground animate-progress-x"
                    style={{ height: `${(employedPct / maxBar) * 200}px` }}
                    aria-label={`${year} employed ${employedPct}%`}
                  />
                </div>
                <div className="flex w-full flex-col items-center gap-1">
                  <small className="tabular-nums text-muted-foreground">
                    {gradPct}%
                  </small>
                  <div
                    className="w-full rounded-t-md bg-secondary animate-progress-x"
                    style={{ height: `${(gradPct / maxBar) * 200}px` }}
                    aria-label={`${year} in grad school ${gradPct}%`}
                  />
                </div>
                <div className="flex w-full flex-col items-center gap-1">
                  <small className="tabular-nums text-muted-foreground">
                    {seekingPct}%
                  </small>
                  <div
                    className="w-full rounded-t-md bg-muted animate-progress-x"
                    style={{ height: `${(seekingPct / maxBar) * 200}px` }}
                    aria-label={`${year} seeking ${seekingPct}%`}
                  />
                </div>
              </div>
              <small>{year}</small>
            </div>
          );
        })}
      </div>
      {/* baseline */}
      <div className="h-px w-full bg-border" aria-hidden />
      <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-foreground" aria-hidden />
          Employed
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-secondary" aria-hidden />
          In grad school
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-muted" aria-hidden />
          Seeking
        </span>
      </div>
    </div>
  );
}

function SkillDemandList() {
  const sorted = [...skillDemand].sort((a, b) => b.openings - a.openings);
  const maxOpenings = Math.max(...sorted.map((s) => s.openings));
  return (
    <ul className="space-y-3">
      {sorted.map((s, i) => {
        const width = Math.max(8, Math.round((s.openings / maxOpenings) * 100));
        const positive = s.delta >= 0;
        return (
          <li key={s.skill} className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <small className="w-6 text-sm text-muted-foreground tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </small>
                <p className="text-base">{s.skill}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground tabular-nums">
                  {s.openings} openings
                </span>
                <Badge
                  variant={positive ? "secondary" : "outline"}
                  className="gap-1"
                >
                  {positive ? (
                    <ArrowUpRight className="h-3 w-3" aria-hidden />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" aria-hidden />
                  )}
                  {positive ? "+" : ""}
                  {s.delta}%
                </Badge>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground animate-progress-x"
                style={{ width: `${width}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function UniversityAnalyticsPage() {
  return (
    <div className="space-y-8">
      <PageHeading
        title="Analytics & reports"
        description="Trends, demand signals, and curriculum recommendations."
        action={<AnalyticsActions />}
      />

      {/* Employment trends + Skill demand */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" aria-hidden />
                  Employment trends
                </h2>
              </CardTitle>
              <CardDescription>
                Outcomes distribution across the last three cohorts.
              </CardDescription>
            </div>
            <Badge variant="outline">3 cohorts</Badge>
          </CardHeader>
          <CardContent>
            <EmploymentTrendChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" aria-hidden />
                Skill demand
              </h2>
            </CardTitle>
            <CardDescription>
              Openings and 12-month delta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SkillDemandList />
          </CardContent>
        </Card>
      </section>

      {/* Curriculum recommendations + Reports archive */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" aria-hidden />
                Curriculum recommendations
              </h2>
            </CardTitle>
            <CardDescription>
              Derived from live demand and your existing program mix.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CurriculumRecommendations skills={skillDemand} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Reports archive</h2>
            </CardTitle>
            <CardDescription>
              Recently issued for faculty and accreditation.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ReportsArchive reports={REPORTS} />
          </CardContent>
        </Card>
      </section>

      <Separator />

      <CustomSliceBuilder
        cohorts={employmentOutcomes.map((c) => c.cohort)}
        skills={[...skillDemand]
          .sort((a, b) => b.openings - a.openings)
          .slice(0, 8)
          .map((s) => s.skill)}
      />
    </div>
  );
}