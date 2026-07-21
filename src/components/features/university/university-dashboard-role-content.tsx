"use client";

import Link from "next/link";
import { CalendarClock, ListTodo } from "lucide-react";

import { useUniversityRole } from "@/components/features/university/university-role-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Graduate, UniversityRole } from "@/types/university";

type UpcomingTask = Pick<Graduate, "id" | "name" | "nextAction">;

const roleActions: Record<
  UniversityRole,
  { label: string; href: string; description: string }
> = {
  careers: {
    label: "Update employment outcomes",
    href: "/university/employment",
    description: "Focus on graduate outcomes, follow-ups, and employer signals.",
  },
  registry: {
    label: "Review verification queue",
    href: "/university/verification",
    description: "Prioritise academic evidence and credential decisions.",
  },
};

export function UniversityRoleHeader({
  institutionName,
}: {
  institutionName: string;
}) {
  const { role } = useUniversityRole();
  const roleAction = roleActions[role];

  return (
    <section className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          University dashboard
        </p>
        <h1>Good morning, {institutionName}</h1>
        <p className="max-w-2xl text-muted-foreground">
          {roleAction.description}
        </p>
      </div>
      <Button asChild>
        <Link href={roleAction.href}>{roleAction.label}</Link>
      </Button>
    </section>
  );
}

export function UniversityUpcomingTasks({
  careersTasks,
  registryTasks,
}: {
  careersTasks: UpcomingTask[];
  registryTasks: UpcomingTask[];
}) {
  const { role } = useUniversityRole();
  const roleAction = roleActions[role];
  const roleName = role === "careers" ? "Career Services" : "Registry";
  const upcomingTasks = role === "careers" ? careersTasks : registryTasks;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="flex items-center gap-2">
            <ListTodo className="h-4 w-4" aria-hidden />
            Upcoming tasks
          </h2>
        </CardTitle>
        <CardDescription>{roleName} priorities for today.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingTasks.map((graduate) => (
          <div key={graduate.id} className="rounded-lg border bg-card p-3">
            <p className="text-sm font-medium">{graduate.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {graduate.nextAction}
            </p>
          </div>
        ))}
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={roleAction.href}>
            <CalendarClock aria-hidden />
            {roleAction.label}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
