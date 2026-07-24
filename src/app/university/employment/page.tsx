import {
  ArrowUpRight,
  Briefcase,
  Building2,
  GraduationCap,
  UserSearch,
} from "lucide-react";

import { employmentOutcomes, skillDemand } from "@/lib/university-helpers";
import type { EmploymentRecord } from "@/types/university";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeading } from "@/components/common/page-heading";
import {
  EmploymentExportButton,
  SkillDemandRows,
} from "@/components/features/university/employment-interactions";

function pct(part: number, total: number) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

function StatTile({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 p-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
          <Icon className="h-4 w-4" aria-hidden />
        </div>
        <div className="text-3xl font-semibold tabular-nums">{value}</div>
        <p className="text-base text-muted-foreground">{label}</p>
        {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function OutcomeBar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percent = pct(value, total);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-base">{label}</p>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground tabular-nums">
            {value.toLocaleString()} of {total.toLocaleString()}
          </span>
          <span className="font-semibold tabular-nums">{percent}%</span>
        </div>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground animate-progress-x"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function CohortDashboard({ cohort }: { cohort: EmploymentRecord }) {
  const employedPct = pct(cohort.employed, cohort.total);
  const gradPct = pct(cohort.inGradSchool, cohort.total);
  const seekingPct = pct(cohort.seeking, cohort.total);
  const topSkills = [...skillDemand]
    .sort((a, b) => b.openings - a.openings)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatTile
          label="Total graduates"
          value={cohort.total.toLocaleString()}
          icon={GraduationCap}
        />
        <StatTile
          label="Employed"
          value={cohort.employed.toLocaleString()}
          icon={Briefcase}
          hint={`${employedPct}% of cohort`}
        />
        <StatTile
          label="In grad school"
          value={cohort.inGradSchool.toLocaleString()}
          icon={GraduationCap}
          hint={`${gradPct}% of cohort`}
        />
        <StatTile
          label="Seeking"
          value={cohort.seeking.toLocaleString()}
          icon={UserSearch}
          hint={`${seekingPct}% of cohort`}
        />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Outcomes breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <h3>Outcomes breakdown</h3>
            </CardTitle>
            <CardDescription>
              How graduates from this cohort landed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <OutcomeBar
              label="Employed"
              value={cohort.employed}
              total={cohort.total}
            />
            <OutcomeBar
              label="In grad school"
              value={cohort.inGradSchool}
              total={cohort.total}
            />
            <OutcomeBar
              label="Seeking"
              value={cohort.seeking}
              total={cohort.total}
            />
          </CardContent>
        </Card>

        {/* Average salary */}
        <Card className="lift-on-hover">
          <CardHeader>
            <CardTitle>
              <h3>Average starting salary</h3>
            </CardTitle>
            <CardDescription>
              Reported across all employed graduates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-4xl font-semibold tabular-nums">
              {cohort.avgSalary}
            </div>
            <Badge variant="secondary">
              <ArrowUpRight className="h-3 w-3" aria-hidden />
              +3.2% vs prior cohort
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Top employer + Top role */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="lift-on-hover">
          <CardHeader>
            <CardTitle>
              <h3 className="flex items-center gap-2">
                <Building2 className="h-4 w-4" aria-hidden />
                Top employer
              </h3>
            </CardTitle>
            <CardDescription>
              Most hired organization from this cohort.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-semibold">{cohort.topEmployer}</p>
            <p className="text-sm text-muted-foreground">
              Hired {Math.max(
                4,
                Math.round(cohort.employed * 0.08)
              )} graduates from this cohort.
            </p>
          </CardContent>
        </Card>
        <Card className="lift-on-hover">
          <CardHeader>
            <CardTitle>
              <h3 className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" aria-hidden />
                Top role
              </h3>
            </CardTitle>
            <CardDescription>
              Most common job title landed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-semibold">{cohort.topRole}</p>
            <p className="text-sm text-muted-foreground">
              Median time to offer: 4.2 months.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Skill demand */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-subheading">Latest skill demand</h3>
            <p className="text-sm text-muted-foreground">Roles open to this cohort right now.</p>
          </div>
          <Badge variant="outline">{topSkills.length} skills tracked</Badge>
        </div>
        <SkillDemandRows skills={topSkills} />
      </section>
    </div>
  );
}

export default function UniversityEmploymentPage() {
  return (
    <div className="space-y-8">
      <PageHeading
        title="Employment tracking"
        description="Cohort-by-cohort outcomes from graduation to first role."
        action={<EmploymentExportButton />}
      />

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Cohort</p>
        <Tabs defaultValue={String(employmentOutcomes[0].id)}>
          <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-muted p-1.5">
            {employmentOutcomes.map((c) => (
              <TabsTrigger
                key={c.id}
                value={String(c.id)}
                className="text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {c.cohort}
              </TabsTrigger>
            ))}
          </TabsList>

          {employmentOutcomes.map((c) => (
            <TabsContent key={c.id} value={String(c.id)} className="mt-6">
              <CohortDashboard cohort={c} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}