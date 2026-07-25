"use client";

import { useMemo, useState } from "react";
import {
  PanelLeftOpen,
  Search,
  SearchX,
  X,
} from "lucide-react";

import { APPLICATION_STAGES } from "@/types/application";
import {
  getEmployerCandidateRows,
  getMatchScoreByPair,
} from "@/lib/data-helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeading } from "@/components/common/page-heading";
import { EmptyState } from "@/components/common/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/common/toast";
import { CandidateDiscoveryCard } from "@/components/features/employer/candidate-discovery-card";
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
  sort: "none",
};

export default function EmployerCandidatesPage() {
  const { push } = useToast();
  const [rows] = useState(() =>
    getEmployerCandidateRows(DEMO_EMPLOYER_ID),
  );
  const [filters, setFilters] =
    useState<CandidateDiscoveryFilters>(DEFAULT_FILTERS);
  const [candidateView, setCandidateView] =
    useState<CandidateView>("Screening");
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [starredIds, setStarredIds] = useState<Set<number>>(new Set());

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
    () => filterCandidateRows(rowsForView, filters),
    [rowsForView, filters],
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

  return (
    <div className="relative space-y-8 pb-8">
      <PageHeading
        title="Candidate management"
        description="Review the screening queue first, save promising people, and use AI Match as supporting evidence."
        action={
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => setPipelineOpen(true)}
          >
            <PanelLeftOpen aria-hidden />
            View candidate pipeline
          </Button>
        }
      />

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
                  Screening remains the default workspace.
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
        className="overflow-hidden rounded-tl-3xl rounded-tr-3xl border-2 shadow-[5px_6px_0_0_var(--border)]"
      >
        <CardContent className="bg-surface-inset p-5 md:p-6">
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
                  placeholder="Search name, role, company, or skill"
                  className="bg-surface-1 pl-9"
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

            <FilterSelect
              id="candidate-sort"
              label="Sort candidates"
              value={filters.sort}
              onValueChange={(value) =>
                updateFilter("sort", value as CandidateSort)
              }
            >
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
            </FilterSelect>
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
                match={getMatchScoreByPair(row.candidate.id, row.job.id)}
                starred={starredIds.has(row.candidate.id)}
                onToggleStar={() =>
                  toggleStar(row.candidate.id, row.candidate.name)
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
        <SelectTrigger id={id} className="w-full bg-surface-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}
