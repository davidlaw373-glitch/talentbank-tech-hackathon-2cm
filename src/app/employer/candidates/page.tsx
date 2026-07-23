"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Check,
  Filter,
  Search,
  Star,
  Trash2,
  Users,
} from "lucide-react";

import {
  APPLICATION_STAGES,
  NEXT_STAGE,
  type ApplicationStage,
} from "@/types/application";
import { getEmployerCandidateRows, type EmployerCandidateRow } from "@/lib/data-helpers";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeading } from "@/components/common/page-heading";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/components/common/toast";
import { useTalentPool } from "@/components/features/employer/talent-pool/pool-provider";
import { cn } from "@/lib/utils";

const DEMO_EMPLOYER_ID = 1;

type StageFilter = ApplicationStage | "All" | "Rejected";

const TABS: Array<{ value: StageFilter; label: string }> = [
  { value: "All", label: "All" },
  ...APPLICATION_STAGES.map((s) => ({
    value: s,
    label: s,
  })),
  { value: "Rejected", label: "Rejected" },
];

function stageVariant(stage: ApplicationStage) {
  switch (stage) {
    case "Applied":
      return "outline" as const;
    case "Screening":
      return "secondary" as const;
    case "Interview":
      return "secondary" as const;
    case "Offer":
      return "default" as const;
    case "Hired":
      return "default" as const;
  }
}

