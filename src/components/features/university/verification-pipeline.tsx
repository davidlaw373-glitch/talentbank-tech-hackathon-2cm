"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Award,
  AlertCircle,
  CalendarDays,
  CheckSquare,
  FileDown,
  FileUp,
  GraduationCap,
  Inbox,
  Search,
  ShieldCheck,
  Square,
} from "lucide-react";

import { useToast } from "@/components/common/toast";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import type {
  GraduateRecord,
  VerificationRecordStatus,
} from "@/types/university";

export const STATUS_VARIANT: Record<
  VerificationRecordStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Verified: "default",
  "Pending review": "secondary",
  "Action required": "outline",
  Rejected: "destructive",
};

/** Parses a "3.78 / 4.00" style GPA string into a 0-100 share for the bar. */
function gpaShare(gpa: string): number {
  const match = gpa.match(/([\d.]+)\s*\/\s*([\d.]+)/);
  if (!match) return 0;
  const [, numerator, denominator] = match;
  const value = Number(numerator);
  const scale = Number(denominator);
  if (!scale) return 0;
  return Math.max(0, Math.min(100, Math.round((value / scale) * 100)));
}

type GraduateListProps = {
  records: GraduateRecord[];
  selected: Set<number>;
  collapsed: Set<number>;
  onToggleSelected: (graduateId: number) => void;
  onStatusChange: (
    graduate: GraduateRecord,
    status: VerificationRecordStatus,
  ) => void;
  onRequestApprove: (graduate: GraduateRecord) => void;
  onRequestReject: (graduate: GraduateRecord) => void;
};

