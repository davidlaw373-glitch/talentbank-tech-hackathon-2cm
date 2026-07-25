"use client";

import { useMemo, useState } from "react";
import { Search, SearchX, SlidersHorizontal, Sparkles } from "lucide-react";

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
  type CandidateDiscoveryFilters,
  type CandidateMatchSort,
  type CandidateStageFilter,
  type CandidateVerificationFilter,
} from "@/components/features/employer/candidate-discovery";

const DEMO_EMPLOYER_ID = 1;

const DEFAULT_FILTERS: CandidateDiscoveryFilters = {
  query: "",
  role: "All",
  stage: "All",
  verification: "All",
  sort: "desc",
};

export default function EmployerCandidatesPage() {
  const { push } = useToast();
  const [rows] = useState(() =>
    getEmployerCandidateRows(DEMO_EMPLOYER_ID),
  );
  const [filters, setFilters] =
    useState<CandidateDiscoveryFilters>(DEFAULT_FILTERS);
  const [starredIds, setStarredIds] = useState<Set<number>>(new Set());

  const roleOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.job.title))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [rows],
  );

  const filtered = useMemo(
    () => filterCandidateRows(rows, filters),
    [rows, filters],
  );

  const filtersAreActive =
    filters.query !== DEFAULT_FILTERS.query ||
    filters.role !== DEFAULT_FILTERS.role ||
    filters.stage !== DEFAULT_FILTERS.stage ||
    filters.verification !== DEFAULT_FILTERS.verification ||
    filters.sort !== DEFAULT_FILTERS.sort;

  const updateFilter = <Key extends keyof CandidateDiscoveryFilters>(
    key: Key,
    value: CandidateDiscoveryFilters[Key],
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
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
    <div className="space-y-8 pb-8">
      <PageHeading
        title="Candidate management"
        description="Compare the signals that matter, save promising people, and use AI Match as supporting evidence."
      />

      <Card className="overflow-hidden border-2 shadow-[5px_6px_0_0_var(--border)]">
        <div className="h-1.5 bg-primary" aria-hidden />
        <CardContent className="space-y-5 bg-surface-inset p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-accent-soft"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </span>
              <div>
                <p className="text-caption">Candidate discovery</p>
                <h2 className="text-subheading">Find the right evidence</h2>
                <p className="mt-1 text-meta">
                  Search identity and experience, then narrow by application
                  context.
                </p>
              </div>
            </div>
            <div className="rounded-lg border bg-surface-1 px-3 py-2">
              <p className="text-sm font-semibold tabular-nums">
                {filtered.length} of {rows.length} candidates shown
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
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
              id="candidate-stage-filter"
              label="Hiring stage"
              value={filters.stage}
              onValueChange={(value) =>
                updateFilter("stage", value as CandidateStageFilter)
              }
            >
              <SelectItem value="All">All stages</SelectItem>
              {APPLICATION_STAGES.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
              <SelectItem value="Rejected">Rejected</SelectItem>
            </FilterSelect>

            <FilterSelect
              id="candidate-verification-filter"
              label="Verification"
              value={filters.verification}
              onValueChange={(value) =>
                updateFilter(
                  "verification",
                  value as CandidateVerificationFilter,
                )
              }
            >
              <SelectItem value="All">All verification</SelectItem>
              <SelectItem value="Verified">Verified</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="None">None</SelectItem>
            </FilterSelect>

            <FilterSelect
              id="candidate-sort"
              label="Sort candidates"
              value={filters.sort}
              onValueChange={(value) =>
                updateFilter("sort", value as CandidateMatchSort)
              }
            >
              <SelectItem value="desc">AI Match: highest first</SelectItem>
              <SelectItem value="asc">AI Match: lowest first</SelectItem>
            </FilterSelect>
          </div>

          <div className="flex min-h-10 flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="flex items-center gap-2 text-meta">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden />
              AI Match ranks the list; experience and verified evidence stay
              visible on every card.
            </p>
            {filtersAreActive ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFilters(DEFAULT_FILTERS)}
              >
                Clear filters
              </Button>
            ) : null}
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
            rows.length
              ? "No candidates match these filters"
              : "No candidates yet"
          }
          description={
            rows.length
              ? "Try a broader search or clear one of the filters."
              : "New applicants will appear here once they enter your hiring funnel."
          }
          action={
            rows.length ? (
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
