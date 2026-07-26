"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CircleCheck,
  CircleX,
  Clock,
  Filter,
  Send,
  TimerOff,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useToast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getEmployerCandidateRows,
  type EmployerOfferRow,
} from "@/lib/data-helpers";
import { sortOfferRowsByPriority } from "./offer-data";
import {
  OfferComposerDialog,
  type OfferComposerValues,
} from "./offer-composer-dialog";
import { OfferDetailsDialog } from "./offer-details-dialog";
import { OfferRow, type OfferRowActions } from "./offer-row";
import { useOfferWorkflow } from "./offer-workflow-provider";

export function OfferOverview() {
  const { push } = useToast();
  const {
    rows,
    sendOffer,
    remindOffer,
    createOffer,
    isReminderCoolingDown,
  } = useOfferWorkflow();
  const [composerOpen, setComposerOpen] = useState(false);
  const [detailsRow, setDetailsRow] = useState<EmployerOfferRow | null>(
    null,
  );
  const offerCandidates = useMemo(() => getEmployerCandidateRows(1), []);

  const counts = useMemo(
    () => ({
      Pending: rows.filter((row) => row.offer.decision === "Pending").length,
      Accepted: rows.filter((row) => row.offer.decision === "Accepted").length,
      Declined: rows.filter((row) => row.offer.decision === "Declined").length,
      Expired: rows.filter((row) => row.offer.decision === "Expired").length,
    }),
    [rows],
  );

  const priorityRows = useMemo(
    () =>
      sortOfferRowsByPriority(
        rows.filter((row) => row.offer.decision === "Pending"),
      ),
    [rows],
  );

  const createRowActions = (row: EmployerOfferRow): OfferRowActions => ({
    onSend: () => {
      sendOffer(row.offer.id);
      push({
        title: `Offer sent to ${row.candidate.name}`,
        description: `${row.job.title} terms were delivered.`,
        tone: "success",
      });
    },
    onRemind: () => {
      remindOffer(row.offer.id);
      push({
        title: `Reminder sent to ${row.candidate.name}`,
        description: "You can remind them again in 30 seconds.",
        tone: "success",
      });
    },
    onWithdraw: () => undefined,
    onView: () => setDetailsRow(row),
  });

  const handleCreateOffer = (
    candidateRow: ReturnType<typeof getEmployerCandidateRows>[number],
    values: OfferComposerValues,
  ) => {
    createOffer(candidateRow, values);
    push({
      title: `Offer sent to ${candidateRow.candidate.name}`,
      description: `${candidateRow.job.title} · ${values.baseSalary}`,
      tone: "success",
    });
  };

  const summaries = [
    { label: "Pending", value: counts.Pending, icon: Clock, swatch: "bg-highlight-soft" },
    { label: "Accepted", value: counts.Accepted, icon: CircleCheck, swatch: "bg-chart-1/20" },
    { label: "Declined", value: counts.Declined, icon: CircleX, swatch: "bg-destructive/10" },
    { label: "Expired", value: counts.Expired, icon: TimerOff, swatch: "bg-chart-2/20" },
  ];

  return (
    <div className="space-y-8">
    <div className="flex justify-end">
        <Button onClick={() => setComposerOpen(true)}>
          <Send />
          Send offer
        </Button>
      </div>

      <section
        aria-label="Offer decision counts"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
      >
        {summaries.map(({ label, value, icon: Icon, swatch }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-5">
              <span
                aria-hidden
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  swatch
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
                  {value}
                </p>
                <p className="text-base font-semibold tracking-tight">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2>Priority offers</h2>
            <p className="text-meta">
              Offers ordered by what needs attention next.
            </p>
          </div>
          <Button
            asChild
            className="bg-highlight-soft text-foreground hover:bg-highlight-soft/80"
          >
            <Link href="/employer/offers/all">View all offers</Link>
          </Button>
        </div>

        {priorityRows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"
              >
                <Filter className="h-5 w-5 text-muted-foreground" />
              </span>
              <div>
                <p className="text-sm font-medium">No priority offers yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Send an offer when a candidate is ready for the final step.
                </p>
              </div>
              <Button size="sm" onClick={() => setComposerOpen(true)}>
                Send offer
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ul aria-label="Priority offers" className="space-y-3">
            {priorityRows.map((row) => (
              <OfferRow
                key={row.offer.id}
                row={row}
                mode="priority"
                reminderCoolingDown={isReminderCoolingDown(row.offer.id)}
                actions={createRowActions(row)}
              />
            ))}
          </ul>
        )}
      </section>

      <OfferComposerDialog
        open={composerOpen}
        candidates={offerCandidates}
        onOpenChange={setComposerOpen}
        onCreate={handleCreateOffer}
      />
      <OfferDetailsDialog
        row={detailsRow}
        open={detailsRow !== null}
        onOpenChange={(open) => {
          if (!open) setDetailsRow(null);
        }}
      />
    </div>
  );
}
