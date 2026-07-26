"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EmployerCandidateRow } from "@/lib/data-helpers";
import type { Offer } from "@/types/offer";

export type OfferComposerValues = Pick<Offer, "baseSalary" | "startDate">;

export function OfferComposerDialog({
  open,
  candidates,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  candidates: EmployerCandidateRow[];
  onOpenChange: (open: boolean) => void;
  onCreate: (
    candidate: EmployerCandidateRow,
    values: OfferComposerValues,
  ) => void;
}) {
  if (!open) return null;
  return (
    <OfferComposerDialogContent
      candidates={candidates}
      onOpenChange={onOpenChange}
      onCreate={onCreate}
    />
  );
}

function OfferComposerDialogContent({
  candidates,
  onOpenChange,
  onCreate,
}: {
  candidates: EmployerCandidateRow[];
  onOpenChange: (open: boolean) => void;
  onCreate: (
    candidate: EmployerCandidateRow,
    values: OfferComposerValues,
  ) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [applicationId, setApplicationId] = useState(
    String(candidates[0]?.app.id ?? ""),
  );
  const [baseSalary, setBaseSalary] = useState("");
  const [startDate, setStartDate] = useState("");

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

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="offer-composer-title"
      className="fixed left-1/2 top-1/2 max-h-[90vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-xl backdrop:bg-foreground/40 backdrop:backdrop-blur-sm"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const candidate = candidates.find(
            (row) => row.app.id === Number(applicationId),
          );
          if (!candidate) return;
          onCreate(candidate, { baseSalary, startDate });
          onOpenChange(false);
        }}
      >
        <div className="border-b p-6">
          <p className="text-caption">New offer</p>
          <h2 id="offer-composer-title" className="mt-1 text-heading">
            Send offer
          </h2>
          <p className="mt-1 text-body text-muted-foreground">
            Select a candidate and confirm the essential offer terms.
          </p>
        </div>

        <div className="space-y-4 p-6">
          <FormField label="Candidate and role" htmlFor="offer-candidate">
            <Select value={applicationId} onValueChange={setApplicationId}>
              <SelectTrigger id="offer-candidate">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((row) => (
                  <SelectItem key={row.app.id} value={String(row.app.id)}>
                    {row.candidate.name} · {row.job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Base salary" htmlFor="offer-salary">
            <Input
              id="offer-salary"
              value={baseSalary}
              onChange={(event) => setBaseSalary(event.target.value)}
              placeholder="e.g. SGD 120,000"
              required
            />
          </FormField>

          <FormField label="Proposed start date" htmlFor="offer-start-date">
            <Input
              id="offer-start-date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              placeholder="e.g. 1 Sep 2026"
              required
            />
          </FormField>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t p-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit">
            <Send />
            Send offer
          </Button>
        </div>
      </form>
    </dialog>
  );
}

function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}
