import { BarChart3, BriefcaseBusiness, Lightbulb, Sparkles, Target } from "lucide-react";

import { UniversityInsightsRoleCopy } from "@/components/features/university/university-insights-role-copy";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { curriculumInsights, industryDemand } from "@/data/university";

type RankedItem = {
  label: string;
  detail: string;
  value: number;
};

function rankedDemandByIndustry(): RankedItem[] {
  const demandByIndustry = new Map<string, number>();

  industryDemand.forEach((demand) => {
    demandByIndustry.set(
      demand.industry,
      (demandByIndustry.get(demand.industry) ?? 0) + demand.openRoles
    );
  });

  return [...demandByIndustry.entries()]
    .map(([label, value]) => ({ label, value, detail: `${value} open roles tracked` }))
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label));
}

const fastestGrowingRoles = industryDemand
  .map((demand) => ({
    label: demand.role,
    detail: `${demand.industry} - ${demand.openRoles} open roles tracked`,
    value: demand.growth,
  }))
  .sort(
    (left, right) =>
      right.value - left.value || left.label.localeCompare(right.label)
  );

const requestedSkills = industryDemand
  .map((demand) => ({
    label: demand.skill,
    detail: `${demand.role} - ${demand.industry}`,
    value: demand.openRoles,
  }))
  .sort(
    (left, right) =>
      right.value - left.value || left.label.localeCompare(right.label)
  );

const employerDemand = rankedDemandByIndustry();
const alignmentScore = Math.round(
  curriculumInsights.reduce((total, insight) => total + insight.coverage, 0) /
    Math.max(curriculumInsights.length, 1)
);
const coverageItems = curriculumInsights
  .map((insight) => ({
    label: insight.programme,
    detail: insight.title,
    value: insight.coverage,
  }))
  .sort(
    (left, right) =>
      right.value - left.value || left.label.localeCompare(right.label)
  );

function LabelledBars({ items, valueLabel }: { items: RankedItem[]; valueLabel: string }) {
  const maximum = Math.max(...items.map((item) => item.value), 1);

  return (
    <ol className="space-y-4">
      {items.map((item, index) => {
        const percentage = Math.round((item.value / maximum) * 100);

        return (
          <li key={item.label} className="space-y-2">
            <div className="flex items-start justify-between gap-4 text-sm">
              <div className="min-w-0">
                <p className="font-medium">
                  <span className="mr-2 text-xs tabular-nums text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
              <span className="shrink-0 font-semibold tabular-nums">
                {item.value}{valueLabel}
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label={`${item.label}: ${item.value}${valueLabel}`}
              aria-valuemin={0}
              aria-valuemax={maximum}
              aria-valuenow={item.value}
            >
              <div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function UniversityInsights() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" aria-hidden />
                Employer signals, made reviewable
              </h2>
            </CardTitle>
            <CardDescription>
              <UniversityInsightsRoleCopy />
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-primary/25 bg-primary/[0.04]">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Curriculum alignment</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums">{alignmentScore}%</p>
            <p className="mt-2 text-sm text-muted-foreground">Average evidence coverage across current curriculum signals.</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <InsightPanel title="Fastest-growing roles" description="Growth across tracked employer roles." icon={BriefcaseBusiness}>
          <LabelledBars items={fastestGrowingRoles} valueLabel="%" />
        </InsightPanel>
        <InsightPanel title="Most requested skills" description="Ranked by open roles requesting each skill." icon={Target}>
          <LabelledBars items={requestedSkills} valueLabel=" roles" />
        </InsightPanel>
        <InsightPanel title="Employer demand by industry" description="Open roles grouped by employer industry." icon={BarChart3}>
          <LabelledBars items={employerDemand} valueLabel=" roles" />
        </InsightPanel>
        <InsightPanel title="Graduate skill coverage" description="Evidence coverage linked to current programme signals." icon={Lightbulb}>
          <LabelledBars items={coverageItems} valueLabel="%" />
        </InsightPanel>
      </section>

      <section aria-labelledby="curriculum-insights-heading" className="space-y-4">
        <div>
          <h2 id="curriculum-insights-heading" className="text-xl font-semibold tracking-tight">Curriculum opportunities</h2>
          <p className="mt-1 text-sm text-muted-foreground">Each recommendation exposes the evidence and coverage behind the signal.</p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {curriculumInsights.map((insight) => (
            <Card key={insight.id} className="lift-on-hover">
              <CardHeader className="gap-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle><h3>{insight.title}</h3></CardTitle>
                    <CardDescription className="mt-2">Programme: {insight.programme}</CardDescription>
                  </div>
                  <Badge variant="secondary">{insight.confidence}% confidence</Badge>
                </div>
                <p className="rounded-lg border bg-muted/30 p-3 text-sm"><span className="font-medium">Change: </span>{insight.change}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Evidence</p>
                  <p className="mt-1 text-sm">{insight.evidence}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Recommendation</p>
                  <p className="mt-1 text-sm font-medium">{insight.recommendation}</p>
                </div>
                <dl className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/20 p-3 text-sm">
                  <div><dt className="text-xs text-muted-foreground">Confidence</dt><dd className="mt-1 font-semibold tabular-nums">{insight.confidence}%</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Coverage</dt><dd className="mt-1 font-semibold tabular-nums">{insight.coverage}%</dd></div>
                </dl>
                <p className="text-xs text-muted-foreground">Advisory only — curriculum changes require university review.</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function InsightPanel({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: typeof BarChart3;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle><h2 className="flex items-center gap-2"><Icon className="h-4 w-4" aria-hidden />{title}</h2></CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
