"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  Gavel,
  Layers,
  LineChart,
  Scale,
  ShieldCheck,
  Timer,
} from "lucide-react";

import {
  getApplicationFunnel,
  getCohortComparison,
  getMarketSignalHistory,
  getSkillGapAnalysis,
  getTimeToEmploymentDistribution,
  getVerificationAnalytics,
  type SkillGap,
} from "@/lib/university-helpers";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ApplicationFunnel,
  DistributionBars,
  type DistributionBar,
  MultiYearTrendChart,
} from "@/components/features/university/analytics-charts";

/* ------------------------------------------------------------------ */
/*  SkillGapTable — read-only signal for syllabus planning           */
/* ------------------------------------------------------------------ */

function SkillGapBar({ coverage }: { coverage: number }) {
  const swatch =
    coverage <= 15
      ? "bg-destructive"
      : coverage <= 45
        ? "bg-highlight"
        : "bg-chart-1";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted sm:w-32">
        <div
          className={cn("h-full rounded-full animate-progress-x", swatch)}
          style={{ width: `${Math.max(4, coverage)}%` }}
          aria-hidden
        />
      </div>
      <span className="font-semibold tabular-nums">{coverage}%</span>
    </div>
  );
}

function SkillGapTable({ rows }: { rows: SkillGap[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-sm">
        <caption className="sr-only">
          Skill gap analysis: in-demand skills and graduate coverage
        </caption>
        <thead>
          <tr className="border-b text-left">
            <th scope="col" className="py-3 pr-4 font-medium">
              Skill
            </th>
            <th scope="col" className="py-3 pr-4 text-right font-medium">
              Openings
            </th>
            <th scope="col" className="py-3 pr-4 font-medium">
              Graduate coverage
            </th>
            <th scope="col" className="py-3 pr-4 text-right font-medium">
              Gap
            </th>
            <th scope="col" className="py-3 pr-4 font-medium">
              Recommendation
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const variant: "destructive" | "secondary" | "outline" =
              row.recommendation === "Add to syllabus"
                ? "destructive"
                : row.recommendation === "Deepen coverage"
                  ? "secondary"
                  : "outline";
            return (
              <tr key={row.skill} className="border-b last:border-b-0">
                <td className="py-3 pr-4 font-medium">{row.skill}</td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  {row.demandOpenings}
                </td>
                <td className="py-3 pr-4">
                  <SkillGapBar coverage={row.graduateCoverage} />
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  {row.gapPct}%
                </td>
                <td className="py-3 pr-4">
                  <Badge variant={variant}>{row.recommendation}</Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CohortComparisonTable                                            */
/* ------------------------------------------------------------------ */

function CohortComparisonTable({
  rows,
}: {
  rows: ReturnType<typeof getCohortComparison>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-sm">
        <caption className="sr-only">Cohort comparison by year</caption>
        <thead>
          <tr className="border-b text-left">
            <th scope="col" className="py-3 pr-4 font-medium">
              Cohort
            </th>
            <th scope="col" className="py-3 pr-4 text-right font-medium">
              Total
            </th>
            <th scope="col" className="py-3 pr-4 text-right font-medium">
              Employed
            </th>
            <th scope="col" className="py-3 pr-4 font-medium">
              Employment rate
            </th>
            <th scope="col" className="py-3 pr-4 font-medium">
              Avg salary
            </th>
            <th scope="col" className="py-3 pr-4 font-medium">
              Top employer · role
            </th>
            <th scope="col" className="py-3 pr-4 font-medium">
              Median time to hire
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.cohort} className="border-b last:border-b-0">
              <td className="py-3 pr-4 font-medium">{row.cohort}</td>
              <td className="py-3 pr-4 text-right tabular-nums">
                {row.total.toLocaleString()}
              </td>
              <td className="py-3 pr-4 text-right tabular-nums">
                {row.employed.toLocaleString()}
              </td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-muted sm:w-32">
                    <div
                      className="h-full rounded-full bg-chart-1 animate-progress-x"
                      style={{ width: `${row.employmentRate}%` }}
                      aria-hidden
                    />
                  </div>
                  <span className="font-semibold tabular-nums">
                    {row.employmentRate}%
                  </span>
                </div>
              </td>
              <td className="py-3 pr-4 text-base tabular-nums">
                {row.avgSalary}
              </td>
              <td className="py-3 pr-4">
                <p className="text-base">{row.topEmployer}</p>
                <p className="text-sm text-muted-foreground">{row.topRole}</p>
              </td>
              <td className="py-3 pr-4 text-sm tabular-nums">
                {row.medianTimeToHire} mo
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  VerificationAnalyticsPanel                                       */
/* ------------------------------------------------------------------ */

function VerificationAnalyticsPanel() {
  const data = getVerificationAnalytics();
  const maxDispute = Math.max(
    ...data.disputeByCategory.map((c) => c.count),
    1,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4 rounded-lg border bg-surface-tint p-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-chart-1/15">
          <span className="text-2xl font-semibold tabular-nums">
            {data.passRate}%
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-base font-medium">Pass rate</p>
          <p className="text-sm text-muted-foreground">
            {data.verified} of {data.totalCredentials} credentials verified.
            Median {data.avgDaysToVerify} days to clear review.
          </p>
        </div>
      </div>

      <ul className="space-y-2">
        <li className="flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-chart-1" aria-hidden />
            Verified
          </span>
          <span className="font-semibold tabular-nums">{data.verified}</span>
        </li>
        <li className="flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4 text-chart-7" aria-hidden />
            Pending review
          </span>
          <span className="font-semibold tabular-nums">{data.pending}</span>
        </li>
        <li className="flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-highlight" aria-hidden />
            Action required
          </span>
          <span className="font-semibold tabular-nums">
            {data.actionRequired}
          </span>
        </li>
        <li className="flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" aria-hidden />
            Rejected
          </span>
          <span className="font-semibold tabular-nums">{data.rejected}</span>
        </li>
      </ul>

      {data.disputeByCategory.length > 0 ? (
        <div className="space-y-2 border-t pt-3">
          <div className="flex items-center gap-2">
            <Gavel className="h-4 w-4" aria-hidden />
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Disputes by category
            </p>
          </div>
          {data.disputeByCategory.map((category, i) => (
            <div key={category.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span>{category.category}</span>
                <span className="font-semibold tabular-nums">
                  {category.count}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full animate-progress-x",
                    i === 0
                      ? "bg-highlight"
                      : i === 1
                        ? "bg-chart-2"
                        : i === 2
                          ? "bg-chart-3"
                          : "bg-chart-4",
                  )}
                  style={{
                    width: `${Math.max(
                      6,
                      Math.round((category.count / maxDispute) * 100),
                    )}%`,
                  }}
                  aria-hidden
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AdvancedAnalytics — composed client island                       */
/* ------------------------------------------------------------------ */

export function AnalyticsAdvanced() {
  const signals = getMarketSignalHistory();
  const funnel = getApplicationFunnel();
  const timeBands = getTimeToEmploymentDistribution();
  const cohortRows = getCohortComparison();
  const gapRows = getSkillGapAnalysis();
  const distributionBars: DistributionBar[] = timeBands.map((b, i) => ({
    key: `t-${b.band}`,
    band: b.band,
    count: b.count,
    widthPct: b.widthPct,
    swatch:
      i === 0
        ? "bg-chart-1"
        : i === 1
          ? "bg-chart-2"
          : i === 2
            ? "bg-chart-3"
            : i === 3
              ? "bg-chart-4"
              : "bg-chart-7",
  }));

  return (
    <div className="space-y-8">
      {/* Skill gap analysis */}
      <Card className="lift-on-hover">
        <CardHeader>
          <CardTitle>
            <h2 className="flex items-center gap-2">
              <Scale className="h-4 w-4" aria-hidden />
              Skill gap analysis
            </h2>
          </CardTitle>
          <CardDescription>
            Where in-demand skills diverge from what graduates currently
            hold. Use this to plan next term&apos;s syllabus changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SkillGapTable rows={gapRows} />
        </CardContent>
      </Card>

      {/* Multi-year trend + Application funnel */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 lift-on-hover">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <LineChart className="h-4 w-4" aria-hidden />
                  Multi-year skill demand
                </h2>
              </CardTitle>
              <CardDescription>
                5-year trend per skill. Rising lines = topics to keep
                investing in; flat or cooling lines = candidates to retire.
              </CardDescription>
            </div>
            <Badge variant="outline">5-year window</Badge>
          </CardHeader>
          <CardContent>
            <MultiYearTrendChart signals={signals} />
          </CardContent>
        </Card>

        <Card className="lift-on-hover">
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <Filter className="h-4 w-4" aria-hidden />
                Application funnel
              </h2>
            </CardTitle>
            <CardDescription>
              Conversion across the platform&apos;s hiring pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApplicationFunnel data={funnel} />
          </CardContent>
        </Card>
      </section>

      {/* Cohort comparison */}
      <Card className="lift-on-hover">
        <CardHeader>
          <CardTitle>
            <h2 className="flex items-center gap-2">
              <Layers className="h-4 w-4" aria-hidden />
              Cohort comparison
            </h2>
          </CardTitle>
          <CardDescription>
            Side-by-side metrics across graduating classes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CohortComparisonTable rows={cohortRows} />
        </CardContent>
      </Card>

      {/* Verification + Time-to-employment */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 lift-on-hover">
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" aria-hidden />
                Verification &amp; dispute analytics
              </h2>
            </CardTitle>
            <CardDescription>
              Pipeline throughput and where disputes concentrate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VerificationAnalyticsPanel />
          </CardContent>
        </Card>

        <Card className="lift-on-hover">
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <Timer className="h-4 w-4" aria-hidden />
                Time to employment
              </h2>
            </CardTitle>
            <CardDescription>
              How many weeks from graduation to first offer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DistributionBars bars={distributionBars} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}