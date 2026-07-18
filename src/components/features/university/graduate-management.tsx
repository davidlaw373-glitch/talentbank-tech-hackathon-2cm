"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Search, ShieldCheck, Users } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  GraduateRecord,
  VerificationRecordStatus,
} from "@/types/university";

const STATUS_ORDER: VerificationRecordStatus[] = [
  "Verified",
  "Pending review",
  "Action required",
  "Disputed",
];

const STATUS_VARIANT: Record<
  VerificationRecordStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Verified: "default",
  "Pending review": "secondary",
  "Action required": "outline",
  Disputed: "destructive",
};

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

function countByStatus(records: GraduateRecord[]) {
  const counts: Record<VerificationRecordStatus, number> = {
    Verified: 0,
    "Pending review": 0,
    "Action required": 0,
    Disputed: 0,
  };
  for (const graduate of records) counts[graduate.status] += 1;
  return counts;
}

export function GraduateManagement({
  initialRecords,
  totalStudents,
  activeCohorts,
}: {
  initialRecords: GraduateRecord[];
  totalStudents: number;
  activeCohorts: number;
}) {
  const { push } = useToast();
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

  function updateStatus(
    graduate: GraduateRecord,
    nextStatus: VerificationRecordStatus,
  ) {
    if (graduate.status === nextStatus) return;

    setRecords((current) =>
      current.map((record) =>
        record.id === graduate.id ? { ...record, status: nextStatus } : record,
      ),
    );
    push({
      title:
        nextStatus === "Verified"
          ? `${graduate.name} verified`
          : `${graduate.name} moved to dispute`,
      description: `Status changed from ${graduate.status} to ${nextStatus}.`,
      tone: nextStatus === "Verified" ? "success" : "info",
    });
  }

  return (
    <div className="space-y-8">
      <PageHeading
        title="Graduate management"
        description={`${totalStudents.toLocaleString()} students across ${activeCohorts} cohorts.`}
        action={
          <Button
            onClick={() =>
              push({
                title: "Add graduate started",
                description: "The graduate form is ready for a new record.",
                tone: "info",
              })
            }
          >
            <Plus aria-hidden />
            Add graduate
          </Button>
        }
      />

      <section className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 flex-1 space-y-1.5 sm:min-w-[16rem]">
          <label htmlFor="grad-search" className="block">
            <small>Search</small>
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
            <small>Graduation year</small>
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
            <small>Employment status</small>
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
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        <Card className="lift-on-hover">
          <CardContent className="space-y-2 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
              <Users className="h-4 w-4" aria-hidden />
            </div>
            <div className="text-3xl font-semibold tabular-nums">
              {filteredRecords.length}
            </div>
            <p>Matching graduates</p>
            <p className="text-muted-foreground">
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
            <Card key={status} className="lift-on-hover">
              <CardContent className="space-y-2 p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                </div>
                <div className="text-3xl font-semibold tabular-nums">
                  {filteredCounts[status]}
                </div>
                <p>{status}</p>
                <p className="text-muted-foreground">
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
            <h2>All graduates</h2>
            <p>Use View to open a graduate detail record.</p>
          </div>
          <p className="text-muted-foreground">
            Showing {filteredRecords.length} of {records.length}
          </p>
        </div>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>
                <h3>Records</h3>
              </CardTitle>
              <CardDescription>
                Filtered live by search, graduation year, and employment status.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredRecords.length === 0 ? (
              <div className="flex flex-col items-center gap-3 p-12 text-center">
                <Users
                  className="h-10 w-10 text-muted-foreground"
                  aria-hidden
                />
                <h3>No graduates match your filters</h3>
                <p className="text-muted-foreground">
                  Try clearing the search or selecting a different filter.
                </p>
                <Button variant="outline" onClick={resetFilters}>
                  Reset filters
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Graduate</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Program
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Year
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">GPA</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Verification
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Employment
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Skills
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((graduate) => (
                    <TableRow key={graduate.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground">
                            {graduate.initials}
                          </span>
                          <div>
                            <p>{graduate.name}</p>
                            <p className="text-muted-foreground">
                              {graduate.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {graduate.program}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell tabular-nums">
                        {graduate.graduationYear}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {graduate.gpa}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={STATUS_VARIANT[graduate.status]}>
                          {graduate.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant={EMPLOYMENT_VARIANT[graduate.employment]}
                        >
                          {graduate.employment}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {graduate.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                          {graduate.skills.length > 3 && (
                            <small className="text-muted-foreground">
                              +{graduate.skills.length - 3}
                            </small>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          <Button asChild variant="outline" size="sm">
                            <Link
                              href={`/university/graduates/${graduate.id}`}
                            >
                              <span className="sm:hidden">Open</span>
                              <span className="hidden sm:inline">View</span>
                              <ArrowRight aria-hidden />
                            </Link>
                          </Button>
                          {graduate.status !== "Verified" && (
                            <Button
                              size="sm"
                              className="hidden sm:inline-flex"
                              onClick={() =>
                                updateStatus(graduate, "Verified")
                              }
                            >
                              Verify
                            </Button>
                          )}
                          {graduate.status !== "Disputed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="hidden md:inline-flex"
                              onClick={() =>
                                updateStatus(graduate, "Disputed")
                              }
                            >
                              Dispute
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
