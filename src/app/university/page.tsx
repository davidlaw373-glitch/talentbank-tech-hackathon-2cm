import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
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
import {
  DashboardBulkSyncButton,
  RecentDisputeRow,
} from "@/components/features/university/dashboard-interactions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeading } from "@/components/common/page-heading";
import { cn } from "@/lib/utils";

const STATUS_ORDER: VerificationRecordStatus[] = [
  "Verified",
  "Pending review",
  "Action required",
  "Disputed",
];

const STATUS_ICON: Record<VerificationRecordStatus, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  Verified: CheckCircle2,
  "Pending review": Clock,
  "Action required": AlertCircle,
  Disputed: AlertCircle,
};

// Per-status semantic swatch — verified is sage, pending is muted
// amber, action-required is highlight copper, disputed is destructive.
const STATUS_SWATCH: Record<VerificationRecordStatus, string> = {
  Verified: "bg-chart-1",
  "Pending review": "bg-chart-7",
  "Action required": "bg-highlight",
  Disputed: "bg-destructive",
};

function countByStatus() {
  const counts: Record<VerificationRecordStatus, number> = {
    Verified: 0,
    "Pending review": 0,
    "Action required": 0,
    Disputed: 0,
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
      <PageHeading
        title={`Welcome, ${universityProfile.institutionName}`}
        description={`${universityProfile.tagline} · Founded ${universityProfile.founded} · ${universityProfile.city}, ${universityProfile.country}`}
        action={<DashboardBulkSyncButton />}
      />

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
        <Card className="lift-on-hover">
          <CardContent className="space-y-2 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-soft">
              <Users className="h-4 w-4" aria-hidden />
            </div>
            <div className="text-3xl font-semibold tabular-nums">
              {universityProfile.totalStudents.toLocaleString()}
            </div>
            <p>Total students</p>
          </CardContent>
        </Card>
        <Card className="lift-on-hover">
          <CardContent className="space-y-2 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-chart-1/20">
              <GraduationCap className="h-4 w-4" aria-hidden />
            </div>
            <div className="text-3xl font-semibold tabular-nums">
              {universityProfile.activeCohorts}
            </div>
            <p>Active cohorts</p>
          </CardContent>
        </Card>
        <Card className="lift-on-hover">
          <CardContent className="space-y-2 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-highlight-soft">
              <Briefcase className="h-4 w-4" aria-hidden />
            </div>
            <div className="text-3xl font-semibold tabular-nums">
              {universityProfile.employmentRate}%
            </div>
            <p>Employment rate</p>
          </CardContent>
        </Card>
        <Card className="lift-on-hover">
          <CardContent className="space-y-2 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-chart-2/20">
              <Clock className="h-4 w-4" aria-hidden />
            </div>
            <div className="text-3xl font-semibold tabular-nums">
              {universityProfile.medianTimeToHire}
            </div>
            <p>Median time to hire (months)</p>
          </CardContent>
        </Card>
        <Card className="lift-on-hover">
          <CardContent className="space-y-2 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-chart-3/20">
              <ShieldCheck className="h-4 w-4" aria-hidden />
            </div>
            <div className="text-3xl font-semibold tabular-nums">
              {universityProfile.verifiedCredentials.toLocaleString()}
            </div>
            <p>Verified credentials</p>
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
                  <ShieldCheck className="h-4 w-4" aria-hidden />
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
                      <p>{status}</p>
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
                  <p>{s.skill}</p>
                  <p className="text-muted-foreground">
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
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2>Recent disputes</h2>
            <p>Latest escalations awaiting faculty review.</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/university/disputes">
              Open disputes
              <ArrowRight />
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {recentDisputes.map((dispute) => (
                <RecentDisputeRow key={dispute.id} dispute={dispute} />
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Employment at a glance */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2>Employment at a glance</h2>
            <p>Outcomes by cohort year.</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/university/employment">
              Full report
              <ArrowRight />
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cohort</TableHead>
                  <TableHead>Employed</TableHead>
                  <TableHead>Top employer</TableHead>
                  <TableHead>Top role</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {employmentOutcomes.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <p>{e.cohort}</p>
                      <p className="text-muted-foreground">
                        {e.employed} of {e.total}
                      </p>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {Math.round((e.employed / e.total) * 100)}%
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-2">
                        <Building2 className="h-4 w-4" aria-hidden />
                        {e.topEmployer}
                      </span>
                    </TableCell>
                    <TableCell>{e.topRole}</TableCell>
                    <TableCell>
                      <Button asChild variant="outline" size="icon" aria-label={`Open ${e.cohort} details`}>
                        <Link href="/university/employment">
                          <ArrowRight />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <Separator />
      <section className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted-foreground">
          {universityProfile.partnerEmployers} partner employers actively
          reviewing talent from your cohorts.
        </p>
        <Button asChild variant="outline">
          <Link href="/university/analytics">
            <FileText aria-hidden />
            View full report
          </Link>
        </Button>
      </section>
    </div>
  );
}