"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, SearchX } from "lucide-react";

import { APPLICATION_STAGES } from "@/types/application";
import { getEmployerCandidateRows } from "@/lib/data-helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeading } from "@/components/common/page-heading";
import { EmptyState } from "@/components/common/empty-state";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/common/toast";
import { CandidateDiscoveryCard } from "@/components/features/employer/candidate-discovery-card";
import { useCandidatePipeline } from "@/components/features/employer/candidate-pipeline-provider";
import {
  filterCandidateRows,
  filterRowsForCandidateView,
  type CandidateView,
  type CandidateDiscoveryFilters,
  type CandidateSort,
} from "@/components/features/employer/candidate-discovery";
import { cn } from "@/lib/utils";

const DEMO_EMPLOYER_ID = 1;

const DEFAULT_FILTERS: CandidateDiscoveryFilters = {
  query: "",
  role: "All",
  stage: "All",
  sort: [],
};

const SORT_OPTIONS: Array<{ value: CandidateSort; label: string }> = [
  { value: "latest", label: "Latest" },
  { value: "verified", label: "Verified" },
  { value: "starred", label: "Starred" },
  { value: "match-desc", label: "AI Match: high to low" },
];

const PIPELINE_VIEW_LABEL: Record<CandidateView, string> = {
  All: "All",
  Applied: "Applied",
  Screening: "Screening",
  Interview: "Interview",
  Offer: "Offer",
  Hired: "Hired",
  Rejected: "Rejected",
};

const PIPELINE_VIEWS: CandidateView[] = [
  "All",
  ...APPLICATION_STAGES,
  "Rejected",
];