export default function EmployerCandidatesPage() {
  const { push } = useToast();
  const { add, remove, isInPool, getByCandidate } = useTalentPool();
  const [rows, setRows] = useState<EmployerCandidateRow[]>(
    getEmployerCandidateRows(DEMO_EMPLOYER_ID),
  );
  const [starredIds, setStarredIds] = useState<Set<number>>(new Set());
  const [stage, setStage] = useState<StageFilter>("All");
  const [query, setQuery] = useState("");
  const [pendingReject, setPendingReject] = useState<EmployerCandidateRow | null>(
    null,
  );

  const candidates = rows;

  const counts = useMemo(() => {
    const map: Record<string, number> = {
      All: candidates.length,
      Rejected: candidates.filter((c) => c.app.rejected).length,
    };
    for (const c of candidates) {
      map[c.app.stage] = (map[c.app.stage] ?? 0) + 1;
    }
    return map;
  }, [candidates]);

  const filtered: EmployerCandidateRow[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = candidates.filter((c) => {
      const matchesStage =
        stage === "All"
          ? true
          : stage === "Rejected"
            ? c.app.rejected
            : c.app.stage === stage && !c.app.rejected;
      const matchesQuery =
        !q ||
        `${c.candidate.name} ${c.job.title}`.toLowerCase().includes(q);
      return matchesStage && matchesQuery;
    });
    return [...list].sort((a, b) => {
      const aStarred = starredIds.has(a.candidate.id) ? 1 : 0;
      const bStarred = starredIds.has(b.candidate.id) ? 1 : 0;
      if (aStarred !== bStarred) return bStarred - aStarred;
      return a.app.appliedDate < b.app.appliedDate ? 1 : -1;
    });
  }, [candidates, stage, query, starredIds]);

  const updateCandidate = (
    id: number,
    patch: Partial<EmployerCandidateRow["app"]>,
  ) => {
    setRows((prev) =>
      prev.map((r) =>
        r.candidate.id === id ? { ...r, app: { ...r.app, ...patch } } : r,
      ),
    );
  };

  const togglePool = (candidateId: number) => {
    if (isInPool(candidateId)) {
      const entry = getByCandidate(candidateId);
      if (entry) remove(entry.id);
    } else {
      add({ candidateId });
    }
  };

  const toggleStar = (candidateId: number) => {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(candidateId)) next.delete(candidateId);
      else next.add(candidateId);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      <PageHeading
        title="Candidate management"
        description="Everyone in your funnel. Filter by stage, search by name, jump into a profile."
      />

      {/* Search */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-1 flex-col gap-1.5">
            <label
              htmlFor="candidate-search"
              className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter by name or applied role"
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        value={stage}
        onValueChange={(v) => setStage(v as StageFilter)}
      >
        <div className="overflow-x-auto">
          <TabsList aria-label="Filter candidates by stage">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
                <span className="ml-2 text-xs text-muted-foreground tabular-nums">
                  {counts[t.value] ?? 0}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={stage} className="mt-4">
          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>
                  <h2 className="flex items-center gap-2">
                    <Users className="h-4 w-4" aria-hidden />
                    {filtered.length} candidate
                    {filtered.length === 1 ? "" : "s"}
                  </h2>
                </CardTitle>
                <CardDescription>
                  Sorted by starred, then recency of application.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <span
                    aria-hidden
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"
                  >
                    <Filter className="h-5 w-5 text-muted-foreground" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      No candidates match those filters
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Try a different stage or clear your search.
                    </p>
                  </div>
                </div>
              ) : (
                <ul className="divide-y">
                  {filtered.map((c) => (
                    <CandidateRow
                      key={c.candidate.id}
                      row={c}
                      starred={starredIds.has(c.candidate.id)}
                      inPool={isInPool(c.candidate.id)}
                      onToggleStar={() => toggleStar(c.candidate.id)}
                      onTogglePool={() => togglePool(c.candidate.id)}
                      onAdvance={() => {
                        const next = NEXT_STAGE[c.app.stage];
                        if (next) updateCandidate(c.candidate.id, { stage: next });
                      }}
                      onRequestReject={setPendingReject}
                    />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={pendingReject !== null}
        onOpenChange={(open) => !open && setPendingReject(null)}
        title={`Reject ${pendingReject?.candidate.name ?? "this candidate"}?`}
        description="A polite rejection email will be sent automatically. They will no longer appear in your active pipeline."
        confirmLabel="Reject"
        destructive
        requireTyping="REJECT"
        onConfirm={() => {
          if (pendingReject) {
            updateCandidate(pendingReject.candidate.id, { rejected: true });
            push({
              title: `${pendingReject.candidate.name} rejected`,
              description: "A polite rejection email will be sent automatically.",
              tone: "info",
            });
          }
          setPendingReject(null);
        }}
      />
    </div>
  );
}

function CandidateRow({
  row,
  starred,
  inPool,
  onToggleStar,
  onTogglePool,
  onAdvance,
  onRequestReject,
}: {
  row: EmployerCandidateRow;
  starred: boolean;
  inPool: boolean;
  onToggleStar: () => void;
  onTogglePool: () => void;
  onAdvance: () => void;
  onRequestReject: (row: EmployerCandidateRow) => void;
}) {
  const { push } = useToast();
  const candidate = row.candidate;
  const job = row.job;
  const next = NEXT_STAGE[row.app.stage];

  const toggleStar = () => {
    const willStar = !starred;
    onToggleStar();
    push({
      title: willStar
        ? `Starred ${candidate.name}`
        : `Removed ${candidate.name} from starred`,
      description: willStar
        ? "They'll surface at the top of your candidates list."
        : "They won't appear in your starred list anymore.",
      tone: "info",
    });
  };

  const togglePool = () => {
    onTogglePool();
    push({
      title: inPool
        ? `${candidate.name} removed from talent pool`
        : `${candidate.name} saved to talent pool`,
      description: inPool
        ? "Open the talent pool to re-add them."
        : "Tag and add notes from the talent pool workspace.",
      tone: "info",
    });
  };

  const advance = () => {
    if (!next) return;
    onAdvance();
    push({
      title: `${candidate.name} moved to ${next}`,
      description: `${job.title} · pipeline updated.`,
      tone: "success",
    });
  };

  const reject = () => {
    if (row.app.rejected) return;
    onRequestReject(row);
  };

  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3 rounded-md p-2 transition-colors hover:bg-accent-soft">
        <Link
          href={`/employer/candidates/${candidate.id}`}
          className="flex min-w-0 flex-1 items-center gap-3"
        >
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold"
          >
            {candidate.initials}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium">{candidate.name}</p>
              {starred ? (
                <Badge variant="outline">
                  <Star className="h-3 w-3 fill-current" aria-hidden />
                  Starred
                </Badge>
              ) : null}
              {inPool ? (
                <Badge variant="secondary">
                  <Bookmark className="h-3 w-3 fill-current" aria-hidden />
                  In pool
                </Badge>
              ) : null}
            </div>
            <small className="block truncate text-muted-foreground">
              {job.title} · {candidate.location}
            </small>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {candidate.topSkills.slice(0, 3).map((s) => (
                <Badge key={s} variant="secondary" className="text-[10px]">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </Link>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{row.matchScore}% match</Badge>
            <Badge variant={stageVariant(row.app.stage)}>{row.app.stage}</Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleStar}
              aria-pressed={starred}
              aria-label={
                starred
                  ? `Remove ${candidate.name} from starred`
                  : `Star ${candidate.name}`
              }
            >
              <Star className={cn(starred && "fill-current")} aria-hidden />
              {starred ? "Starred" : "Star"}
            </Button>
            <Button
              variant={inPool ? "secondary" : "outline"}
              size="sm"
              onClick={togglePool}
              aria-pressed={inPool}
              aria-label={
                inPool
                  ? `Remove ${candidate.name} from talent pool`
                  : `Save ${candidate.name} to talent pool`
              }
            >
              <Bookmark
                className={cn(inPool && "fill-current")}
                aria-hidden
              />
              {inPool ? "In pool" : "Save to pool"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={advance}
              disabled={!next || row.app.rejected}
              aria-label={
                next
                  ? `Move ${candidate.name} to ${next}`
                  : `${candidate.name} already at final stage`
              }
            >
              {next ? (
                <>
                  Move to {next}
                  <ArrowRight />
                </>
              ) : (
                <>
                  <Check />
                  Final stage
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={reject}
              disabled={row.app.rejected}
              aria-label={`Reject ${candidate.name}`}
            >
              <Trash2 />
              Reject
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
}
