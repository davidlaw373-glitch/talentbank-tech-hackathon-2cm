"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CircleHelp,
  ListChecks,
  PencilLine,
  UsersRound,
} from "lucide-react";

import { useUniversityRole } from "@/components/features/university/university-role-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { employmentOutcomes, graduates } from "@/data/university";
import { getIndustryInsight } from "@/lib/employment-industry";
import { calculateEmploymentMetrics } from "@/lib/university-metrics";
import type {
  EmploymentOutcome,
  EmploymentStatus,
} from "@/types/university";

const employmentStatuses: EmploymentStatus[] = [
  "Employed",
  "Seeking",
  "Further study",
  "Not seeking",
  "Unknown",
];

type EmploymentDraft = {
  graduateId: string;
  status: EmploymentStatus;
  employer: string;
  jobTitle: string;
  industry: string;
  employedAt: string;
  daysToEmployment: string;
};

const emptyDraft: EmploymentDraft = {
  graduateId: graduates[0]?.id ?? "",
  status: "Unknown",
  employer: "",
  jobTitle: "",
  industry: "",
  employedAt: "",
  daysToEmployment: "",
};

type DistributionItem = { label: string; count: number; detail?: string };

function getOutcomeForGraduate(
  graduateId: string,
  outcomes: EmploymentOutcome[]
): EmploymentOutcome {
  return (
    outcomes.find((outcome) => outcome.graduateId === graduateId) ?? {
      graduateId,
      status: "Unknown",
    }
  );
}

function draftFromOutcome(outcome: EmploymentOutcome): EmploymentDraft {
  return {
    graduateId: outcome.graduateId,
    status: outcome.status,
    employer: outcome.employer ?? "",
    jobTitle: outcome.jobTitle ?? "",
    industry: outcome.industry ?? "",
    employedAt: outcome.employedAt ?? "",
    daysToEmployment:
      outcome.daysToEmployment === undefined ? "" : String(outcome.daysToEmployment),
  };
}

function statusVariant(status: EmploymentStatus) {
  if (status === "Employed") return "secondary" as const;
  if (status === "Seeking") return "outline" as const;
  return "outline" as const;
}

function distributionFromValues(
  values: Array<string | undefined>,
  limit = 5
): DistributionItem[] {
  const counts = new Map<string, number>();
  values.forEach((value) => {
    if (value?.trim()) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  });

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
    .slice(0, limit);
}

function jobFamily(jobTitle: string | undefined) {
  const normalizedTitle = jobTitle?.toLocaleLowerCase() ?? "";
  if (normalizedTitle.includes("analyst")) return "Analytics";
  if (normalizedTitle.includes("developer") || normalizedTitle.includes("engineer")) {
    return "Engineering";
  }
  return normalizedTitle ? "Other professional roles" : undefined;
}

