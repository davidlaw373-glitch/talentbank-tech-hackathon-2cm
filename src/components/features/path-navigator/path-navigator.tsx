"use client";

import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Compass,
  GraduationCap,
  Layers,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PageHeading } from "@/components/common/page-heading";
import { useToast } from "@/components/common/toast";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { getTrending } from "@/data/market-signals";

type Path = {
  id: string;
  label: string;
  nickname: string;
  icon: LucideIcon;
  from: string;
  to: string;
  skills: string[];
  months: number;
  match: number;
  roadmapItems: number;
};

const PATHS: Path[] = [
  {
    id: "graduate",
    label: "Graduate",
    nickname: "The Graduate",
    icon: GraduationCap,
    from: "Final-year student or new graduate",
    to: "Mid-level IC",
    skills: ["System design basics", "Code review etiquette", "Production debugging"],
    months: 14,
    match: 88,
    roadmapItems: 24,
  },
  {
    id: "switcher",
    label: "Switcher",
    nickname: "The Switcher",
    icon: Compass,
    from: "Domain expert, new to target role",
    to: "Junior IC in target role",
    skills: ["Foundational skills", "Project portfolio", "Targeted interview prep"],
    months: 9,
    match: 76,
    roadmapItems: 18,
  },
  {
    id: "veteran",
    label: "Veteran",
    nickname: "The Veteran",
    icon: TrendingUp,
    from: "Senior IC (5+ yrs)",
    to: "Staff IC / Specialist",
    skills: ["Cross-team influence", "Mentorship", "System architecture"],
    months: 20,
    match: 92,
    roadmapItems: 32,
  },
  {
    id: "leader",
    label: "Leader",
    nickname: "The Leader",
    icon: Users,
    from: "Senior IC / Lead",
    to: "Engineering Manager",
    skills: ["People management", "Roadmap planning", "Hiring"],
    months: 9,
    match: 81,
    roadmapItems: 21,
  },
];

const FEATURED_TRENDS = (() => {
  return getTrending(3);
})();

