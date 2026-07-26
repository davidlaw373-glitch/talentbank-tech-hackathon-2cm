"use client";

import { Bell, Send, Undo2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { EmployerOfferRow } from "@/lib/data-helpers";
import type { OfferDecision } from "@/types/offer";
import { cn } from "@/lib/utils";

export type OfferRowActions = {
  onSend: () => void;
  onRemind: () => void;
  onWithdraw: () => void;
  onView: () => void;
};

function decisionVariant(decision: OfferDecision) {
  switch (decision) {
    case "Pending":
      return "outline" as const;
    case "Accepted":
      return "default" as const;
    case "Declined":
      return "destructive" as const;
    case "Expired":
      return "secondary" as const;
  }
}

export function OfferRow({
  row,
  mode,
  reminderCoolingDown,
  actions,
}: {
  row: EmployerOfferRow;
  mode: "priority" | "all";
  reminderCoolingDown: boolean;
  actions: OfferRowActions;
}) {
  const { candidate, job, offer } = row;
  const showCompleteActions = mode === "all";
  const isPending = offer.decision === "Pending";
  const isUnsent = offer.sentDate === "Not yet sent";

  return (
    <li>
      <Card
        className={cn(
          "relative lift-on-hover",
          showCompleteActions && "border-2 border-foreground",
        )}
      >
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Whole card surface opens the offer details. The action buttons
              below sit on top via z-30 so they stay independently clickable. */}
          <button
            type="button"
            onClick={actions.onView}
            aria-label={`Open offer details for ${candidate.name}`}
            className="absolute inset-0 z-20 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          />

          <div className="pointer-events-none relative z-10 flex min-w-0 items-start gap-3">
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold"
            >
              {candidate.initials}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-medium">{candidate.name}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {job.title} · {offer.baseSalary}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline">Start: {offer.startDate}</Badge>
                <Badge variant="secondary">Sent: {offer.sentDate}</Badge>
                <Badge variant="outline">{offer.matchScore}% match</Badge>
              </div>
            </div>
          </div>

          <div className="pointer-events-none relative z-10 flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <Badge variant={decisionVariant(offer.decision)}>
              {offer.decision}
            </Badge>
            <div className="pointer-events-auto relative z-30 flex flex-wrap items-center gap-2 sm:justify-end">
              {isPending && isUnsent && (
                <Button
                  size="sm"
                  onClick={actions.onSend}
                  aria-label={`Send offer to ${candidate.name}`}
                >
                  <Send />
                  Send
                </Button>
              )}

              {isPending && !isUnsent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={actions.onRemind}
                  disabled={reminderCoolingDown}
                  aria-label={
                    reminderCoolingDown
                      ? `Reminder cooling down for ${candidate.name}`
                      : `Remind ${candidate.name} about offer`
                  }
                >
                  <Bell />
                  {reminderCoolingDown ? "Reminded" : "Remind"}
                </Button>
              )}

              {showCompleteActions && isPending && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={actions.onWithdraw}
                  aria-label={`Withdraw offer for ${candidate.name}`}
                >
                  <Undo2 />
                  Withdraw
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </li>
  );
}
