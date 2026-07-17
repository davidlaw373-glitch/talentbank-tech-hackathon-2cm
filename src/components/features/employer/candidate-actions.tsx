"use client";

import { useState } from "react";
import {
  ArrowRight,
  Calendar,
  Send,
  Star,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

import type { CandidateStage } from "@/types/employer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/common/toast";
import { cn } from "@/lib/utils";

const NEXT_STAGE: Record<CandidateStage, CandidateStage | null> = {
  New: "Screening",
  Screening: "Shortlisted",
  Shortlisted: "Interviewing",
  Interviewing: "Offer",
  Offer: "Hired",
  Hired: null,
  Rejected: null,
};

export function CandidateActions({
  candidateName,
  appliedFor,
  initialStarred,
  initialStage,
}: {
  candidateName: string;
  appliedFor: string;
  initialStarred: boolean;
  initialStage: CandidateStage;
}) {
  const { push } = useToast();
  const [starred, setStarred] = useState(initialStarred);
  const [stage, setStage] = useState<CandidateStage>(initialStage);

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
    setStage("Rejected");
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
    setStarred(true);
    push({
      title: `${candidateName} saved to talent pool`,
      description: "You'll get alerts as their profile matures.",
      tone: "success",
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
          disabled={!next || stage === "Rejected"}
        >
          {next ? `Move to ${next}` : "Already at final stage"}
          {next ? <ArrowRight /> : null}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={reject}
          disabled={stage === "Rejected"}
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
        <Button variant="ghost" onClick={addToPool}>
          <UserPlus />
          Add to talent pool
        </Button>
        <Button
          variant="destructive"
          onClick={reject}
          disabled={stage === "Rejected"}
        >
          <X />
          Reject
        </Button>
      </div>

      <span className="sr-only">
        {candidateName} current stage: {stage}
      </span>
    </>
  );
}