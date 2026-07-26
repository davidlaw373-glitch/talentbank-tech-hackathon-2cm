import {
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  Clock,
  GraduationCap,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import {
  employmentOutcomes,
  getCohortComparison,
  getVerificationAnalytics,
  universityProfile,
} from "@/lib/university-helpers";
import { AnimatedCounter } from "@/components/common/animated-counter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type Delta = {
  value: number;
  positive: boolean;
  /** Short qualifier shown next to the arrow (e.g. "YoY", "vs target"). */
  qualifier: string;
  /** When true, render a steady-state pill rather than an arrow. */
  steady?: boolean;
};

type Kpi = {
  label: string;
  value: number;
  prefix: string;
  suffix: string;
  swatch: string;
  Icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  delta: Delta;
};

/** Parse "RM 4,800 / mo" → 4800 so we can compare cohorts in absolute units. */
function parseSalaryToNumber(salary: string): number {
  const match = salary.match(/([\d,]+)/);
  if (!match) return 0;
  return Number(match[1].replace(/,/g, ""));
}

/**
 * YoY deltas derived from the cohort comparison. Latest cohort is compared
 * against the cohort immediately before it. With only one cohort we fall
 * back to a 0% delta so the tile still renders cleanly.
 */
function buildKpis(): Kpi[] {
  const cohorts = [...getCohortComparison()].sort((a, b) =>
    a.cohort.localeCompare(b.cohort),
  );
  const latest = cohorts[cohorts.length - 1];
  const prev = cohorts[cohorts.length - 2];

  const employmentDelta = latest && prev ? latest.employmentRate - prev.employmentRate : 0;
  const latestSalary = latest ? parseSalaryToNumber(latest.avgSalary) : 0;
  const prevSalary = prev ? parseSalaryToNumber(prev.avgSalary) : 0;
  const salaryDelta = prevSalary
    ? Math.round(((latestSalary - prevSalary) / prevSalary) * 100)
    : 0;
  const verification = getVerificationAnalytics();
  const passRateDelta = verification.passRate - 70; // 70% target

  const totalGrads = employmentOutcomes.reduce((sum, c) => sum + c.total, 0);

  return [
    {
      label: "Employment rate",
      value: universityProfile.employmentRate,
      prefix: "",
      suffix: "%",
      swatch: "bg-highlight-soft",
      Icon: Briefcase,
      delta: {
        value: employmentDelta,
        positive: employmentDelta >= 0,
        qualifier: "vs prior cohort",
      },
    },
    {
      label: "Median starting salary",
      value: latestSalary,
      prefix: "RM ",
      suffix: "",
      swatch: "bg-chart-1/20",
      Icon: Wallet,
      delta: {
        value: salaryDelta,
        positive: salaryDelta >= 0,
        qualifier: "YoY",
      },
    },
    {
      label: "Time to hire",
      value: universityProfile.medianTimeToHire,
      prefix: "",
      suffix: " mo",
      swatch: "bg-chart-2/20",
      Icon: Clock,
      delta: {
        value: 0,
        positive: true,
        qualifier: "months (rolling)",
        steady: true,
      },
    },
    {
      label: "Verification pass rate",
      value: verification.passRate,
      prefix: "",
      suffix: "%",
      swatch: "bg-accent-soft",
      Icon: ShieldCheck,
      delta: {
        value: passRateDelta,
        positive: passRateDelta >= 0,
        qualifier: "vs 70% target",
      },
    },
    {
      label: "Graduates tracked",
      value: totalGrads,
      prefix: "",
      suffix: "",
      swatch: "bg-chart-3/20",
      Icon: GraduationCap,
      delta: {
        value: cohorts.length,
        positive: true,
        qualifier: cohorts.length === 1 ? "cohort" : "cohorts",
        steady: true,
      },
    },
  ];
}

function DeltaBadge({ delta }: { delta: Delta }) {
  if (delta.steady) {
    return (
      <Badge
        variant="outline"
        className="text-[10px] uppercase tracking-[0.18em]"
      >
        {delta.qualifier}
      </Badge>
    );
  }
  const Arrow = delta.positive ? ArrowUpRight : ArrowDownRight;
  const sign = delta.positive ? "+" : "";
  return (
    <Badge
      variant={delta.positive ? "secondary" : "outline"}
      className="gap-1 tabular-nums"
    >
      <Arrow className="h-3 w-3" aria-hidden />
      {sign}
      {delta.value}
      <span className="ml-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {delta.qualifier}
      </span>
    </Badge>
  );
}

function KpiTile({ kpi }: { kpi: Kpi }) {
  const { Icon } = kpi;
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.swatch}`}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <DeltaBadge delta={kpi.delta} />
        </div>
        <div className="text-stat">
          <AnimatedCounter
            value={kpi.value}
            prefix={kpi.prefix}
            suffix={kpi.suffix}
          />
        </div>
        <p className="text-base text-muted-foreground">{kpi.label}</p>
      </CardContent>
    </Card>
  );
}

/**
 * Five-tile KPI strip for the analytics page. Each tile shows the headline
 * number with a YoY / target delta so faculty can read trend direction at
 * a glance without leaving the overview tab.
 */
export function AnalyticsKpis() {
  const kpis = buildKpis();
  return (
    <section className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <KpiTile key={kpi.label} kpi={kpi} />
        ))}
      </div>
      {/* Hidden data export for screen readers — names every KPI in tabular form */}
      <table className="sr-only">
        <caption>University KPI summary</caption>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {kpis.map((kpi) => (
            <tr key={kpi.label}>
              <td>{kpi.label}</td>
              <td>{`${kpi.prefix}${kpi.value.toLocaleString()}${kpi.suffix}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}