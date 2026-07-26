"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Search,
  SearchX,
  X,
} from "lucide-react";

import { APPLICATION_STAGES } from "@/types/application";
import {
  getEmployerCandidateRows,
} from "@/lib/data-helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const [pipelineOpen, setPipelineOpen] = useState(false);
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

  const updateFilter = <Key extends keyof CandidateDiscoveryFilters>(
    key: Key,
    value: CandidateDiscoveryFilters[Key],
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const selectCandidateView = (view: CandidateView) => {
    setCandidateView(view);
    setFilters((current) => ({ ...current, role: "All" }));
    setPipelineOpen(false);
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
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          className="bg-surface-1 hover:bg-surface-2"
          onClick={() => setPipelineOpen(true)}
        >
          View candidate pipeline
        </Button>
      </div>

      {pipelineOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[1px]"
            aria-label="Close candidate pipeline"
            onClick={() => setPipelineOpen(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Candidate pipeline"
            className="fixed inset-y-0 left-0 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col border-r-2 border-border bg-surface-1 p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b pb-5">
              <div>
                <p className="text-caption">Candidate pipeline</p>
                <h2 className="mt-1 text-subheading">Choose a hiring stage</h2>
                <p className="mt-1 text-meta">
                  New applications are shown first.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label="Close candidate pipeline panel"
                onClick={() => setPipelineOpen(false)}
              >
                <X aria-hidden />
              </Button>
            </div>

            <nav
              aria-label="Candidate pipeline stages"
              className="mt-5 space-y-2"
            >
              <button
                type="button"
                aria-label="View all"
                aria-current={candidateView === "All" ? "page" : undefined}
                className={`press-feedback flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-body font-medium transition-colors ${
                  candidateView === "All"
                    ? "border-primary bg-accent-soft text-foreground"
                    : "border-border bg-surface-2 hover:bg-surface-tint"
                }`}
                onClick={() => selectCandidateView("All")}
              >
                <span>View all</span>
                <span className="text-meta tabular-nums">{rows.length}</span>
              </button>

              {APPLICATION_STAGES.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  aria-label={
                    stage === "Screening" ? "Screening queue" : stage
                  }
                  aria-current={candidateView === stage ? "page" : undefined}
                  className={`press-feedback flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-body font-medium transition-colors ${
                    candidateView === stage
                      ? "border-primary bg-accent-soft text-foreground"
                      : "border-border bg-surface-2 hover:bg-surface-tint"
                  }`}
                  onClick={() => {
                    selectCandidateView(stage);
                  }}
                >
                  <span>
                    {stage === "Screening"
                      ? "Screening queue"
                      : stage}
                  </span>
                  <span className="text-meta tabular-nums">
                    {filterRowsForCandidateView(rows, stage).length}
                  </span>
                </button>
              ))}

              <button
                type="button"
                aria-label="Rejected"
                aria-current={
                  candidateView === "Rejected" ? "page" : undefined
                }
                className={`press-feedback flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-body font-medium transition-colors ${
                  candidateView === "Rejected"
                    ? "border-primary bg-accent-soft text-foreground"
                    : "border-border bg-surface-2 hover:bg-surface-tint"
                }`}
                onClick={() => {
                  selectCandidateView("Rejected");
                }}
              >
                <span>Rejected</span>
                <span className="text-meta tabular-nums">
                  {filterRowsForCandidateView(rows, "Rejected").length}
                </span>
              </button>
            </nav>
          </aside>
        </>
      ) : null}

      <Card
        data-slot="candidate-filter-panel"
        className="overflow-hidden rounded-tl-3xl rounded-tr-3xl border-2 shadow-none"
      >
        <CardContent className="p-5 md:p-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="flex flex-col gap-1.5 md:col-span-2 xl:col-span-2">
              <label
                htmlFor="candidate-search"
                className="text-eyebrow"
              >
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
                  placeholder="Search name, role, company, or skill"
                  className="pl-9"
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
      <span className="text-eyebrow">
        Sort candidates
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full justify-between px-3 text-left text-base font-normal"
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
      <label
        htmlFor={id}
        className="text-eyebrow"
      >
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}
