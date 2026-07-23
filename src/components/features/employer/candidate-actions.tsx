"use client";

import { useState } from "react";
import {
  ArrowRight,
  Bookmark,
  Calendar,
  Send,
  Star,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

import { NEXT_STAGE, type ApplicationStage } from "@/types/application";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/common/toast";
import { useTalentPool } from "@/components/features/employer/talent-pool/pool-provider";
import { cn } from "@/lib/utils";

export function CandidateActions({
  candidateId,
  candidateName,
  appliedFor,
  initialStarred,
  initialStage,
}: {
  candidateId: number;
  candidateName: string;
  appliedFor: string;
  initialStarred: boolean;
  initialStage: ApplicationStage;
}) {
  const { push } = useToast();
  const { add, remove, getByCandidate, isInPool } = useTalentPool();
  const [starred, setStarred] = useState(initialStarred);
  const [stage, setStage] = useState<ApplicationStage>(initialStage);
  const [rejected, setRejected] = useState(false);

  const poolEntry = getByCandidate(candidateId);
  const inPool = isInPool(candidateId);
  const next = NEXT_STAGE[stage];

  const toggleStar = () => {
    setStarred((s) => !s);
    push({
      title: starred
        ? `Removed ${candidateName} from starred`
        : `Starred ${candidateName}`,
      description: starred
        ? "They won't appear in your starred list anymore."
        : "They'll surface at the top of your candidates list.",
      tone: "info",
    });
  };

  const advance = () => {
    if (!next) return;
    setStage(next);
    push({
      title: `${candidateName} moved to ${next}`,
      description: `${appliedFor} · pipeline updated.`,
      tone: "success",
    });
  };

  const reject = () => {
    if (rejected) return;
    setRejected(true);
    push({
      title: `${candidateName} rejected`,
      description: "A polite rejection email will be sent automatically.",
      tone: "success",
    });
  };

  const schedule = () => {
    push({
      title: "Interview scheduling opened",
      description: `Pick a slot for ${candidateName}.`,
      tone: "info",
    });
  };

  const sendOffer = () => {
    push({
      title: `Offer sent to ${candidateName}`,
      description: "Tracking in your Offers tab.",
      tone: "success",
    });
  };

  const addToPool = () => {
    const result = add({ candidateId });
    if (!result) {
      push({
        title: `${candidateName} is already in your pool`,
        description: "Open the talent pool to view their entry.",
        tone: "info",
      });
      return;
    }
    push({
      title: `${candidateName} saved to talent pool`,
      description: "Add notes and tags from the talent pool workspace.",
      tone: "success",
    });
  };

  const removeFromPool = () => {
    if (!poolEntry) return;
    remove(poolEntry.id);
    push({
      title: `${candidateName} removed from talent pool`,
      description: "You can re-add them anytime.",
      tone: "info",
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          aria-label={starred ? "Remove star" : "Star candidate"}
          aria-pressed={starred}
          onClick={toggleStar}
        >
          <Star className={cn(starred && "fill-current")} aria-hidden />
          {starred ? "Starred" : "Star"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={advance}
          disabled={!next || rejected}
        >
          {next ? `Move to ${next}` : "Already at final stage"}
          {next ? <ArrowRight /> : null}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={reject}
          disabled={rejected}
        >
          <Trash2 />
          Reject
        </Button>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <Button onClick={schedule}>
          <Calendar />
          Schedule interview
        </Button>
        <Button variant="outline" onClick={sendOffer}>
          <Send />
          Send offer
        </Button>
        {inPool ? (
          <Button variant="ghost" onClick={removeFromPool}>
            <Bookmark aria-hidden />
            In talent pool — remove
          </Button>
        ) : (
          <Button variant="ghost" onClick={addToPool}>
            <UserPlus />
            Add to talent pool
          </Button>
        )}
        <Button
          variant="destructive"
          onClick={reject}
          disabled={rejected}
        >
          <X />
          Reject
        </Button>
      </div>

      <span className="sr-only">
        {candidateName} current stage: {stage}
        {inPool ? ` · in talent pool as ${poolEntry?.status ?? "Active"}` : ""}
      </span>
    </>
  );
}