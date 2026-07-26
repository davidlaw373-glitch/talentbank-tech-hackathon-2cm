"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

import { useToast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EmployerOfferRow } from "@/lib/data-helpers";
import {
  filterOfferRows,
  OFFER_DECISIONS,
  type DecisionFilter,
  type RoleFilter,
} from "./offer-data";
import { OfferDetailsDialog } from "./offer-details-dialog";
import { OfferRow, type OfferRowActions } from "./offer-row";
import { useOfferWorkflow } from "./offer-workflow-provider";
import styles from "./all-offers-management.module.css";

export function AllOffersManagement() {
  const { push } = useToast();
  const {
    rows,
    sendOffer,
    remindOffer,
    withdrawOffer,
    isReminderCoolingDown,
  } = useOfferWorkflow();
  const [query, setQuery] = useState("");
  const [decision, setDecision] = useState<DecisionFilter>("All");
  const [role, setRole] = useState<RoleFilter>("All");
  const [detailsRow, setDetailsRow] = useState<EmployerOfferRow | null>(
    null,
  );

  const roleOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.job.title))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [rows],
  );

  const filteredRows = useMemo(
    () => filterOfferRows(rows, { query, decision, role }),
    [decision, query, role, rows],
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
    onWithdraw: () => {
      withdrawOffer(row.offer.id);
      push({
        title: `Withdrew offer to ${row.candidate.name}`,
        description: "The offer has been removed from the pipeline.",
        tone: "info",
      });
    },
    onView: () => setDetailsRow(row),
  });

  return (
    <div className="space-y-8">
      <div className={`${styles.toolbar} border-b pb-6`}>
        <Button
          asChild
          variant="outline"
          size="icon"
          className="bg-surface-1 hover:bg-surface-2"
        >
          <Link href="/employer/offers" aria-label="Back to offer overview">
            <ArrowLeft />
          </Link>
        </Button>

        <section aria-label="Offer filters" className={styles.filters}>
          <div>
            <label htmlFor="all-offer-search" className="sr-only">
              Search offers
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="all-offer-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Candidate or role"
                className="pl-9"
              />
            </div>
          </div>

          <Select
            value={decision}
            onValueChange={(value) =>
              setDecision(value as DecisionFilter)
            }
          >
            <SelectTrigger aria-label="Offer status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All statuses</SelectItem>
              {OFFER_DECISIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={role} onValueChange={setRole}>
            <SelectTrigger aria-label="Offered role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All roles</SelectItem>
              {roleOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>
      </div>

      <section aria-label="All offers" className="space-y-4">
        <div>
          <h2>Offer pipeline</h2>
          <p className="text-meta" aria-live="polite">
            {filteredRows.length}{" "}
            {filteredRows.length === 1 ? "offer" : "offers"}
          </p>
        </div>

        {filteredRows.length === 0 ? (
          <p className="py-16 text-center text-body text-muted-foreground">
            No offers match the current search and filters.
          </p>
        ) : (
          <ul aria-label="Complete offer list" className="space-y-4">
            {filteredRows.map((row) => (
              <OfferRow
                key={row.offer.id}
                row={row}
                mode="all"
                reminderCoolingDown={isReminderCoolingDown(row.offer.id)}
                actions={createRowActions(row)}
              />
            ))}
          </ul>
        )}
      </section>

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