function labelledRateBar({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="space-y-1.5" key={label}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="shrink-0 text-muted-foreground">{detail}</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label={`${label}: ${detail}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <div className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function DistributionBars({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: DistributionItem[];
}) {
  const largestCount = Math.max(...items.map((item) => item.count), 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recorded placements yet.</p>
        ) : (
          items.map((item) =>
            labelledRateBar({
              label: item.label,
              value: Math.round((item.count / largestCount) * 100),
              detail: item.detail ?? `${item.count} graduate${item.count === 1 ? "" : "s"}`,
            })
          )
        )}
      </CardContent>
    </Card>
  );
}

export function EmploymentTracking() {
  const { role } = useUniversityRole();
  const [outcomes, setOutcomes] = useState<EmploymentOutcome[]>(employmentOutcomes);
  const [draft, setDraft] = useState<EmploymentDraft>(() =>
    draftFromOutcome(getOutcomeForGraduate(emptyDraft.graduateId, employmentOutcomes))
  );
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const submissionLock = useRef(false);

  const isCareers = role === "careers";
  const metrics = useMemo(() => calculateEmploymentMetrics(outcomes), [outcomes]);
  const outcomesByGraduateId = useMemo(
    () => new Map(outcomes.map((outcome) => [outcome.graduateId, outcome])),
    [outcomes]
  );

  const employedOutcomes = useMemo(
    () => outcomes.filter((outcome) => outcome.status === "Employed"),
    [outcomes]
  );
  const industryInsight = useMemo(
    () => getIndustryInsight(employedOutcomes.map((outcome) => outcome.industry)),
    [employedOutcomes]
  );
  const industryDistribution = industryInsight.visibleDistribution;
  const jobFamilyDistribution = useMemo(
    () => distributionFromValues(employedOutcomes.map((outcome) => jobFamily(outcome.jobTitle))),
    [employedOutcomes]
  );
  const employerDistribution = useMemo(
    () => distributionFromValues(employedOutcomes.map((outcome) => outcome.employer)),
    [employedOutcomes]
  );

  const classTrend = useMemo(() => {
    return [...new Set(graduates.map((graduate) => graduate.graduationYear))]
      .sort((left, right) => left - right)
      .map((year) => {
        const cohort = graduates.filter((graduate) => graduate.graduationYear === year);
        const cohortOutcomes = cohort.map((graduate) =>
          getOutcomeForGraduate(graduate.id, outcomes)
        );
        const cohortMetrics = calculateEmploymentMetrics(cohortOutcomes);
        return {
          label: `Class of ${year}`,
          value: cohortMetrics.employmentRate,
          detail: `${cohortMetrics.employed}/${cohortMetrics.laborForce} in labour force`,
        };
      });
  }, [outcomes]);

  const programmeComparison = useMemo(() => {
    return [...new Set(graduates.map((graduate) => graduate.programme))]
      .sort()
      .map((programme) => {
        const programmeGraduates = graduates.filter((graduate) => graduate.programme === programme);
        const programmeMetrics = calculateEmploymentMetrics(
          programmeGraduates.map((graduate) => getOutcomeForGraduate(graduate.id, outcomes))
        );
        return {
          label: programme,
          value: programmeMetrics.employmentRate,
          detail: `${programmeMetrics.employed}/${programmeMetrics.laborForce} in labour force`,
        };
      });
  }, [outcomes]);

  const followUps = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return graduates.flatMap((graduate) => {
      const outcome = getOutcomeForGraduate(graduate.id, outcomes);
      if (outcome.status === "Unknown") {
        return [{ graduate, reason: "Outcome has not been confirmed" }];
      }
      if (outcome.status === "Seeking" && graduate.graduationYear <= currentYear - 2) {
        return [{ graduate, reason: "Seeking work one or more years after graduation" }];
      }
      return [];
    });
  }, [outcomes]);

  const leadingIndustry = industryInsight.leadingIndustry;

  function chooseGraduate(graduateId: string) {
    setDraft(draftFromOutcome(getOutcomeForGraduate(graduateId, outcomes)));
    setNotice("");
  }

  function chooseStatus(status: EmploymentStatus) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      status,
      ...(status === "Employed"
        ? {}
        : {
            employer: "",
            jobTitle: "",
            industry: "",
            employedAt: "",
            daysToEmployment: "",
          }),
    }));
    setNotice("");
  }

  function updateDraft<Key extends keyof EmploymentDraft>(key: Key, value: EmploymentDraft[Key]) {
    setDraft((currentDraft) => ({ ...currentDraft, [key]: value }));
  }

  function saveOutcome(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isCareers || submissionLock.current) return;

    if (
      draft.status === "Employed" &&
      (!draft.employer.trim() ||
        !draft.jobTitle.trim() ||
        !draft.industry.trim() ||
        !draft.employedAt ||
        draft.daysToEmployment.trim() === "" ||
        !Number.isFinite(Number(draft.daysToEmployment)) ||
        Number(draft.daysToEmployment) < 0)
    ) {
      setNotice("Complete every employment detail before saving an employed outcome.");
      return;
    }

    submissionLock.current = true;
    setIsSaving(true);
    const nextOutcome: EmploymentOutcome =
      draft.status === "Employed"
        ? {
            graduateId: draft.graduateId,
            status: draft.status,
            employer: draft.employer.trim(),
            jobTitle: draft.jobTitle.trim(),
            industry: draft.industry.trim(),
            employedAt: draft.employedAt,
            daysToEmployment: Number(draft.daysToEmployment),
          }
        : { graduateId: draft.graduateId, status: draft.status };

    setOutcomes((currentOutcomes) => {
      const hasExistingOutcome = currentOutcomes.some(
        (outcome) => outcome.graduateId === nextOutcome.graduateId
      );
      return hasExistingOutcome
        ? currentOutcomes.map((outcome) =>
            outcome.graduateId === nextOutcome.graduateId ? nextOutcome : outcome
          )
        : [...currentOutcomes, nextOutcome];
    });
    setNotice("Employment outcome saved. All outcome metrics have been recalculated.");

    window.setTimeout(() => {
      submissionLock.current = false;
      setIsSaving(false);
    }, 300);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Graduate outcomes
          </p>
          <h1>Employment tracking</h1>
          <p className="max-w-3xl text-muted-foreground">
            See where graduates are progressing, measure only confirmed labour-force outcomes,
            and keep follow-up work visible.
          </p>
        </div>
        <Badge variant={isCareers ? "secondary" : "outline"} className="gap-1.5 px-3 py-1.5">
          <PencilLine className="h-3.5 w-3.5" aria-hidden />
          {isCareers ? "Career Services editing" : "Registry read-only"}
        </Badge>
      </section>

      <p className="sr-only" aria-live="polite" aria-atomic="true">{notice}</p>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Employment outcome summary">
        <MetricCard
          icon={BriefcaseBusiness}
          label="Employment rate"
          value={`${metrics.employmentRate}%`}
          detail={`${metrics.employed} employed of ${metrics.laborForce} in labour force`}
        />
        <MetricCard
          icon={CalendarClock}
          label="Average time to employment"
          value={`${metrics.averageDaysToEmployment} days`}
          detail="Confirmed employed outcomes with a recorded date"
        />
        <MetricCard
          icon={CircleHelp}
          label="Unknown outcomes"
          value={String(metrics.unknown)}
          detail={`${metrics.coverageRate}% of ${outcomes.length} outcomes are known`}
        />
        <MetricCard
          icon={Building2}
          label="Leading industry"
          value={leadingIndustry.value}
          detail={leadingIndustry.detail}
        />
      </section>

      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="flex gap-3 p-4 text-sm">
          <UsersRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="font-medium">How the employment rate is calculated</p>
            <p className="mt-1 text-muted-foreground">
              Labour-force denominator: <strong>{metrics.employed} Employed + {metrics.seeking} Seeking = {metrics.laborForce}</strong> graduates.
              Unknown, Further study, and Not seeking outcomes are not treated as unemployment and are excluded from this rate. Coverage is {metrics.coverageRate}% ({metrics.knownOutcomes} known of {outcomes.length} total outcomes).
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Class trend</CardTitle>
            <CardDescription>Employment rate by graduation cohort.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {classTrend.map((item) => labelledRateBar(item))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Programme comparison</CardTitle>
            <CardDescription>Employment rate among each programme&apos;s labour force.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {programmeComparison.map((item) => labelledRateBar(item))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DistributionBars title="Industries" description="Confirmed employed graduates by industry." items={industryDistribution} />
        <DistributionBars title="Job families" description="Job titles grouped into comparable role families." items={jobFamilyDistribution} />
        <DistributionBars title="Leading employers" description="Employers reported by confirmed employed graduates." items={employerDistribution} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListChecks className="h-5 w-5" aria-hidden />
              Follow-up queue
            </CardTitle>
            <CardDescription>Unknown outcomes and long-term job seekers need a human next step.</CardDescription>
          </CardHeader>
          <CardContent>
            {followUps.length === 0 ? (
              <p className="text-sm text-muted-foreground">No graduates currently need outcome follow-up.</p>
            ) : (
              <ul className="space-y-3" aria-label="Graduates needing employment follow-up">
                {followUps.map(({ graduate, reason }) => (
                  <li key={graduate.id} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{graduate.name}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{graduate.programme} · Class of {graduate.graduationYear}</p>
                    </div>
                    <span className="max-w-xs text-sm text-muted-foreground">{reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Update an outcome</CardTitle>
            <CardDescription>
              {isCareers
                ? "Record one exact current status for a graduate."
                : "Outcomes remain visible for Registry, but cannot be changed here."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isCareers ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                Career Services access is required to update employment outcomes.
              </p>
            ) : (
              <form className="space-y-4" onSubmit={saveOutcome}>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="employment-graduate">Graduate</label>
                  <Select value={draft.graduateId} onValueChange={chooseGraduate}>
                    <SelectTrigger id="employment-graduate">
                      <SelectValue placeholder="Select a graduate" />
                    </SelectTrigger>
                    <SelectContent>
                      {graduates.map((graduate) => (
                        <SelectItem key={graduate.id} value={graduate.id}>
                          {graduate.name} · {graduate.programme}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="employment-status">Current employment status</label>
                  <Select value={draft.status} onValueChange={(value) => chooseStatus(value as EmploymentStatus)}>
                    <SelectTrigger id="employment-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentStatuses.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {draft.status === "Employed" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Employer" id="employment-employer">
                      <Input id="employment-employer" value={draft.employer} onChange={(event) => updateDraft("employer", event.target.value)} required />
                    </Field>
                    <Field label="Job title" id="employment-job-title">
                      <Input id="employment-job-title" value={draft.jobTitle} onChange={(event) => updateDraft("jobTitle", event.target.value)} required />
                    </Field>
                    <Field label="Industry" id="employment-industry">
                      <Input id="employment-industry" value={draft.industry} onChange={(event) => updateDraft("industry", event.target.value)} required />
                    </Field>
                    <Field label="Employment date" id="employment-date">
                      <Input id="employment-date" type="date" value={draft.employedAt} onChange={(event) => updateDraft("employedAt", event.target.value)} required />
                    </Field>
                    <Field label="Days to employment" id="employment-days">
                      <Input id="employment-days" type="number" min="0" step="1" value={draft.daysToEmployment} onChange={(event) => updateDraft("daysToEmployment", event.target.value)} required />
                    </Field>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Selecting any status other than Employed clears employer, role, industry, date, and time-to-employment fields.
                </p>
                {notice && <p className="text-sm text-muted-foreground" role="status">{notice}</p>}
                <Button type="submit" className="w-full" disabled={isSaving}>
                  <PencilLine aria-hidden />
                  {isSaving ? "Saving outcome…" : "Save employment outcome"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="recorded-outcomes-heading">
        <h2 id="recorded-outcomes-heading" className="mb-3 text-lg font-semibold">Recorded outcomes</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {graduates.map((graduate) => {
            const outcome = outcomesByGraduateId.get(graduate.id) ?? { graduateId: graduate.id, status: "Unknown" as const };
            return (
              <Card key={graduate.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{graduate.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{graduate.programme}</p>
                    </div>
                    <Badge variant={statusVariant(outcome.status)}>{outcome.status}</Badge>
                  </div>
                  {outcome.status === "Employed" ? (
                    <p className="mt-3 text-sm text-muted-foreground">{outcome.jobTitle} at {outcome.employer}</p>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">No employment-only details recorded.</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <Icon className="h-4 w-4 text-primary" aria-hidden />
        <p className="mt-3 text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}
