"use client";

import type { UniversityProfile } from "@/types/university";
import { Card, CardContent } from "@/components/ui/card";

type StatTileProps = {
  label: string;
  value: string;
  hint?: string;
};

function StatTile({ label, value, hint }: StatTileProps) {
  return (
    <Card>
      <CardContent className="space-y-1 p-5">
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        <p className="text-sm font-medium">{label}</p>
        {hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function InstitutionProfileStats({
  profile,
}: {
  profile: UniversityProfile;
}) {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatTile
        label="Students"
        value={profile.totalStudents.toLocaleString()}
        hint="Enrolled this term"
      />
      <StatTile
        label="Active cohorts"
        value={String(profile.activeCohorts)}
        hint="Across all faculties"
      />
      <StatTile
        label="Employment rate"
        value={`${profile.employmentRate}%`}
        hint="12-month rolling"
      />
      <StatTile
        label="Verified credentials"
        value={profile.verifiedCredentials.toLocaleString()}
        hint="Synced this year"
      />
    </section>
  );
}
