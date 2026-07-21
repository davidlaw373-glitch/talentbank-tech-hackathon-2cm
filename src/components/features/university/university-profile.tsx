import {
  BadgeCheck,
  BriefcaseBusiness,
  GraduationCap,
  MapPin,
  School,
  Sparkles,
} from "lucide-react";

import {
  employmentOutcomes,
  graduates,
  universityProfile,
} from "@/data/university";
import { calculateEmploymentMetrics } from "@/lib/university-metrics";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EmploymentStatus } from "@/types/university";

const employmentMetrics = calculateEmploymentMetrics(employmentOutcomes);
const outcomeOrder: EmploymentStatus[] = [
  "Employed",
  "Seeking",
  "Further study",
  "Not seeking",
  "Unknown",
];
const outcomeDistribution = outcomeOrder.map((status) => ({
  status,
  count: employmentOutcomes.filter((outcome) => outcome.status === status)
    .length,
}));

export function UniversityProfile() {
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Public university profile
        </p>
        <h1>Show graduates where their evidence comes from</h1>
        <p className="max-w-2xl text-muted-foreground">
          A privacy-safe view of your institution, areas of expertise, and
          aggregate graduate outcomes.
        </p>
      </section>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-muted/40 p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-foreground text-xl font-semibold text-background"
                aria-hidden
              >
                {universityProfile.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    {universityProfile.name}
                  </h2>
                  {universityProfile.verified && (
                    <Badge variant="secondary" className="gap-1">
                      <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                      Verified institution
                    </Badge>
                  )}
                </div>
                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" aria-hidden />
                  {universityProfile.location}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        aria-label="Aggregate graduate outcomes"
      >
        <ProfileStatistic
          icon={GraduationCap}
          label="Graduates tracked"
          value={graduates.length}
          detail="Across published cohorts"
        />
        <ProfileStatistic
          icon={BriefcaseBusiness}
          label="Employment rate"
          value={`${employmentMetrics.employmentRate}%`}
          detail="Among graduates in the labour force"
        />
        <ProfileStatistic
          icon={BadgeCheck}
          label="Outcome coverage"
          value={`${employmentMetrics.coverageRate}%`}
          detail={`${employmentMetrics.knownOutcomes} of ${employmentOutcomes.length} outcomes reported`}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <School className="h-4 w-4" aria-hidden />
                Faculties
              </h2>
            </CardTitle>
            <CardDescription>
              Academic areas represented in this public profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {universityProfile.faculties.map((faculty) => (
                <li
                  key={faculty}
                  className="rounded-lg border bg-card p-3 text-sm font-medium"
                >
                  {faculty}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" aria-hidden />
                Specialisms
              </h2>
            </CardTitle>
            <CardDescription>
              Fields where the institution is building recognised expertise.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {universityProfile.specialisms.map((specialism) => (
              <Badge key={specialism} variant="secondary">
                {specialism}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Graduate outcome mix</h2>
          </CardTitle>
          <CardDescription>
            Aggregated destination data with no individual graduate records.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {outcomeDistribution.map(({ status, count }) => {
            const percentage = Math.round(
              (count / employmentOutcomes.length) * 100
            );

            return (
              <div key={status} className="space-y-2">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium">{status}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {count} {count === 1 ? "graduate" : "graduates"} {"\u00B7"}{" "}
                    {percentage}%
                  </span>
                </div>
                <div
                  className="h-2.5 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-label={`${status} graduate outcomes`}
                  aria-valuemin={0}
                  aria-valuemax={employmentOutcomes.length}
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
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileStatistic({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof GraduationCap;
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
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
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
