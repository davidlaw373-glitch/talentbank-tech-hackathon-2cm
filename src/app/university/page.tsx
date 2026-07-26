import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  employmentOutcomes,
  graduateRecords,
  skillDemand,
  universityDisputes,
  universityProfile,
} from "@/lib/university-helpers";
import type { VerificationRecordStatus } from "@/types/university";
import { DISPUTE_VARIANT } from "@/components/features/university/dashboard-interactions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STATUS_ORDER: VerificationRecordStatus[] = [
  "Verified",
  "Pending review",
  "Action required",
  "Rejected",
];

const STATUS_ICON: Record<VerificationRecordStatus, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  Verified: CheckCircle2,
  "Pending review": Clock,
  "Action required": AlertCircle,
  Rejected: AlertCircle,
};

// Per-status semantic swatch — verified is sage, pending is muted
// amber, action-required is highlight copper, rejected is destructive.
const STATUS_SWATCH: Record<VerificationRecordStatus, string> = {
  Verified: "bg-chart-1",
  "Pending review": "bg-chart-7",
  "Action required": "bg-highlight",
  Rejected: "bg-destructive",
};

function countByStatus() {
  const counts: Record<VerificationRecordStatus, number> = {
    Verified: 0,
    "Pending review": 0,
    "Action required": 0,
    Rejected: 0,
  };
  for (const g of graduateRecords) counts[g.status] += 1;
  return counts;
}

