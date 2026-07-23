"use client";

import { useMemo, useState } from "react";
import { Bookmark, Sparkles, UserPlus } from "lucide-react";

import {
  getEmployerCandidateRows,
  type EmployerCandidateRow,
} from "@/lib/data-helpers";
import type { Candidate } from "@/types/candidate";
import type {
  TalentPoolEntry,
  TalentPoolStatus,
} from "@/types/talent-pool";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeading } from "@/components/common/page-heading";
import { useToast } from "@/components/common/toast";
import { TalentPoolRow } from "@/components/features/employer/talent-pool/pool-row";
import { PoolSummary } from "@/components/features/employer/talent-pool/pool-summary";
import { PoolToolbar } from "@/components/features/employer/talent-pool/pool-toolbar";
import { useTalentPool } from "@/components/features/employer/talent-pool/pool-provider";

export default function EmployerTalentPoolPage() {
  const { push } = useToast();
  const { entries, add, remove, update, isInPool } = useTalentPool();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TalentPoolStatus | "All">("All");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [pendingBulk, setPendingBulk] = useState<number | null>(null);

  const allRows = getEmployerCandidateRows(1);

  // Candidates that are NOT yet in the pool — surfaced in the "Browse" CTA.
  const notInPool = useMemo(
    () => allRows.filter((r) => !isInPool(r.candidate.id)),
    [allRows, isInPool],
  );

  const candidateById = useMemo(() => {
    const map = new Map<number, EmployerCandidateRow>();
    for (const r of allRows) map.set(r.candidate.id, r);
    return map;
  }, [allRows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries
      .map((entry) => {
        const row = candidateById.get(entry.candidateId);
        return row ? { entry, candidate: row.candidate } : null;
      })
      .filter(
        (
          row,
        ): row is { entry: TalentPoolEntry; candidate: Candidate } =>
          row !== null,
      )
      .filter(({ entry, candidate }) => {
        if (status !== "All" && entry.status !== status) return false;
        if (!q) return true;
        // The job they were added for is captured in entry.sourceDetail;
        // there is no per-row `appliedFor` in the new shape.
        const entryRow = allRows.find(
          (r) => r.candidate.id === entry.candidateId,
        );
        const jobTitle = entryRow?.job.title ?? "";
        const haystack = [
          candidate.name,
          candidate.title,
          candidate.location,
          jobTitle,
          ...candidate.topSkills,
          ...entry.tags,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => b.entry.reEngagementScore - a.entry.reEngagementScore);
  }, [entries, status, query, candidateById, allRows]);

  const addCandidate = (candidateId: number) => {
    const result = add({ candidateId });
    if (!result) return;
    const row = candidateById.get(candidateId);
    push({
      title: `${row?.candidate.name ?? "Candidate"} added to talent pool`,
      description: "You can add notes and tags from their row.",
      tone: "success",
    });
  };

  const removeEntry = (id: number) => {
    remove(id);
    setSelected((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const onBulkOutreach = () => {
    setPendingBulk(selected.size);
  };

  const confirmBulkOutreach = () => {
    if (pendingBulk === null) return;
    const ids = Array.from(selected);
    for (const id of ids) {
      update(id, { status: "Contacted", lastContactedAt: "Just now" });
    }
    push({
      title: `Outreach queued for ${pendingBulk} candidate${pendingBulk === 1 ? "" : "s"}`,
      description:
        "Personalised notes will be sent from your work email. Track replies in your inbox.",
      tone: "success",
    });
    setSelected(new Set());
    setPendingBulk(null);
  };

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Talent pool"
        title="Saved candidates"
        description="Bookmark silver medalists and strong fits for future roles. Tag, score, and reach back out when the right role opens."
        action={
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" aria-hidden />
            {entries.length} active
          </Badge>
        }
      />

      <PoolSummary entries={entries} />

      <PoolToolbar
        query={query}
        onQueryChange={setQuery}
        status={status}
        onStatusChange={setStatus}
        matchCount={filtered.length}
        totalCount={entries.length}
        selectedCount={selected.size}
        onBulkOutreach={onBulkOutreach}
        onClearSelection={clearSelection}
      />

      {/* Suggested candidates not yet in pool */}
      {notInPool.length > 0 ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" aria-hidden />
                  Suggested adds
                </h2>
              </CardTitle>
              <CardDescription>
                Recent applicants not yet in your pool — quick add.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {notInPool.slice(0, 3).map((row) => (
                <li
                  key={row.candidate.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold"
                    >
                      {row.candidate.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {row.candidate.name}
                      </p>
                      <small className="block truncate text-muted-foreground">
                        {row.job.title} · {row.matchScore}% match
                      </small>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addCandidate(row.candidate.id)}
                  >
                    <Bookmark />
                    Add to pool
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {/* Pool list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title={
            entries.length === 0
              ? "Your talent pool is empty"
              : "No candidates match those filters"
          }
          description={
            entries.length === 0
              ? "Bookmark a candidate from their profile, or use the Suggested adds above to seed your pool."
              : "Try a different status or clear your search."
          }
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map(({ candidate, entry }) => (
            <TalentPoolRow
              key={entry.id}
              candidate={candidate}
              verification={candidateById.get(candidate.id)?.verification}
              entry={entry}
              selected={selected.has(entry.id)}
              onToggleSelect={toggleSelect}
              onUpdate={update}
              onRemove={removeEntry}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingBulk !== null}
        onOpenChange={(open) => !open && setPendingBulk(null)}
        title={`Reach out to ${pendingBulk ?? 0} candidate${pendingBulk === 1 ? "" : "s"}?`}
        description="We'll draft a personalised note for each one based on their saved profile. You can review and edit before they send."
        confirmLabel="Queue outreach"
        onConfirm={confirmBulkOutreach}
      />
    </div>
  );
}