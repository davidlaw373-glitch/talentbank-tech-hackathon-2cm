"use client";

import { useState } from "react";
import {
  ArrowRight,
  Calendar,
  MessageSquare,
  Send,
  Trash2,
} from "lucide-react";

import {
  STAGE_INDEX,
  type ApplicationStage,
} from "@/types/application";
import { useToast } from "@/components/common/toast";
import { useCandidatePipeline } from "@/components/features/employer/candidate-pipeline-provider";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type ReviewAction = "interview" | "offer" | "message" | "reject";

type CandidateActionProps = {
  applicationId: number;
  candidateName: string;
  appliedFor: string;
  initialStage: ApplicationStage;
  initialRejected: boolean;
};

export function CompleteReviewButton({
  applicationId,
  candidateName,
  appliedFor,
  initialStage,
  initialRejected,
}: CandidateActionProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { push } = useToast();
  const { getStatus, moveToStage } = useCandidatePipeline();
  const status = getStatus(applicationId, initialStage, initialRejected);

  if (status.stage !== "Applied" || status.rejected) return null;

  const completeReview = () => {
    moveToStage(applicationId, "Screening");
    push({
      title: `${candidateName} moved to Screening`,
      description: `${appliedFor} pipeline updated.`,
      tone: "success",
    });
  };

  return (
    <>
      <div className="mt-8 flex justify-end border-t border-border pt-6">
        <Button
          type="button"
          onClick={() => setConfirmOpen(true)}
          aria-label="Complete review and move to Screening"
        >
          Complete review
          <ArrowRight aria-hidden />
        </Button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Complete ${candidateName}'s review?`}
        description="This moves the candidate from Applied to Screening and updates the candidate pipeline."
        confirmLabel="Move to Screening"
        onConfirm={completeReview}
      />
    </>
  );
}

export function CandidateActions({
  applicationId,
  candidateName,
  appliedFor,
  initialStage,
  initialRejected,
}: CandidateActionProps) {
  const [pendingAction, setPendingAction] = useState<ReviewAction | null>(null);
  const [note, setNote] = useState("");
  const { push } = useToast();
  const { getStatus, moveToStage, reject } = useCandidatePipeline();
  const status = getStatus(applicationId, initialStage, initialRejected);

  const openAction = (action: ReviewAction) => {
    setNote("");
    setPendingAction(action);
  };

  const closeAction = () => {
    setPendingAction(null);
    setNote("");
  };

  const confirmAction = () => {
    if (pendingAction === "interview") {
      moveToStage(applicationId, "Interview");
      push({
        title: `${candidateName} moved to Interview`,
        description: `${appliedFor} pipeline updated.`,
        tone: "success",
      });
      return;
    }

    if (pendingAction === "offer") {
      moveToStage(applicationId, "Offer");
      push({
        title: `${candidateName} moved to Offer`,
        description: "The offer workflow is ready for final details.",
        tone: "success",
      });
      return;
    }

    if (pendingAction === "message") {
      push({
        title: `Message sent to ${candidateName}`,
        description: "The conversation has been added to the candidate record.",
        tone: "success",
      });
      return;
    }

    if (pendingAction === "reject") {
      reject(applicationId, status.stage, note);
      push({
        title: `${candidateName} moved to Rejected`,
        description: note.trim()
          ? "The optional rejection reason was saved."
          : "No rejection reason was added.",
        tone: "success",
      });
    }
  };

  const dialogCopy = getDialogCopy(pendingAction, candidateName);

  return (
    <>
      <div
        className="grid grid-cols-1 gap-3"
        aria-label="Candidate application actions"
      >
        <Button
          type="button"
          variant="outline"
          className="bg-muted/45 hover:bg-muted/70"
          disabled={
            status.rejected || STAGE_INDEX[status.stage] >= STAGE_INDEX.Interview
          }
          onClick={() => openAction("interview")}
        >
          <Calendar aria-hidden />
          Interview
        </Button>
        <Button
          type="button"
          variant="outline"
          className="bg-muted/45 hover:bg-muted/70"
          disabled={
            status.rejected || STAGE_INDEX[status.stage] >= STAGE_INDEX.Offer
          }
          onClick={() => openAction("offer")}
        >
          <Send aria-hidden />
          Send offer
        </Button>
        <Button
          type="button"
          variant="outline"
          className="bg-muted/45 hover:bg-muted/70"
          disabled={status.rejected}
          onClick={() => openAction("message")}
        >
          <MessageSquare aria-hidden />
          Message
        </Button>
        <Button
          type="button"
          variant="destructive"
          disabled={status.rejected}
          onClick={() => openAction("reject")}
        >
          <Trash2 aria-hidden />
          Reject
        </Button>
      </div>

      <ConfirmDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) closeAction();
        }}
        title={dialogCopy.title}
        description={dialogCopy.description}
        confirmLabel={dialogCopy.confirmLabel}
        destructive={pendingAction === "reject"}
        noteLabel={
          pendingAction === "reject"
            ? "Reason for rejection (optional)"
            : pendingAction === "message"
              ? "Message"
              : undefined
        }
        noteValue={note}
        onNoteChange={setNote}
        noteRequired={pendingAction === "message"}
        onConfirm={confirmAction}
      />

      <span className="sr-only">
        {candidateName} current stage:{" "}
        {status.rejected ? "Rejected" : status.stage}
      </span>
    </>
  );
}

function getDialogCopy(
  action: ReviewAction | null,
  candidateName: string,
) {
  if (action === "interview") {
    return {
      title: `Move ${candidateName} to Interview?`,
      description:
        "The timeline and candidate pipeline will update to Interview.",
      confirmLabel: "Confirm interview",
    };
  }
  if (action === "offer") {
    return {
      title: `Move ${candidateName} to Offer?`,
      description:
        "The timeline and candidate pipeline will update to Offer.",
      confirmLabel: "Confirm offer",
    };
  }
  if (action === "message") {
    return {
      title: `Message ${candidateName}?`,
      description:
        "Write the message below, then confirm before it is added to the candidate record.",
      confirmLabel: "Send message",
    };
  }
  return {
    title: `Reject ${candidateName}?`,
    description:
      "The candidate will move to Rejected. You can optionally record a reason before confirming.",
    confirmLabel: "Confirm rejection",
  };
}
