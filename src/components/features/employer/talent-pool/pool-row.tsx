"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Mail,
  Pencil,
  UserMinus,
  X,
} from "lucide-react";

import type { Candidate } from "@/types/candidate";
import type {
  TalentPoolEntry,
  TalentPoolStatus,
  TalentPoolTag,
} from "@/types/talent-pool";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/common/toast";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: TalentPoolStatus[] = [
  "Active",
  "Contacted",
  "Re-engaging",
  "Stale",
];

const TAG_OPTIONS: TalentPoolTag[] = [
  "Silver medalist",
  "Future role",
  "Referral",
  "Conference",
  "Open to work",
  "Senior IC",
  "Specialist",
];

function statusStyle(status: TalentPoolStatus) {
  switch (status) {
    case "Active":
      return { variant: "default" as const, className: "" };
    case "Contacted":
      return { variant: "secondary" as const, className: "" };
    case "Re-engaging":
      return {
        variant: "outline" as const,
        className: "border-highlight/40 bg-highlight-soft text-foreground",
      };
    case "Stale":
      return {
        variant: "outline" as const,
        className: "text-muted-foreground",
      };
  }
}

function scoreTone(score: number) {
  if (score >= 75) return "text-success"; // strong — positive signal
  if (score >= 50) return "text-highlight"; // mid — warm copper
  return "text-destructive"; // weak — needs attention
}

function scoreBarClass(score: number) {
  if (score >= 75) return "bg-success";
  if (score >= 50) return "bg-highlight";
  return "bg-destructive";
}

export type TalentPoolRowProps = {
  candidate: Candidate;
  entry: TalentPoolEntry;
  verification?: "Verified" | "Pending" | "None";
  selected: boolean;
  onToggleSelect: (id: number) => void;
  onUpdate: (id: number, patch: Partial<TalentPoolEntry>) => void;
  onRemove: (id: number) => void;
};

export function TalentPoolRow({
  candidate,
  entry,
  verification,
  selected,
  onToggleSelect,
  onUpdate,
  onRemove,
}: TalentPoolRowProps) {
  const { push } = useToast();
  const [editingNotes, setEditingNotes] = useState(false);
  const [draftNotes, setDraftNotes] = useState(entry.notes);
  const currentStatusStyle = statusStyle(entry.status);

  const updateStatus = (next: string) => {
    const status = next as TalentPoolStatus;
    onUpdate(entry.id, { status });
    push({
      title: `${candidate.name} marked as ${status}`,
      description: "Pool status updated.",
      tone: "info",
    });
  };

  const toggleTag = (tag: TalentPoolTag) => {
    const has = entry.tags.includes(tag);
    onUpdate(entry.id, {
      tags: has ? entry.tags.filter((t) => t !== tag) : [...entry.tags, tag],
    });
  };

  const saveNotes = () => {
    onUpdate(entry.id, { notes: draftNotes });
    setEditingNotes(false);
    push({
      title: `Notes saved for ${candidate.name}`,
      tone: "success",
    });
  };

  const cancelNotes = () => {
    setDraftNotes(entry.notes);
    setEditingNotes(false);
  };

  const reachOut = () => {
    onUpdate(entry.id, {
      status: "Contacted",
      lastContactedAt: "Just now",
    });
    push({
      title: `Outreach queued for ${candidate.name}`,
      description: "A personalised note will be sent from your work email.",
      tone: "success",
    });
  };

  const remove = () => {
    onRemove(entry.id);
    push({
      title: `${candidate.name} removed from talent pool`,
      description: "You can re-add them from the candidate profile.",
      tone: "info",
    });
  };

  return (
    <li
      className={cn(
        "rounded-md border border-border/40 bg-surface-1 p-4",
        selected && "border-highlight/60 bg-highlight-soft/40",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* Left: identity + meta */}
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <label className="flex items-start pt-1">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(entry.id)}
              aria-label={`Select ${candidate.name} for bulk outreach`}
              className="h-4 w-4 cursor-pointer accent-primary"
            />
          </label>
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-foreground"
          >
            {candidate.initials}
          </span>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/employer/applicants/${candidate.id}`}
                className="text-sm font-semibold hover:underline"
              >
                {candidate.name}
              </Link>
              <Badge
                variant={currentStatusStyle.variant}
                className={currentStatusStyle.className}
              >
                {entry.status}
              </Badge>
              {verification === "Verified" ? (
                <Badge
                  variant="outline"
                  className="border-accent/30 bg-accent-soft text-foreground"
                >
                  <BadgeCheck aria-hidden />
                  Verified
                </Badge>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              {candidate.title} · {candidate.location}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>Saved {entry.savedAt}</span>
              <span aria-hidden>·</span>
              <span>
                {entry.lastContactedAt
                  ? `Last contacted ${entry.lastContactedAt}`
                  : "Never contacted"}
              </span>
              <span aria-hidden>·</span>
              <span>
                {entry.source} · {entry.sourceDetail}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {candidate.topSkills.slice(0, 3).map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className="border-border/40 bg-surface-tint text-[10px] text-muted-foreground"
                >
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Right: re-engagement score + status select */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="text-right">
            <p
              className={cn(
                "text-2xl font-semibold tabular-nums",
                scoreTone(entry.reEngagementScore),
              )}
            >
              {entry.reEngagementScore}
            </p>
            {/* Compact semantic bar so the score reads at a glance */}
            <div
              aria-hidden
              className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-muted"
            >
              <span
                className={cn(
                  "block h-full rounded-full",
                  scoreBarClass(entry.reEngagementScore),
                )}
                style={{ width: `${entry.reEngagementScore}%` }}
              />
            </div>
            <small className="text-muted-foreground">
              Re-engagement score
            </small>
          </div>
          <div className="w-40">
            <Select value={entry.status} onValueChange={updateStatus}>
              <SelectTrigger aria-label="Change pool status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-eyebrow">
            Notes
          </p>
          {!editingNotes ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingNotes(true)}
              aria-label={`Edit notes for ${candidate.name}`}
            >
              <Pencil />
              Edit
            </Button>
          ) : null}
        </div>
        {editingNotes ? (
          <div className="space-y-2">
            <textarea
              value={draftNotes}
              onChange={(e) => setDraftNotes(e.target.value)}
              rows={3}
              aria-label={`Notes for ${candidate.name}`}
              placeholder="Add context for your next outreach…"
              className="border-input placeholder:text-muted-foreground block min-h-[88px] w-full min-w-0 rounded-md border bg-transparent px-3 py-3 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:ring-offset-1"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={saveNotes}>
                <Check />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={cancelNotes}>
                <X />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {entry.notes || "No notes yet."}
          </p>
        )}
      </div>

      {/* Tags */}
      <div className="mt-4 space-y-2">
        <p className="text-eyebrow">
          Tags
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TAG_OPTIONS.map((tag) => {
            const on = entry.tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                aria-pressed={on}
                className={cn(
                  "rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  on
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/50 bg-surface-tint text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
        <Button size="sm" onClick={reachOut}>
          <Mail />
          Reach out
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={`/employer/applicants/${candidate.id}`}>
            View profile
            <ArrowRight />
          </Link>
        </Button>
        <Button size="sm" variant="ghost" onClick={remove}>
          <UserMinus />
          Remove from pool
        </Button>
        <span className="sr-only">
          {candidate.name} re-engagement score {entry.reEngagementScore}
        </span>
      </div>
    </li>
  );
}