export default function UniversityDashboardPage() {
  const total = graduateRecords.length;
  const counts = countByStatus();
  const featuredSkills = [...skillDemand]
    .sort((a, b) => b.openings - a.openings)
    .slice(0, 4);
  const recentDisputes = universityDisputes.slice(0, 3);

  // Highest priority next-action for university faculty:
  // pending verification or open dispute counts. Pick whichever is non-zero.
  const verificationCounts = countByStatus();
  const pendingVerifications = verificationCounts["Pending review"];
  const actionRequired = verificationCounts["Action required"];
  const openDisputes = universityDisputes.filter((d) => d.status === "Open").length;
  const facultyNextAction =
    pendingVerifications > 0
      ? {
          title: `Review ${pendingVerifications} pending ${
            pendingVerifications === 1 ? "verification" : "verifications"
          }`,
          hint: `${actionRequired} ${
            actionRequired === 1 ? "item needs" : "items need"
          } action from candidates.`,
          href: "/university/verification",
          cta: "Open verification queue",
        }
      : openDisputes > 0
        ? {
            title: `Resolve ${openDisputes} open ${
              openDisputes === 1 ? "dispute" : "disputes"
            }`,
            hint: "Faculty reviewers are waiting on a decision.",
            href: "/university/disputes",
            cta: "Open disputes",
          }
        : {
            title: "All queues are clear",
            hint: "No pending verifications or open disputes right now.",
            href: "/university/verification",
            cta: "Review verification queue",
          };

  return (
    <div className="space-y-8">
      {/* Next-action prompt */}
      <Card className="lift-on-hover">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Sparkles className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Next action
              </p>
              <p className="text-sm font-medium">{facultyNextAction.title}</p>
              <p className="text-xs text-muted-foreground">
                {facultyNextAction.hint}
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href={facultyNextAction.href}>
              {facultyNextAction.cta}
              <ArrowRight />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Stat tiles */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft">
              <Users className="h-5 w-5" aria-hidden />
            </div>
            <div className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
              {universityProfile.totalStudents.toLocaleString()}
            </div>
            <p className="text-base text-muted-foreground">Total students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/20">
              <GraduationCap className="h-5 w-5" aria-hidden />
            </div>
            <div className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
              {universityProfile.activeCohorts}
            </div>
            <p className="text-base text-muted-foreground">Active cohorts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-highlight-soft">
              <Briefcase className="h-5 w-5" aria-hidden />
            </div>
            <div className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
              {universityProfile.employmentRate}%
            </div>
            <p className="text-base text-muted-foreground">Employment rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/20">
              <Clock className="h-5 w-5" aria-hidden />
            </div>
            <div className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
              {universityProfile.medianTimeToHire}
            </div>
            <p className="text-base text-muted-foreground">Median time to hire (months)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/20">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </div>
            <div className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
              {universityProfile.verifiedCredentials.toLocaleString()}
            </div>
            <p className="text-base text-muted-foreground">Verified credentials</p>
          </CardContent>
        </Card>
      </section>

      {/* Verification pipeline + Skill demand */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" aria-hidden />
                  Verification pipeline
                </h2>
              </CardTitle>
              <CardDescription>
                {total} records currently in the pipeline.
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/university/verification">
                Manage
                <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {STATUS_ORDER.map((status) => {
              const Icon = STATUS_ICON[status];
              const value = counts[status];
              const pct = total > 0 ? Math.round((value / total) * 100) : 0;
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" aria-hidden />
                      <p className="text-base">{status}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground tabular-nums">
                        {pct}%
                      </span>
                      <span className="font-semibold tabular-nums">{value}</span>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full animate-progress-x",
                        STATUS_SWATCH[status],
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" aria-hidden />
                Skill demand
              </h2>
            </CardTitle>
            <CardDescription>
              Top openings in the market right now.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {featuredSkills.map((s) => (
              <div
                key={s.skill}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="space-y-0.5">
                  <p className="text-base">{s.skill}</p>
                  <p className="text-sm text-muted-foreground">
                    {s.openings} openings
                  </p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <ArrowUpRight className="h-3 w-3" aria-hidden />
                  {s.delta}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Recent disputes */}
      <section className="space-y-3">
        <div>
          <h2 className="text-subheading">Recent disputes</h2>
          <p className="text-sm text-muted-foreground">Latest escalations awaiting faculty review.</p>
        </div>
        <ul className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border/40 bg-card">
          {recentDisputes.map((dispute) => (
            <li key={dispute.id}>
              <Link
                href={`/university/disputes/${dispute.id}`}
                aria-label={`Open ${dispute.graduateName} dispute`}
                className={cn(
                  "group flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4 transition-colors",
                  "hover:bg-accent-soft focus-visible:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-5",
                )}
              >
                <span
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground"
                >
                  {dispute.graduateInitials}
                </span>

                <div className="min-w-0 flex-1 basis-48">
                  <p className="truncate text-base font-semibold">
                    {dispute.graduateName}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {dispute.field} · {dispute.filedDate}
                  </p>
                </div>

                <div className="hidden min-w-0 flex-1 basis-48 md:block">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Claim
                  </p>
                  <p className="truncate text-sm">{dispute.claim}</p>
                </div>

                <div className="w-28 shrink-0">
                  <Badge variant={DISPUTE_VARIANT[dispute.status]}>
                    {dispute.status}
                  </Badge>
                </div>

                <ChevronRight
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Employment at a glance */}
      <section className="space-y-3">
        <div>
          <h2 className="text-subheading">Employment at a glance</h2>
          <p className="text-sm text-muted-foreground">Outcomes by cohort year.</p>
        </div>
        <ul className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border/40 bg-card">
          {employmentOutcomes.map((e) => {
            const pct = Math.round((e.employed / e.total) * 100);
            return (
              <li key={e.id}>
                <Link
                  href="/university/analytics"
                  aria-label={`Open ${e.cohort} in analytics`}
                  className={cn(
                    "group flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4 transition-colors",
                    "hover:bg-accent-soft focus-visible:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-5",
                  )}
                >
                  <span
                    aria-hidden
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted"
                  >
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </span>

                  <div className="min-w-0 flex-1 basis-48">
                    <p className="truncate text-base font-semibold">
                      {e.cohort}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {e.employed} of {e.total} employed
                    </p>
                  </div>

                  <div className="hidden min-w-0 flex-1 basis-48 md:block">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Top employer · role
                    </p>
                    <p className="truncate text-sm">
                      {e.topEmployer} · {e.topRole}
                    </p>
                  </div>

                  <div className="w-20 shrink-0 text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Employed
                    </p>
                    <p className="text-sm font-semibold tabular-nums">
                      {pct}%
                    </p>
                  </div>

                  <ChevronRight
                    aria-hidden
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}