function GraduateList({
  records,
  selected,
  collapsed,
  onToggleSelected,
  onStatusChange,
  onRequestApprove,
  onRequestReject,
}: GraduateListProps) {
  if (records.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No records in this stage"
        description="When graduates reach this verification status they will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {records.map((graduate) => {
        const isSelected = selected.has(graduate.id);
        const isCollapsed = collapsed.has(graduate.id);
        const wrapperClass = cn(
          "block overflow-hidden rounded-xl border border-border/20 bg-card p-5 text-card-foreground outline-none transition-all duration-700 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isCollapsed
            ? "pointer-events-none max-h-0 -translate-y-2 border-transparent p-0 opacity-0"
            : "max-h-[2000px] translate-y-0 opacity-100 hover:-translate-y-0.5 hover:shadow-md",
        );
        return (
          <div key={graduate.id} aria-hidden={isCollapsed}>
            <Link
              href={`/university/graduates/${graduate.id}`}
              aria-label={`View ${graduate.name}'s record`}
              className={wrapperClass}
            >
              <div className="flex items-start gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    aria-pressed={isSelected}
                    aria-label={`${isSelected ? "Deselect" : "Select"} ${graduate.name}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleSelected(graduate.id);
                    }}
                  >
                    {isSelected ? (
                      <CheckSquare aria-hidden />
                    ) : (
                      <Square aria-hidden />
                    )}
                  </Button>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <span className="text-sm font-medium">
                      {graduate.initials}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-semibold tracking-tight">
                        {graduate.name}
                      </h3>
                      <Badge variant={STATUS_VARIANT[graduate.status]}>
                        {graduate.status}
                      </Badge>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <GraduationCap className="h-3.5 w-3.5" aria-hidden />
                      {graduate.program}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Award className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="truncate">
                        Capstone: {graduate.capstone}
                      </span>
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" aria-hidden />
                        Class of {graduate.graduationYear}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-2">
                      {graduate.skills.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        disabled={graduate.status === "Verified"}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onRequestApprove(graduate);
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={graduate.status === "Action required"}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onStatusChange(graduate, "Action required");
                        }}
                      >
                        Request info
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={graduate.status === "Rejected"}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onRequestReject(graduate);
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                  {graduate.gpa ? (
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-4xl font-semibold tabular-nums leading-none">
                        {graduate.gpa.split("/")[0].trim()}
                      </span>
                      <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        GPA
                      </span>
                      <div className="mt-2 h-1 w-12 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-chart-1"
                          style={{ width: `${gpaShare(graduate.gpa)}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export function VerificationPipeline({
  initialRecords,
}: {
  initialRecords: GraduateRecord[];
}) {
  const { push } = useToast();
  const [records, setRecords] = useState(initialRecords);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [collapsed, setCollapsed] = useState<Set<number>>(
    () => new Set(initialRecords.filter((r) => r.status === "Verified").map((r) => r.id)),
  );
  const [pendingApprove, setPendingApprove] =
    useState<GraduateRecord | null>(null);
  const [pendingReject, setPendingReject] =
    useState<GraduateRecord | null>(null);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("all");
  const [employment, setEmployment] = useState("all");

  const years = useMemo(
    () =>
      Array.from(new Set(records.map((record) => record.graduationYear))).sort(
        (a, b) => b - a,
      ),
    [records],
  );

  const searchedRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesSearch =
        query.length === 0 ||
        record.name.toLowerCase().includes(query) ||
        record.program.toLowerCase().includes(query) ||
        record.capstone.toLowerCase().includes(query);
      const matchesYear =
        year === "all" || record.graduationYear === Number(year);
      const matchesEmployment =
        employment === "all" || record.employment === employment;
      return matchesSearch && matchesYear && matchesEmployment;
    });
  }, [records, search, year, employment]);
  const allVisibleSelected =
    searchedRecords.length > 0 &&
    searchedRecords.every((record) => selected.has(record.id));

  function toggleSelected(graduateId: number) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(graduateId)) next.delete(graduateId);
      else next.add(graduateId);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelected((current) => {
      const next = new Set(current);
      if (allVisibleSelected) {
        for (const record of searchedRecords) next.delete(record.id);
      } else {
        for (const record of searchedRecords) next.add(record.id);
      }
      return next;
    });
  }

  function updateRecordStatus(
    graduate: GraduateRecord,
    nextStatus: VerificationRecordStatus,
    reason?: string,
  ) {
    if (graduate.status === nextStatus) return;
    setRecords((current) =>
      current.map((record) =>
        record.id === graduate.id ? { ...record, status: nextStatus } : record,
      ),
    );
    setSelected((current) => {
      const next = new Set(current);
      next.delete(graduate.id);
      return next;
    });
    push({
      title: `${graduate.name} moved to ${nextStatus}`,
      description: reason
        ? `Reason: ${reason}`
        : `Status changed from ${graduate.status}.`,
      tone: nextStatus === "Verified" ? "success" : "info",
    });
  }

  function bulkUpdate(nextStatus: VerificationRecordStatus) {
    const ids = selected;
    const count = ids.size;
    if (count === 0) {
      push({
        title: "No records selected",
        description: "Select at least one visible record first.",
        tone: "info",
      });
      return;
    }

    setRecords((current) =>
      current.map((record) =>
        ids.has(record.id) ? { ...record, status: nextStatus } : record,
      ),
    );
    setSelected(new Set());
    push({
      title:
        nextStatus === "Verified"
          ? `${count} ${count === 1 ? "record" : "records"} approved`
          : `Information requested for ${count} ${count === 1 ? "record" : "records"}`,
      description: `Selected records moved to ${nextStatus}.`,
      tone: nextStatus === "Verified" ? "success" : "info",
    });
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
              variant="outline"
              size="sm"
              onClick={() =>
                push({
                  title: "Import opened",
                  description: "Choose a graduate records file to continue.",
                  tone: "info",
                })
              }
            >
              <FileDown aria-hidden />
              Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                push({
                  title: "Selected records export prepared",
                  description: `${selected.size} ${selected.size === 1 ? "record" : "records"} included.`,
                  tone: "success",
                })
              }
            >
              <FileUp aria-hidden />
              Export selected
            </Button>
          </div>

        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-0 flex-1 space-y-1.5 sm:min-w-[16rem]">
            <label
              htmlFor="verification-search"
              className="text-eyebrow"
            >
              Search
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="verification-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, program, or capstone"
                className="pl-9"
                aria-label="Search records by name, program, or capstone"
              />
            </div>
          </div>
          <div className="space-y-1.5 sm:w-[12rem]">
            <label
              htmlFor="verification-year"
              className="text-eyebrow"
            >
              Graduation year
            </label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger
                id="verification-year"
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
            <label
              htmlFor="verification-employment"
              className="text-eyebrow"
            >
              Employment status
            </label>
            <Select value={employment} onValueChange={setEmployment}>
              <SelectTrigger
                id="verification-employment"
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h3 className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" aria-hidden />
                All records
              </h3>
            </CardTitle>
            <CardDescription>
              {searchedRecords.length} records across every status.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 border-b p-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-pressed={allVisibleSelected}
                aria-label={`${allVisibleSelected ? "Deselect" : "Select"} all visible records`}
                onClick={toggleAllVisible}
                disabled={searchedRecords.length === 0}
              >
                {allVisibleSelected ? (
                  <CheckSquare aria-hidden />
                ) : (
                  <Square aria-hidden />
                )}
              </Button>
              <p className="text-base">Select all visible</p>
              <small className="text-sm text-muted-foreground">
                {selected.size} selected
              </small>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => bulkUpdate("Verified")}
              >
                <CheckSquare aria-hidden />
                Approve selected
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => bulkUpdate("Action required")}
              >
                <AlertCircle aria-hidden />
                Request info on selected
              </Button>
            </div>
          </CardContent>

          <CardContent className="space-y-4 p-4">
            <GraduateList
              records={searchedRecords}
              selected={selected}
              collapsed={collapsed}
              onToggleSelected={toggleSelected}
              onStatusChange={updateRecordStatus}
              onRequestApprove={setPendingApprove}
              onRequestReject={setPendingReject}
            />
          </CardContent>
        </Card>

        <ConfirmDialog
          open={pendingApprove !== null}
          onOpenChange={(open) => {
            if (!open) setPendingApprove(null);
          }}
          title="Approve this graduate's credential?"
          description={
            pendingApprove ? (
              <>
                <strong>{pendingApprove.name}</strong>&apos;s credential will
                be marked as Verified. Employers will see this update
                immediately.
              </>
            ) : null
          }
          confirmLabel="Approve"
          onConfirm={() => {
            if (pendingApprove) {
              updateRecordStatus(pendingApprove, "Verified");
              setCollapsed((current) => {
                const next = new Set(current);
                next.add(pendingApprove.id);
                return next;
              });
            }
            setPendingApprove(null);
          }}
        />

        <ConfirmDialog
          open={pendingReject !== null}
          onOpenChange={(open) => {
            if (!open) setPendingReject(null);
          }}
          title="Reject this graduate's credential?"
          description={
            pendingReject ? (
              <>
                <strong>{pendingReject.name}</strong>&apos;s credential will
                be rejected. Their employer pipeline will be paused until
                this is resolved.
              </>
            ) : null
          }
          confirmLabel="Reject"
          destructive
          requireTyping="REJECT"
          onConfirm={() => {
            if (pendingReject) {
              updateRecordStatus(pendingReject, "Rejected");
              setCollapsed((current) => {
                const next = new Set(current);
                next.add(pendingReject.id);
                return next;
              });
            }
            setPendingReject(null);
          }}
        />
      </section>
    </div>
  );
}
