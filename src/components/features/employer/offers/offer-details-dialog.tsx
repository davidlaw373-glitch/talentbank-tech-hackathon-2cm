"use client";

import { useEffect, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EmployerOfferRow } from "@/lib/data-helpers";

export function OfferDetailsDialog({
  row,
  open,
  onOpenChange,
}: {
  row: EmployerOfferRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!open || !row) return null;
  return (
    <OfferDetailsDialogContent row={row} onOpenChange={onOpenChange} />
  );
}

function OfferDetailsDialogContent({
  row,
  onOpenChange,
}: {
  row: EmployerOfferRow;
  onOpenChange: (open: boolean) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onOpenChange(false);
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onOpenChange]);

  const fields = [
    { label: "Offered role", value: row.job.title },
    { label: "Base salary", value: row.offer.baseSalary },
    { label: "Proposed start", value: row.offer.startDate },
    { label: "Sent", value: row.offer.sentDate },
    { label: "Match score", value: `${row.offer.matchScore}%` },
  ];

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="offer-details-title"
      className="fixed left-1/2 top-1/2 max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-xl backdrop:bg-foreground/40 backdrop:backdrop-blur-sm"
    >
      <div className="border-b p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-caption">Offer details</p>
            <h2 id="offer-details-title" className="mt-1 text-heading">
              {row.candidate.name}&apos;s offer
            </h2>
          </div>
          <Badge>{row.offer.decision}</Badge>
        </div>
        <p className="mt-2 text-body text-muted-foreground">
          Review the terms and current candidate decision.
        </p>
      </div>

      <dl className="grid gap-4 p-6 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.label}
            className="rounded-lg border bg-surface-inset p-4"
          >
            <dt className="text-caption">{field.label}</dt>
            <dd className="mt-1 text-body font-medium">{field.value}</dd>
          </div>
        ))}
        <div className="rounded-lg border bg-surface-inset p-4 sm:col-span-2">
          <dt className="text-caption">Decision</dt>
          <dd className="mt-1 text-body font-medium">
            {row.offer.decision}
          </dd>
        </div>
      </dl>

      <div className="flex justify-end border-t p-6">
        <Button type="button" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </div>
    </dialog>
  );
}