function SummaryStat({
  label,
  value,
  suffix,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="lift-on-hover">
      <CardContent className="space-y-2 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <Icon aria-hidden className="h-5 w-5" />
        </div>
        <p className="text-3xl font-semibold tabular-nums leading-none">
          {value}
          {suffix ?? ""}
        </p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function PathPanel({
  path,
  isGoal,
  onToggleGoal,
  onRoadmap,
}: {
  path: Path;
  isGoal: boolean;
  onToggleGoal: () => void;
  onRoadmap: () => void;
}) {
  const Icon = path.icon;
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      {/* Where you are / Where you're going */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>
            <h3 className="flex items-center gap-2">
              <Icon aria-hidden className="h-4 w-4" />
              The bridge
            </h3>
          </CardTitle>
          <CardDescription>
            Your snapshot for the {path.nickname} path.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
            <div className="rounded-lg border bg-background p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Where you are
              </p>
              <p className="mt-1.5 text-sm font-medium">{path.from}</p>
            </div>
            <div className="flex items-center justify-center sm:px-2" aria-hidden>
              <svg
                width="64"
                height="24"
                viewBox="0 0 64 24"
                fill="none"
                className="text-foreground/80"
              >
                <line
                  x1="2"
                  y1="12"
                  x2="54"
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeDasharray="2 3"
                />
                <path
                  d="M52 6 L60 12 L52 18"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <div className="rounded-lg border bg-foreground p-4 text-background">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                Where you&apos;re going
              </p>
              <p className="mt-1.5 text-sm font-medium">{path.to}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills to bridge */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            <h3>Skills to bridge</h3>
          </CardTitle>
          <CardDescription>
            Focus areas that move you along this path.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {path.skills.map((skill) => (
              <Badge key={skill} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BookOpen aria-hidden className="h-3.5 w-3.5" />
            Curated from your profile and live job postings.
          </div>
        </CardContent>
      </Card>

      {/* Months + AI match */}
      <Card>
        <CardHeader>
          <CardTitle>
            <h3>Estimated time</h3>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-4xl font-semibold tabular-nums leading-none">
            {path.months}
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              months
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            At a steady 8–10 hours a week of focused learning.
          </p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            <h3>AI match for you</h3>
          </CardTitle>
          <CardDescription>
            Based on your current skills, history, and target role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold tabular-nums leading-none">
              {path.match}
            </span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-chart-1"
              style={{ width: `${path.match}%` }}
              aria-hidden
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Layers aria-hidden className="h-3.5 w-3.5" />
            Updated against the latest market data.
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 lg:flex lg:items-center lg:justify-between">
        <CardContent className="flex w-full flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">
              Ready to lock in your roadmap?
            </p>
            <p className="text-xs text-muted-foreground">
              We&apos;ll spin up a personalised plan with weekly milestones.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={isGoal ? "secondary" : "outline"}
              aria-pressed={isGoal}
              onClick={onToggleGoal}
            >
              {isGoal ? "I'm following this" : "Mark as my goal"}
            </Button>
            <Button onClick={onRoadmap}>
              Get my roadmap
              <ArrowRight aria-hidden />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PathNavigator() {
  const { push } = useToast();
  const [goalPathId, setGoalPathId] = useState<string | null>(null);

  const toggleGoal = (path: Path) => {
    const willFollow = goalPathId !== path.id;
    setGoalPathId(willFollow ? path.id : null);
    push({
      title: willFollow ? `Following ${path.nickname}` : `Stopped following ${path.nickname}`,
      description: path.label,
      tone: willFollow ? "success" : "info",
    });
  };

  return (
    <div className="space-y-8">
      <PageHeading
        title="Career Path Navigator"
        description="Pick where you are today and we'll map the skills, time, and AI match to your next role."
        action={
          <Button
            variant="outline"
            onClick={() =>
              push({
                title: "Pulled latest market signals",
                tone: "success",
              })
            }
          >
            <RefreshCw aria-hidden />
            Refresh from live market
          </Button>
        }
      />

      {/* Stat row */}
      <section
        aria-label="Path navigator summary"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
      >
        <SummaryStat
          label="Skills to learn"
          value={PATHS.reduce((acc, p) => acc + p.skills.length, 0) / PATHS.length}
          suffix=""
          icon={BookOpen}
        />
        <SummaryStat
          label="Months to bridge"
          value={Math.round(
            PATHS.reduce((acc, p) => acc + p.months, 0) / PATHS.length
          )}
          icon={TrendingUp}
        />
        <SummaryStat
          label="AI match"
          value={Math.round(
            PATHS.reduce((acc, p) => acc + p.match, 0) / PATHS.length
          )}
          suffix="/100"
          icon={Sparkles}
        />
        <SummaryStat
          label="Roadmap items"
          value={PATHS.reduce((acc, p) => acc + p.roadmapItems, 0)}
          icon={Layers}
        />
      </section>

      {/* Tabs */}
      <Tabs defaultValue="veteran" className="space-y-4">
        <TabsList aria-label="Career paths">
          {PATHS.map((p) => (
            <TabsTrigger key={p.id} value={p.id}>
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {PATHS.map((p) => (
          <TabsContent key={p.id} value={p.id}>
            <PathPanel
              path={p}
              isGoal={goalPathId === p.id}
              onToggleGoal={() => toggleGoal(p)}
              onRoadmap={() =>
                push({
                  title: "Roadmap saved to your profile",
                  description: p.nickname,
                  tone: "success",
                })
              }
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Live market signals */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <TrendingUp aria-hidden className="h-4 w-4" />
                Live market signals
              </h2>
            </CardTitle>
            <CardDescription>
              Skill demand shifts that may change your roadmap.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {FEATURED_TRENDS.map((trend) => (
                <div
                  key={trend.skill}
                  className="lift-on-hover flex items-center justify-between rounded-lg border bg-card p-4"
                >
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {trend.skill}
                    </p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums leading-none">
                      +{trend.delta}%
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {trend.openings} open roles this quarter
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary">Trending</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        push({
                          title: `Exploring ${trend.skill}`,
                          tone: "info",
                        })
                      }
                    >
                      Explore {trend.skill}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}