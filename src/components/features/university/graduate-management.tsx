"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, ShieldCheck, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  GraduateRecord,
  VerificationRecordStatus,
} from "@/types/university";

const STATUS_ORDER: VerificationRecordStatus[] = [
  "Verified",
  "Pending review",
  "Action required",
  "Rejected",
];

const EMPLOYMENT_VARIANT: Record<
  GraduateRecord["employment"],
  "default" | "secondary" | "outline"
> = {
  Employed: "default",
  "Open to work": "secondary",
  "In grad school": "outline",
  Unknown: "outline",
};

type EmploymentFilter = GraduateRecord["employment"] | "all";

/**
 * Hairline-separated list of clickable graduate rows. Each row is a single
 * `<Link>` so the whole row is the click target — no per-row "View"
 * button. A single top border outlines the section; subsequent rows are
 * separated by a hairline divider.
 */
function RecordsList({
  records,
  onReset,
}: {
  records: GraduateRecord[];
  onReset: () => void;
}) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border p-12 text-center">
        <Users className="h-10 w-10 text-muted-foreground" aria-hidden />
        <h3 className="text-subheading">No graduates match your filters</h3>
        <p className="text-sm text-muted-foreground">
          Try clearing the search or selecting a different filter.
        </p>
        <Button variant="outline" onClick={onReset}>
          Reset filters
        </Button>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border/40 bg-card">
      {records.map((graduate) => (
        <li key={graduate.id}>
          <Link
            href={`/university/graduates/${graduate.id}`}
            aria-label={`Open ${graduate.name}'s record`}
            className={cn(
              "group flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4 transition-colors",
              "hover:bg-accent-soft focus-visible:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-5",
            )}
          >
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground"
            >
              {graduate.initials}
            </span>

            <div className="min-w-0 flex-1 basis-48">
              <p className="truncate text-base font-semibold">{graduate.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {graduate.program}
              </p>
            </div>

            <div className="hidden w-24 shrink-0 sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Year
              </p>
              <p className="text-sm tabular-nums">{graduate.graduationYear}</p>
            </div>

            <div className="hidden w-24 shrink-0 text-right lg:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                GPA
              </p>
              <p className="text-sm tabular-nums text-muted-foreground">
                {graduate.gpa}
              </p>
            </div>

            <div className="w-32 shrink-0">
              <Badge variant={EMPLOYMENT_VARIANT[graduate.employment]}>
                {graduate.employment}
              </Badge>
            </div>

            <div className="hidden min-w-0 flex-1 basis-48 lg:block">
              <div className="flex flex-wrap gap-1">
                {graduate.skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
                {graduate.skills.length > 3 ? (
                  <span className="text-xs text-muted-foreground">
                    +{graduate.skills.length - 3}
                  </span>
                ) : null}
              </div>
            </div>

            <ChevronRight
              aria-hidden
              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function countByStatus(records: GraduateRecord[]) {
  const counts: Record<VerificationRecordStatus, number> = {
    Verified: 0,
    "Pending review": 0,
    "Action required": 0,
    Rejected: 0,
  };
  for (const graduate of records) counts[graduate.status] += 1;
  return counts;
}

export function GraduateManagement({
  initialRecords,
}: {
  initialRecords: GraduateRecord[];
}) {
  const [records, setRecords] = useState(initialRecords);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("all");
  const [employment, setEmployment] = useState<EmploymentFilter>("all");

  const years = useMemo(
    () =>
      Array.from(new Set(initialRecords.map((record) => record.graduationYear))).sort(
        (a, b) => b - a,
      ),
    [initialRecords],
  );

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesSearch =
        query.length === 0 ||
        record.name.toLowerCase().includes(query) ||
        record.program.toLowerCase().includes(query);
      const matchesYear =
        year === "all" || record.graduationYear === Number(year);
      const matchesEmployment =
        employment === "all" || record.employment === employment;
      return matchesSearch && matchesYear && matchesEmployment;
    });
  }, [employment, records, search, year]);

  const filteredCounts = countByStatus(filteredRecords);
  const allCounts = countByStatus(records);

  function resetFilters() {
    setSearch("");
    setYear("all");
    setEmployment("all");
  }

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        <Card>
          <CardContent className="space-y-2 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
              <Users className="h-4 w-4" aria-hidden />
            </div>
            <div className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
              {filteredRecords.length}
            </div>
            <p className="text-base text-muted-foreground">Matching graduates</p>
            <p className="text-sm text-muted-foreground">
              {filteredRecords.length} of {records.length} total
            </p>
          </CardContent>
        </Card>
        {STATUS_ORDER.map((status) => {
          const share =
            filteredRecords.length > 0
              ? Math.round(
                  (filteredCounts[status] / filteredRecords.length) * 100,
                )
              : 0;
          return (
            <Card key={status}>
              <CardContent className="space-y-2 p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                </div>
                <div className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
                  {filteredCounts[status]}
                </div>
                <p className="text-base text-muted-foreground">{status}</p>
                <p className="text-sm text-muted-foreground">
                  {share}% filtered · {allCounts[status]} overall
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-subheading">All graduates</h2>
            <p className="text-sm text-muted-foreground">Use View to open a graduate detail record.</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {filteredRecords.length} of {records.length}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-0 flex-1 space-y-1.5 sm:min-w-[16rem]">
            <label htmlFor="grad-search" className="block">
              <small className="text-sm font-medium text-foreground">Search</small>
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="grad-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or program"
                className="pl-9"
                aria-label="Search graduates by name or program"
              />
            </div>
          </div>
          <div className="space-y-1.5 sm:w-[12rem]">
            <label htmlFor="grad-year" className="block">
              <small className="text-sm font-medium text-foreground">Graduation year</small>
            </label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger
                id="grad-year"
                className="w-full sm:w-[12rem]"
                aria-label="Filter by graduation year"
              >
                <SelectValue placeholder="All years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {years.map((graduationYear) => (
                  <SelectItem
                    key={graduationYear}
                    value={String(graduationYear)}
                  >
                    {graduationYear}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:w-[14rem]">
            <label htmlFor="grad-employment" className="block">
              <small className="text-sm font-medium text-foreground">Employment status</small>
            </label>
            <Select
              value={employment}
              onValueChange={(value) =>
                setEmployment(value as EmploymentFilter)
              }
            >
              <SelectTrigger
                id="grad-employment"
                className="w-full sm:w-[14rem]"
                aria-label="Filter by employment status"
              >
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Employed">Employed</SelectItem>
                <SelectItem value="Open to work">Open to work</SelectItem>
                <SelectItem value="In grad school">In grad school</SelectItem>
                <SelectItem value="Unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="text-subheading">Records</h3>
              <p className="text-sm text-muted-foreground">
                Filtered live by search, graduation year, and employment status.
              </p>
            </div>
          </div>
          <RecordsList records={filteredRecords} onReset={resetFilters} />
        </div>
      </section>
    </div>
  );
}
