"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  CircleCheck,
  Clock,
  Eye,
  Filter,
  Search,
  Send,
  Undo2,
} from "lucide-react";

import {
  getEmployerCandidateRows,
  getEmployerOfferRows,
  type EmployerCandidateRow,
  type EmployerOfferRow,
} from "@/lib/data-helpers";
import type { Offer, OfferDecision } from "@/types/offer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeading } from "@/components/common/page-heading";
import { useToast } from "@/components/common/toast";

type DecisionFilter = OfferDecision | "All";

const OFFER_DECISIONS: OfferDecision[] = [
  "Pending",
  "Accepted",
  "Declined",
  "Expired",
];

const DECISION_PRIORITY: Record<OfferDecision, number> = {
  Pending: 0,
  Accepted: 1,
  Declined: 2,
  Expired: 3,
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

function getSeedRows(): EmployerOfferRow[] {
  const existing = getEmployerOfferRows(1);
  const usedApplications = new Set(existing.map((row) => row.application.id));
  const availableCandidates = getEmployerCandidateRows(1).filter(
    (row) => !usedApplications.has(row.app.id),
  );
  const examples: Array<
    Pick<Offer, "baseSalary" | "startDate" | "sentDate" | "decision">
  > = [
    {
      baseSalary: "SGD 128,000",
      startDate: "20 Aug 2026",
      sentDate: "1 week ago",
      decision: "Accepted",
    },
    {
      baseSalary: "SGD 118,000",
      startDate: "1 Sep 2026",
      sentDate: "10 days ago",
      decision: "Declined",
    },
    {
      baseSalary: "SGD 96,000",
      startDate: "15 Aug 2026",
      sentDate: "3 weeks ago",
      decision: "Expired",
    },
  ];

  const demoRows = examples
    .map((details, index): EmployerOfferRow | null => {
      const source = availableCandidates[index];
      if (!source) return null;
      return {
        application: source.app,
        candidate: source.candidate,
        job: source.job,
        offer: {
          id: 100 + index,
          applicationId: source.app.id,
          matchScore: source.matchScore,
          ...details,
        },
      };
    })
    .filter((row): row is EmployerOfferRow => row !== null);

  return [...existing, ...demoRows];
}

export default function EmployerOffersPage() {
  const { push } = useToast();
  const [rows, setRows] = useState<EmployerOfferRow[]>(getSeedRows);
  const [showAllOffers, setShowAllOffers] = useState(false);
  const [query, setQuery] = useState("");
  const [decisionFilter, setDecisionFilter] =
    useState<DecisionFilter>("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [composerOpen, setComposerOpen] = useState(false);
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

  const roleOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.job.title))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [rows],
  );

  const priorityRows = useMemo(
    () =>
      [...rows].sort((a, b) => {
        const decisionDifference =
          DECISION_PRIORITY[a.offer.decision] -
          DECISION_PRIORITY[b.offer.decision];
        return decisionDifference || b.offer.matchScore - a.offer.matchScore;
      }),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return priorityRows.filter((row) => {
      const matchesQuery =
        !normalizedQuery ||
        `${row.candidate.name} ${row.job.title}`
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesDecision =
        decisionFilter === "All" || row.offer.decision === decisionFilter;
      const matchesRole =
        roleFilter === "All" || row.job.title === roleFilter;
      return matchesQuery && matchesDecision && matchesRole;
    });
  }, [decisionFilter, priorityRows, query, roleFilter]);

  const displayedRows = showAllOffers ? filteredRows : priorityRows;

  const onSend = (row: EmployerOfferRow) => {
    push({
      title: `Re-sent offer to ${row.candidate.name}`,
      description: `Terms preserved for ${row.job.title}.`,
      tone: "success",
    });
  };

  const onRemind = (row: EmployerOfferRow) => {
    push({
      title: `Reminder sent to ${row.candidate.name}`,
      description: "A nudge email will land in their inbox shortly.",
      tone: "success",
    });
  };

  const onWithdraw = (row: EmployerOfferRow) => {
    setRows((current) =>
      current.filter((item) => item.offer.id !== row.offer.id),
    );
    push({
      title: `Withdrew offer to ${row.candidate.name}`,
      description: "The offer has been removed from the pipeline.",
      tone: "info",
    });
  };

  const onView = (row: EmployerOfferRow) => {
    push({
      title: `Opening ${row.candidate.name} offer`,
      description: `${row.job.title} · ${row.offer.baseSalary} · start ${row.offer.startDate}`,
      tone: "info",
    });
  };

  return (
    <div className="space-y-8">
      <PageHeading
        title="Offer management"
        description="Track every offer out the door — sent, signed, declined, or expired."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={showAllOffers ? "outline" : "default"}
              onClick={() => setShowAllOffers((current) => !current)}
            >
              {showAllOffers ? "Show priority offers" : "View all offers"}
            </Button>
            <Button onClick={() => setComposerOpen(true)}>
              <Send />
              Send offer
            </Button>
          </div>
        }
      />

      {!showAllOffers && (
        <section
          aria-label="Offer decision counts"
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {[
            { label: "Pending", value: counts.Pending, icon: Clock },
            { label: "Accepted", value: counts.Accepted, icon: CircleCheck },
            { label: "Declined", value: counts.Declined, icon: CircleCheck },
            { label: "Expired", value: counts.Expired, icon: Clock },
          ].map((summary) => {
            const Icon = summary.icon;
            return (
              <Card key={summary.label}>
                <CardContent className="flex items-center gap-3 p-5">
                  <span
                    aria-hidden
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-3xl font-semibold tracking-tight tabular-nums">
                      {summary.value}
                    </p>
                    <p className="text-sm font-medium">{summary.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}

      <Card className="flex h-[calc(100vh-13rem)] min-h-[32rem] flex-col overflow-hidden">
        {showAllOffers && (
          <CardContent className="grid gap-3 border-b bg-surface-inset p-5 sm:grid-cols-[minmax(0,1fr)_14rem_17rem] sm:items-end">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="offer-search"
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Search offers
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="offer-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Candidate or role"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="offer-decision-filter"
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Status
              </label>
              <Select
                value={decisionFilter}
                onValueChange={(value) =>
                  setDecisionFilter(value as DecisionFilter)
                }
              >
                <SelectTrigger id="offer-decision-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All statuses</SelectItem>
                  {OFFER_DECISIONS.map((decision) => (
                    <SelectItem key={decision} value={decision}>
                      {decision}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="offer-role-filter"
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Offered role
              </label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger id="offer-role-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All roles</SelectItem>
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        )}

        <CardContent className="min-h-0 flex-1 bg-surface-inset p-3">
          {displayedRows.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"
              >
                <Filter className="h-5 w-5 text-muted-foreground" />
              </span>
              <div>
                <p className="text-sm font-medium">
                  No offers match those filters
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try a different status, role, or search.
                </p>
              </div>
            </div>
          ) : (
            <ul
              aria-label={showAllOffers ? "All offers" : "Priority offers"}
              className="h-full space-y-3 overflow-y-auto pr-1"
            >
              {displayedRows.map((row) => (
                <OfferRow
                  key={row.offer.id}
                  row={row}
                  showFullActions={showAllOffers}
                  onSend={() => onSend(row)}
                  onRemind={() => onRemind(row)}
                  onWithdraw={() => onWithdraw(row)}
                  onView={() => onView(row)}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <OfferComposerDialog
        open={composerOpen}
        candidates={offerCandidates}
        onOpenChange={setComposerOpen}
        onCreate={(candidateRow, values) => {
          const nextId = Math.max(0, ...rows.map((row) => row.offer.id)) + 1;
          const newRow: EmployerOfferRow = {
            application: candidateRow.app,
            candidate: candidateRow.candidate,
            job: candidateRow.job,
            offer: {
              id: nextId,
              applicationId: candidateRow.app.id,
              decision: "Pending",
              matchScore: candidateRow.matchScore,
              sentDate: "Just now",
              ...values,
            },
          };
          setRows((current) => [newRow, ...current]);
          push({
            title: `Offer sent to ${candidateRow.candidate.name}`,
            description: `${candidateRow.job.title} · ${values.baseSalary}`,
            tone: "success",
          });
        }}
      />
    </div>
  );
}

function OfferRow({
  row,
  showFullActions,
  onSend,
  onRemind,
  onWithdraw,
  onView,
}: {
  row: EmployerOfferRow;
  showFullActions: boolean;
  onSend: () => void;
  onRemind: () => void;
  onWithdraw: () => void;
  onView: () => void;
}) {
  const { candidate, job, offer } = row;
  return (
    <li className="rounded-xl border bg-card shadow-sm">
      <div className="flex flex-col gap-4 rounded-xl p-4 transition-colors hover:bg-foreground/5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold"
          >
            {candidate.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{candidate.name}</p>
            <small className="block truncate text-muted-foreground">
              {job.title} · {offer.baseSalary}
            </small>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline">Start: {offer.startDate}</Badge>
              <Badge variant="secondary">Sent: {offer.sentDate}</Badge>
              <Badge variant="outline">{offer.matchScore}% match</Badge>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <Badge variant={decisionVariant(offer.decision)}>
            {offer.decision}
          </Badge>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {offer.decision === "Pending" && (
              <>
                <Button size="sm" onClick={onSend}>
                  <Send />
                  Send
                </Button>
                <Button variant="outline" size="sm" onClick={onRemind}>
                  <Bell />
                  Remind
                </Button>
                {showFullActions && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={onWithdraw}
                  >
                    <Undo2 />
                    Withdraw
                  </Button>
                )}
              </>
            )}
            {offer.decision === "Accepted" && (
              <Button variant="outline" size="sm" onClick={onView}>
                <Eye />
                View
              </Button>
            )}
            {showFullActions && offer.decision === "Declined" && (
              <Button variant="outline" size="sm" onClick={onWithdraw}>
                <Undo2 />
                Withdraw
              </Button>
            )}
            {showFullActions && offer.decision === "Expired" && (
              <Button variant="ghost" size="sm" onClick={onView}>
                <Eye />
                View
              </Button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

type OfferComposerValues = Pick<Offer, "baseSalary" | "startDate">;

function OfferComposerDialog({
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
          <p className="text-caption uppercase text-muted-foreground">
            New offer
          </p>
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
