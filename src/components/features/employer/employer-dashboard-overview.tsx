import {
  BarChart3,
  BellRing,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileCheck2,
  MapPin,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import {
  employerActivity,
  employerCompany,
  employerNotifications,
  employerStats,
  openRoles,
  recruitmentPipeline,
  shortlistedCandidates,
  upcomingInterviews,
} from "@/data/employer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STAT_ICONS = {
  openRoles: BriefcaseBusiness,
  activeApplicants: UsersRound,
  interviews: CalendarClock,
  offers: FileCheck2,
};

const largestPipelineCount = Math.max(
  ...recruitmentPipeline.map((stage) => stage.count)
);

export function EmployerDashboardOverview() {
  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Employer dashboard
          </p>
          <h1>Good morning, {employerCompany.name}</h1>
          <p className="text-muted-foreground">
            Keep your hiring pipeline moving with a clear view of roles and
            people.
          </p>
        </div>
        <Button asChild>
          <Link href="/employer/jobs">Post a job</Link>
        </Button>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {employerStats.map((stat) => {
          const Icon = STAT_ICONS[stat.id];

          return (
            <Card key={stat.id} className="lift-on-hover">
              <CardContent className="space-y-3 p-5 sm:p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
                  {stat.value}
                </p>
                <div>
                  <p className="text-sm font-medium">{stat.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {stat.delta}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" aria-hidden />
                  Recruitment pipeline
                </h2>
              </CardTitle>
              <CardDescription>
                83 active candidates across your open roles.
              </CardDescription>
            </div>
            <Badge variant="secondary">This month</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {recruitmentPipeline.map((item) => (
              <div key={item.stage} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.stage}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {item.count} candidates
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground/80"
                    style={{ width: `${(item.count / largestPipelineCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" aria-hidden />
                Hiring pulse
              </h2>
            </CardTitle>
            <CardDescription>Today&apos;s highest-priority signals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Next interview
              </p>
              <p className="mt-1 text-sm font-medium">
                {upcomingInterviews[0].candidate}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {upcomingInterviews[0].day} · {upcomingInterviews[0].time}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Highest volume role
              </p>
              <p className="mt-1 text-sm font-medium">{openRoles[0].title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {openRoles[0].applications} applications · {openRoles[0].inProgress} in progress
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p className="text-xs text-muted-foreground">
                3 candidates are waiting for interview feedback before the
                next stage can begin.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <CardTitle>
              <h2>Shortlisted candidates</h2>
            </CardTitle>
            <Button asChild variant="ghost" size="sm"><Link href="/employer/candidates">View all</Link></Button>
          </CardHeader>
          <CardContent className="-mt-3 pb-0 text-sm text-muted-foreground">The people closest to a hiring decision right now.</CardContent>
          <CardContent className="space-y-3">
            {shortlistedCandidates.map((candidate) => (
              <div
                key={candidate.name}
                className="lift-on-hover rounded-lg border bg-card p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <Badge
                    variant="secondary"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    aria-hidden
                  >
                    {candidate.initials}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{candidate.name}</p>
                      <Badge
                        variant={candidate.stage === "Offer" ? "secondary" : "outline"}
                      >
                        {candidate.stage}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {candidate.role} · {candidate.experience}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {candidate.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-[10px]">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 text-left sm:text-right">
                    <p className="text-2xl font-semibold tabular-nums leading-none">
                      {candidate.fit}%
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Role fit
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4" aria-hidden />
                Upcoming interviews
              </h2>
            </CardTitle>
            <Button asChild variant="ghost" size="sm"><Link href="/employer/interviews">View schedule</Link></Button>
          </CardHeader>
          <CardContent className="-mt-3 pb-0 text-sm text-muted-foreground">Your next scheduled conversations.</CardContent>
          <CardContent className="space-y-3">
            {upcomingInterviews.map((interview) => (
              <div key={interview.candidate} className="rounded-lg border bg-card p-3">
                <p className="text-sm font-medium">{interview.candidate}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {interview.role}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                  <span>{interview.day} · {interview.time}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {interview.interviewer}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <CardTitle>
              <h2>Active roles</h2>
            </CardTitle>
            <CardDescription>
              See where your hiring demand and candidate flow are strongest.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {openRoles.map((role) => (
              <div
                key={role.title}
                className="lift-on-hover flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <BriefcaseBusiness className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{role.title}</p>
                    <Badge variant={role.status === "Open" ? "secondary" : "outline"}>
                      {role.status}
                    </Badge>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" aria-hidden />
                    {role.location}
                  </p>
                </div>
                <div className="flex gap-5 text-left sm:text-right">
                  <div>
                    <p className="text-xl font-semibold tabular-nums">{role.applications}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Applications</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold tabular-nums">{role.inProgress}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">In progress</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Recent activity</h2>
              </CardTitle>
              <CardDescription>Latest movement in your pipeline.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {employerActivity.map((activity) => (
                  <li key={activity} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <p className="text-sm">{activity}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <BellRing className="h-4 w-4" aria-hidden />
                  Notifications
                </h2>
            </CardTitle>
            <Button asChild variant="ghost" size="sm"><Link href="/employer/notifications">View all</Link></Button>
          </CardHeader>
          <CardContent className="-mt-3 pb-0 text-sm text-muted-foreground">Items that need attention soon.</CardContent>
            <CardContent>
              <ul className="space-y-3">
                {employerNotifications.map((notification) => (
                  <li key={notification} className="flex items-start gap-3 text-sm">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-foreground/60" />
                    {notification}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