export default function EmployerCandidatesPage() {
  const { push } = useToast();
  const { getStatus, moveToStage } = useCandidatePipeline();
  const [sourceRows] = useState(() =>
    getEmployerCandidateRows(DEMO_EMPLOYER_ID),
  );
  const [filters, setFilters] =
    useState<CandidateDiscoveryFilters>(DEFAULT_FILTERS);
  const [candidateView, setCandidateView] =
    useState<CandidateView>("Applied");
  const [starredIds, setStarredIds] = useState<Set<number>>(new Set());

  const rows = useMemo(
    () =>
      sourceRows.map((row) => {
        const status = getStatus(
          row.app.id,
          row.app.stage,
          row.app.rejected,
        );
        return {
          ...row,
          app: {
            ...row.app,
            stage: status.stage,
            rejected: status.rejected,
          },
        };
      }),
    [sourceRows, getStatus],
  );

  const rowsForView = useMemo(
    () => filterRowsForCandidateView(rows, candidateView),
    [rows, candidateView],
  );

  const roleOptions = useMemo(
    () =>
      Array.from(new Set(rowsForView.map((row) => row.job.title))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [rowsForView],
  );

  const filtered = useMemo(
    () => filterCandidateRows(rowsForView, filters, starredIds),
    [rowsForView, filters, starredIds],
  );

  const pipelineCounts = useMemo(() => {
    const counts: Record<CandidateView, number> = {
      All: rows.length,
      Applied: 0,
      Screening: 0,
      Interview: 0,
      Offer: 0,
      Hired: 0,
      Rejected: 0,
    };
    for (const view of PIPELINE_VIEWS) {
      if (view === "All") continue;
      counts[view] = filterRowsForCandidateView(rows, view).length;
    }
    return counts;
  }, [rows]);

  const updateFilter = <Key extends keyof CandidateDiscoveryFilters>(
    key: Key,
    value: CandidateDiscoveryFilters[Key],
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const selectCandidateView = (view: CandidateView) => {
    setCandidateView(view);
    setFilters((current) => ({ ...current, role: "All" }));
  };

  const toggleStar = (candidateId: number, candidateName: string) => {
    const willSave = !starredIds.has(candidateId);
    setStarredIds((current) => {
      const next = new Set(current);
      if (willSave) next.add(candidateId);
      else next.delete(candidateId);
      return next;
    });
    push({
      title: willSave
        ? `${candidateName} saved`
        : `${candidateName} removed from saved`,
      description: willSave
        ? "Their profile is marked for your shortlist review."
        : "You can save this profile again at any time.",
      tone: "info",
    });
  };

  const toggleSort = (sort: CandidateSort) => {
    setFilters((current) => ({
      ...current,
      sort: current.sort.includes(sort)
        ? current.sort.filter((selected) => selected !== sort)
        : [...current.sort, sort],
    }));
  };

  const restoreToApplied = (
    applicationId: number,
    candidateName: string,
  ) => {
    moveToStage(applicationId, "Applied");
    push({
      title: `${candidateName} restored to Applied`,
      description: "They are ready for a fresh application review.",
      tone: "success",
    });
  };

  return (
    <div className="relative space-y-8 pb-8">
      <PageHeading
        title="Applicant management"
        description="Review new applications first, save promising people, and use AI Match as supporting evidence."
      />

      <Card
        data-slot="candidate-filter-panel"
        className="overflow-hidden rounded-tl-3xl rounded-tr-3xl border-2 shadow-none"
      >
        <CardContent className="space-y-5 bg-surface-inset p-5 md:p-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="flex flex-col gap-1.5 md:col-span-2 xl:col-span-2">
              <label htmlFor="candidate-search" className="text-caption">
                Search candidates
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="candidate-search"
                  value={filters.query}
                  onChange={(event) =>
                    updateFilter("query", event.target.value)
                  }
                  placeholder="Search name or role"
                  className="bg-surface-1 pl-9 shadow-none"
                />
              </div>
            </div>

            <FilterSelect
              id="candidate-role-filter"
              label="Applied role"
              value={filters.role}
              onValueChange={(value) => updateFilter("role", value)}
            >
              <SelectItem value="All">All roles</SelectItem>
              {roleOptions.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </FilterSelect>

            <MultiSortFilter
              selected={filters.sort}
              onToggle={toggleSort}
              onClear={() => updateFilter("sort", [])}
            />
          </div>

          <div
            role="group"
            aria-label="Hiring pipeline"
            className="space-y-2 border-t border-border pt-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-caption">Hiring Pipeline</p>
              <p className="text-meta tabular-nums text-muted-foreground">
                {filtered.length} shown
              </p>
            </div>
            <div
              role="tablist"
              aria-label="Hiring pipeline stages"
              className="flex flex-wrap gap-1.5"
            >
              {PIPELINE_VIEWS.map((view) => {
                const isActive = candidateView === view;
                return (
                  <button
                    key={view}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={
                      view === "Screening" ? "Screening queue" : view
                    }
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => selectCandidateView(view)}
                    className={cn(
                      "press-feedback inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-body font-medium transition-colors",
                      isActive
                        ? "border-primary bg-accent-soft text-foreground"
                        : "border-border bg-surface-1 text-muted-foreground hover:bg-surface-tint hover:text-foreground",
                    )}
                  >
                    <span>
                      {view === "Screening"
                        ? "Screening queue"
                        : PIPELINE_VIEW_LABEL[view]}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 text-caption tabular-nums",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface-2 text-muted-foreground",
                      )}
                    >
                      {pipelineCounts[view]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {filtered.length ? (
        <ul
          aria-label="Candidate results"
          className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {filtered.map((row) => (
            <li key={row.app.id} className="min-w-0">
              <CandidateDiscoveryCard
                row={row}
                starred={starredIds.has(row.candidate.id)}
                onToggleStar={() =>
                  toggleStar(row.candidate.id, row.candidate.name)
                }
                onRestoreToApplied={
                  row.app.rejected
                    ? () =>
                        restoreToApplied(
                          row.app.id,
                          row.candidate.name,
                        )
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={SearchX}
          title={
            rowsForView.length
              ? "No candidates match these filters"
              : `No ${candidateView.toLocaleLowerCase()} candidates`
          }
          description={
            rowsForView.length
              ? "Try a broader search or clear one of the filters."
              : "Choose another candidate view or check back as the hiring pipeline moves."
          }
          action={
            rowsForView.length ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setFilters(DEFAULT_FILTERS)}
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}

function MultiSortFilter({
  selected,
  onToggle,
  onClear,
}: {
  selected: CandidateSort[];
  onToggle: (sort: CandidateSort) => void;
  onClear: () => void;
}) {
  const summary =
    selected.length === 0
      ? "None"
      : selected.length === 1
        ? SORT_OPTIONS.find((option) => option.value === selected[0])?.label
        : `${selected.length} selected`;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-caption">Sort candidates</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full justify-between bg-surface-1 px-3 text-left text-base font-normal shadow-none"
            aria-label="Sort candidates"
          >
            <span className="truncate">{summary}</span>
            <ChevronDown className="shrink-0" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-64"
        >
          {SORT_OPTIONS.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selected.includes(option.value)}
              onCheckedChange={() => onToggle(option.value)}
              onSelect={(event) => event.preventDefault()}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={selected.length === 0}
            onSelect={onClear}
          >
            Clear filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function FilterSelect({
  id,
  label,
  value,
  onValueChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-caption">
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className="w-full bg-surface-1 shadow-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}
