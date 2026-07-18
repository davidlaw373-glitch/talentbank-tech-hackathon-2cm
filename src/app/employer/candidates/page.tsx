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

import { employerCandidates } from "@/data/employer";
import type { CandidateStage, EmployerCandidate } from "@/types/employer";
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

const TABS: Array<{ value: CandidateStage | "All"; label: string }> = [
  { value: "All", label: "All" },
  { value: "New", label: "New" },
  { value: "Screening", label: "Screening" },
  { value: "Shortlisted", label: "Shortlisted" },
  { value: "Interviewing", label: "Interviewing" },
  { value: "Offer", label: "Offer" },
  { value: "Hired", label: "Hired" },
  { value: "Rejected", label: "Rejected" },
];

const NEXT_STAGE: Record<CandidateStage, CandidateStage | null> = {
  New: "Screening",
  Screening: "Shortlisted",
  Shortlisted: "Interviewing",
  Interviewing: "Offer",
  Offer: "Hired",
  Hired: null,
  Rejected: null,
};

function stageVariant(stage: CandidateStage) {
  switch (stage) {
    case "New":
      return "outline" as const;
    case "Screening":
      return "secondary" as const;
    case "Shortlisted":
      return "secondary" as const;
    case "Interviewing":
      return "default" as const;
    case "Offer":
      return "default" as const;
    case "Hired":
      return "default" as const;
    case "Rejected":
      return "destructive" as const;
  }
}

export default function EmployerCandidatesPage() {
  const { push } = useToast();
  const { add, remove, isInPool, getByCandidate } = useTalentPool();
  const [candidates, setCandidates] = useState<EmployerCandidate[]>(employerCandidates);
  const [stage, setStage] = useState<CandidateStage | "All">("All");
  const [query, setQuery] = useState("");
  const [pendingReject, setPendingReject] = useState<EmployerCandidate | null>(
    null,
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: candidates.length };
    for (const c of candidates) {
      map[c.stage] = (map[c.stage] ?? 0) + 1;
    }
    return map;
  }, [candidates]);

  const filtered: EmployerCandidate[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = candidates.filter((c) => {
      const matchesStage = stage === "All" || c.stage === stage;
      const matchesQuery =
        !q || `${c.name} ${c.appliedFor}`.toLowerCase().includes(q);
      return matchesStage && matchesQuery;
    });
    return [...list].sort((a, b) => {
      if (a.starred !== b.starred) return a.starred ? -1 : 1;
      return a.appliedDate < b.appliedDate ? 1 : -1;
    });
  }, [candidates, stage, query]);

  const updateCandidate = (id: string, patch: Partial<EmployerCandidate>) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  };

  const togglePool = (candidateId: string) => {
    if (isInPool(candidateId)) {
      const entry = getByCandidate(candidateId);
      if (entry) remove(entry.id);
    } else {
      add({ candidateId });
    }
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
        onValueChange={(v) => setStage(v as CandidateStage | "All")}
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
                      key={c.id}
                      candidate={c}
                      inPool={isInPool(c.id)}
                      onToggleStar={() =>
                        updateCandidate(c.id, { starred: !c.starred })
                      }
                      onTogglePool={() => togglePool(c.id)}
                      onAdvance={() => {
                        const next = NEXT_STAGE[c.stage];
                        if (next) updateCandidate(c.id, { stage: next });
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
        title={`Reject ${pendingReject?.name ?? "this candidate"}?`}
        description="A polite rejection email will be sent automatically. They will no longer appear in your active pipeline."
        confirmLabel="Reject"
        destructive
        requireTyping="REJECT"
        onConfirm={() => {
          if (pendingReject) {
            updateCandidate(pendingReject.id, { stage: "Rejected" });
            push({
              title: `${pendingReject.name} rejected`,
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
  candidate,
  inPool,
  onToggleStar,
  onTogglePool,
  onAdvance,
  onRequestReject,
}: {
  candidate: EmployerCandidate;
  inPool: boolean;
  onToggleStar: () => void;
  onTogglePool: () => void;
  onAdvance: () => void;
  onRequestReject: (candidate: EmployerCandidate) => void;
}) {
  const { push } = useToast();
  const next = NEXT_STAGE[candidate.stage];

  const toggleStar = () => {
    const willStar = !candidate.starred;
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
      description: `${candidate.appliedFor} · pipeline updated.`,
      tone: "success",
    });
  };

  const reject = () => {
    if (candidate.stage === "Rejected") return;
    onRequestReject(candidate);
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
              {candidate.starred ? (
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
              {candidate.appliedFor} · {candidate.location}
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
            <Badge variant="outline">{candidate.matchScore}% match</Badge>
            <Badge variant={stageVariant(candidate.stage)}>{candidate.stage}</Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleStar}
              aria-pressed={candidate.starred}
              aria-label={
                candidate.starred
                  ? `Remove ${candidate.name} from starred`
                  : `Star ${candidate.name}`
              }
            >
              <Star className={cn(candidate.starred && "fill-current")} aria-hidden />
              {candidate.starred ? "Starred" : "Star"}
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
              disabled={!next || candidate.stage === "Rejected"}
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
              disabled={candidate.stage === "Rejected"}
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
