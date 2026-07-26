"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Inbox,
  PlusCircle,
  Search,
  Send,
  X,
} from "lucide-react";

import { useToast } from "@/components/common/toast";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import type { DisputeStatus, Dispute, DisputeMessage } from "@/types/dispute";

// ─── Display types ───────────────────────────────────────────────────────────

/** Enriched dispute shape used by the candidate UI. */
export type CandidateDispute = Dispute & {
  /** The credential name (degree, portfolio, etc.) this dispute concerns. */
  credentialName: string;
};

// ─── Status presentation ──────────────────────────────────────────────────────

const STATUSES: DisputeStatus[] = ["Open", "In review", "Resolved", "Rejected"];

export const STATUS_VARIANT: Record<
  DisputeStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Open: "destructive",
  "In review": "secondary",
  Resolved: "outline",
  Rejected: "outline",
};

const STATUS_BORDER: Record<DisputeStatus, string> = {
  Open: "border-l-destructive",
  "In review": "border-l-secondary",
  Resolved: "border-l-primary",
  Rejected: "border-l-muted-foreground",
};

function countByStatus(disputes: CandidateDispute[]) {
  const counts: Record<DisputeStatus, number> = {
    Open: 0,
    "In review": 0,
    Resolved: 0,
    Rejected: 0,
  };
  for (const d of disputes) counts[d.status] += 1;
  return counts;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isConcluded(dispute: CandidateDispute): boolean {
  return dispute.status === "Resolved" || dispute.status === "Rejected";
}

/**
 * Derive a candidate-relevant next-step prompt from the thread state.
 * The candidate's perspective is the opposite of the faculty's:
 *   - "Open" means waiting for a faculty member to pick it up.
 *   - "In review" means a faculty member is working on it; the candidate
 *     may need to supply more evidence.
 */
function deriveNextStep(dispute: CandidateDispute): string {
  if (dispute.status === "Resolved") {
    return "Your dispute has been resolved. Check the credential for any updates.";
  }
  if (dispute.status === "Rejected") {
    return "The university reviewed your dispute and decided not to make changes.";
  }
  const messages = dispute.messages;
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) {
    return "Your dispute has been filed and is awaiting a faculty reviewer.";
  }
  if (dispute.status === "Open") {
    return "Waiting for a faculty member to pick up your dispute.";
  }
  if (lastMessage.author === "faculty") {
    return "Faculty has responded — review their update and reply if needed.";
  }
  return "Your latest reply is with faculty. They will follow up shortly.";
}

// ─── Dispute list card ────────────────────────────────────────────────────────

type DisputeListProps = {
  records: CandidateDispute[];
  onOpenThread: (dispute: CandidateDispute) => void;
};

function DisputeList({ records, onOpenThread }: DisputeListProps) {
  if (records.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No disputes yet"
        description="If you believe something on your credential is incorrect, file a dispute and the university will review it."
      />
    );
  }

  return (
    <div className="space-y-4">
      {records.map((dispute) => {
        const lastMessage = dispute.messages[dispute.messages.length - 1];
        const concluded = isConcluded(dispute);
        const nextStep = deriveNextStep(dispute);
        const awaitingReply =
          dispute.status === "In review" &&
          lastMessage?.author === "faculty";

        return (
          <Card
            key={dispute.id}
            className={cn(
              "group lift-on-hover border-l-4 transition-all duration-300 ease-out",
              STATUS_BORDER[dispute.status],
            )}
          >
            <button
              type="button"
              onClick={() => onOpenThread(dispute)}
              className="block w-full rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`Open dispute thread for ${dispute.credentialName}`}
            >
              <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex items-start gap-3">
                  <div
                    aria-hidden
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-0.5">
                    <CardTitle>
                      <h3 className="text-base">{dispute.credentialName}</h3>
                    </CardTitle>
                    <CardDescription>
                      {dispute.field} · Filed {dispute.filedDate}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {awaitingReply && (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full bg-highlight-soft px-2.5 py-1 text-xs font-medium text-highlight"
                      aria-label="Faculty has replied — your response needed"
                    >
                      <span
                        aria-hidden
                        className="inline-flex h-1.5 w-1.5 animate-pulse-soft rounded-full bg-highlight"
                      />
                      Reply needed
                    </span>
                  )}
                  <Badge variant={STATUS_VARIANT[dispute.status]}>
                    {dispute.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                {/* Original claim */}
                <div className="rounded-lg border bg-surface-tint p-3">
                  <small className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Your claim
                  </small>
                  <p className="mt-1 line-clamp-2 text-sm">
                    {dispute.messages.find((m) => m.author === "candidate")
                      ?.body ?? "—"}
                  </p>
                </div>

                {/* Latest faculty message */}
                {lastMessage?.author === "faculty" && (
                  <div className="rounded-lg border bg-card p-3">
                    <small className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Latest faculty response
                    </small>
                    <p className="mt-1 line-clamp-2 text-sm">
                      {lastMessage.body}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {lastMessage.postedDate}
                    </p>
                  </div>
                )}

                {/* Next step */}
                <div
                  className={cn(
                    "rounded-lg border p-3",
                    concluded ? "bg-muted/50" : "bg-card",
                  )}
                >
                  <small className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {concluded ? "Outcome" : "Next step"}
                  </small>
                  <p className="mt-1 text-sm">{nextStep}</p>
                </div>
              </CardContent>
            </button>

            {/* Faculty handler chip (read-only for candidate) */}
            {dispute.acceptedBy && !concluded && (
              <CardContent className="border-t pt-3">
                <p className="text-xs text-muted-foreground">
                  Being handled by{" "}
                  <span className="font-medium text-foreground">
                    {dispute.acceptedBy}
                  </span>
                </p>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── New dispute form ─────────────────────────────────────────────────────────

const DISPUTE_FIELDS = [
  "Capstone project grade",
  "Verified credential",
  "Employment outcome",
  "Verifying institution",
  "Skills list",
  "GPA / transcript entry",
  "Other",
];

type NewDisputeFormProps = {
  credentialNames: string[];
  onSubmit: (payload: {
    credentialName: string;
    field: string;
    claim: string;
  }) => void;
  onCancel: () => void;
};

function NewDisputeForm({
  credentialNames,
  onSubmit,
  onCancel,
}: NewDisputeFormProps) {
  const [credential, setCredential] = useState(credentialNames[0] ?? "");
  const [field, setField] = useState(DISPUTE_FIELDS[0]);
  const [claim, setClaim] = useState("");

  const canSubmit =
    credential.trim().length > 0 &&
    field.trim().length > 0 &&
    claim.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ credentialName: credential, field, claim });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>File a new dispute</h2>
        </CardTitle>
        <CardDescription>
          Describe what you believe is incorrect and the university will review
          it. Be as specific as possible — include dates, reference numbers, or
          any supporting evidence.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="dispute-credential"
              className="block text-sm font-medium text-foreground"
            >
              Credential
            </label>
            <Select value={credential} onValueChange={setCredential}>
              <SelectTrigger
                id="dispute-credential"
                aria-label="Select the credential this dispute concerns"
              >
                <SelectValue placeholder="Select credential" />
              </SelectTrigger>
              <SelectContent>
                {credentialNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="dispute-field"
              className="block text-sm font-medium text-foreground"
            >
              What needs to be corrected?
            </label>
            <Select value={field} onValueChange={setField}>
              <SelectTrigger
                id="dispute-field"
                aria-label="Select the field to dispute"
              >
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {DISPUTE_FIELDS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="dispute-claim"
              className="block text-sm font-medium text-foreground"
            >
              Describe the error
            </label>
            <Textarea
              id="dispute-claim"
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              rows={4}
              placeholder="Explain what is incorrect and what it should be instead. Reference any documents or dates that support your claim."
            />
            <p className="text-xs text-muted-foreground">
              Be specific — generic disputes may take longer to resolve.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              <Send aria-hidden />
              Submit dispute
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Thread message card ──────────────────────────────────────────────────────

function ThreadMessageCard({
  message,
  isMine,
}: {
  message: DisputeMessage;
  isMine: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        isMine ? "bg-surface-tint" : "bg-card",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <small className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {isMine ? "Your message" : "Faculty response"}
          </small>
          <p className="text-xs text-muted-foreground">{message.postedDate}</p>
        </div>
        {message.edited && (
          <small className="text-xs text-muted-foreground">(edited)</small>
        )}
      </div>
      <p className="mt-2 text-base">{message.body}</p>
    </div>
  );
}

// ─── Thread view ──────────────────────────────────────────────────────────────

type ThreadViewProps = {
  dispute: CandidateDispute;
  onBack: () => void;
  onAddReply: (disputeId: number, body: string) => void;
};

function ThreadView({ dispute, onBack, onAddReply }: ThreadViewProps) {
  const { push } = useToast();
  const [reply, setReply] = useState("");
  const concluded = isConcluded(dispute);
  const canReply = !concluded && dispute.status === "In review";
  const nextStep = deriveNextStep(dispute);

  function sendReply() {
    if (!reply.trim()) return;
    onAddReply(dispute.id, reply.trim());
    setReply("");
    push({
      title: "Reply sent",
      description: "Your response has been added to the thread.",
      tone: "success",
    });
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" onClick={onBack} id="dispute-thread-back">
        <ArrowLeft aria-hidden />
        Back
      </Button>

      <header className="space-y-2">
        <p className="text-caption">Dispute thread</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-heading">{dispute.credentialName}</h1>
          <Badge variant={STATUS_VARIANT[dispute.status]}>
            {dispute.status}
          </Badge>
        </div>
        <p className="text-body text-muted-foreground">
          {dispute.field} · Filed {dispute.filedDate}
        </p>
        {dispute.acceptedBy && (
          <p className="text-sm text-muted-foreground">
            Handled by{" "}
            <span className="font-medium text-foreground">
              {dispute.acceptedBy}
            </span>
          </p>
        )}
      </header>

      {/* Next step callout */}
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl border p-4",
          concluded
            ? "border-border bg-muted/40"
            : "border-highlight/30 bg-highlight-soft/40",
        )}
      >
        <AlertCircle
          aria-hidden
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0",
            concluded ? "text-muted-foreground" : "text-highlight",
          )}
        />
        <div>
          <p className="text-sm font-medium">
            {concluded ? "Outcome" : "What happens next"}
          </p>
          <p className="text-sm text-muted-foreground">{nextStep}</p>
        </div>
      </div>

      {/* Thread */}
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Thread</h2>
          </CardTitle>
          <CardDescription>
            The full conversation between you and the university.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {dispute.messages.map((message) => (
            <ThreadMessageCard
              key={message.id}
              message={message}
              isMine={message.author === "candidate"}
            />
          ))}

          {canReply ? (
            <div className="space-y-2 border-t pt-4">
              <label
                htmlFor="candidate-reply"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Add a reply
              </label>
              <Textarea
                id="candidate-reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder="Add more context, attach document references, or respond to the faculty's update..."
              />
              <div className="flex justify-end">
                <Button size="sm" disabled={!reply.trim()} onClick={sendReply}>
                  <Send aria-hidden />
                  Send reply
                </Button>
              </div>
            </div>
          ) : (
            <p className="border-t pt-4 text-sm text-muted-foreground">
              {concluded
                ? "This dispute is closed. No further replies can be added."
                : "Replies are available once a faculty member has accepted the dispute."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function DisputeTracker({
  initialDisputes,
  credentialNames,
}: {
  initialDisputes: CandidateDispute[];
  /** All credential names the candidate owns — used for the "file" form. */
  credentialNames: string[];
}) {
  const { push } = useToast();
  const [disputes, setDisputes] = useState(initialDisputes);
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [filing, setFiling] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DisputeStatus>(
    "all",
  );
  const [pendingWithdrawId, setPendingWithdrawId] = useState<number | null>(
    null,
  );

  const counts = useMemo(() => countByStatus(disputes), [disputes]);

  const filteredDisputes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return disputes.filter((d) => {
      const matchesSearch =
        query.length === 0 ||
        d.credentialName.toLowerCase().includes(query) ||
        d.field.toLowerCase().includes(query) ||
        d.messages.some((m) => m.body.toLowerCase().includes(query));
      const matchesStatus =
        statusFilter === "all" || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [disputes, search, statusFilter]);

  const activeThread = disputes.find((d) => d.id === activeThreadId) ?? null;

  function openThread(dispute: CandidateDispute) {
    setActiveThreadId(dispute.id);
    setFiling(false);
  }

  function addReply(disputeId: number, body: string) {
    const message: DisputeMessage = {
      id: `d${disputeId}-m${Date.now()}`,
      author: "candidate",
      body,
      postedDate: "Just now",
    };
    setDisputes((current) =>
      current.map((d) =>
        d.id === disputeId ? { ...d, messages: [...d.messages, message] } : d,
      ),
    );
  }

  function fileNewDispute(payload: {
    credentialName: string;
    field: string;
    claim: string;
  }) {
    const newId = Math.max(0, ...disputes.map((d) => d.id)) + 1;
    const newDispute: CandidateDispute = {
      id: newId,
      credentialId: 0, // local only — no backend in demo
      credentialName: payload.credentialName,
      field: payload.field,
      filedDate: "Just now",
      status: "Open",
      messages: [
        {
          id: `d${newId}-m1`,
          author: "candidate",
          body: payload.claim,
          postedDate: "Just now",
        },
      ],
    };
    setDisputes((current) => [newDispute, ...current]);
    setFiling(false);
    push({
      title: "Dispute filed",
      description: `Your dispute about "${payload.field}" has been submitted. The university will review it shortly.`,
      tone: "success",
    });
  }

  function withdraw(disputeId: number) {
    setDisputes((current) => current.filter((d) => d.id !== disputeId));
    if (activeThreadId === disputeId) setActiveThreadId(null);
    push({
      title: "Dispute withdrawn",
      description: "The dispute has been removed from the queue.",
      tone: "info",
    });
  }

  // ── Thread view ────────────────────────────────────────────────────────────
  if (activeThread) {
    return (
      <div className="space-y-6">
        <ThreadView
          dispute={activeThread}
          onBack={() => setActiveThreadId(null)}
          onAddReply={addReply}
        />

        {activeThread.status === "Open" && (
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Withdraw dispute</h2>
              </CardTitle>
              <CardDescription>
                If you no longer want to pursue this dispute you can withdraw
                it. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setPendingWithdrawId(activeThread.id)}
              >
                <X aria-hidden />
                Withdraw dispute
              </Button>
            </CardContent>
          </Card>
        )}

        <ConfirmDialog
          open={pendingWithdrawId !== null}
          onOpenChange={(open) => {
            if (!open) setPendingWithdrawId(null);
          }}
          title="Withdraw this dispute?"
          description={
            <>
              Your dispute about{" "}
              <strong>
                {disputes.find((d) => d.id === pendingWithdrawId)?.field}
              </strong>{" "}
              will be removed. The university will no longer review it.
            </>
          }
          confirmLabel="Withdraw"
          destructive
          onConfirm={() => {
            if (pendingWithdrawId !== null) withdraw(pendingWithdrawId);
            setPendingWithdrawId(null);
          }}
        />
      </div>
    );
  }

  // ── New dispute form ───────────────────────────────────────────────────────
  if (filing) {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => setFiling(false)} id="dispute-form-back">
        <ArrowLeft aria-hidden />
        Back
      </Button>
        <header className="space-y-1">
          <p className="text-caption">My disputes</p>
          <h1 className="text-heading">File a dispute</h1>
        </header>
        <NewDisputeForm
          credentialNames={credentialNames}
          onSubmit={fileNewDispute}
          onCancel={() => setFiling(false)}
        />
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Stat tiles */}
      <section
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
        aria-label="Dispute status summary"
      >
        {STATUSES.map((status) => {
          const Icon =
            status === "Open"
              ? AlertCircle
              : status === "In review"
                ? Clock
                : status === "Resolved"
                  ? CheckCircle2
                  : X;
          const value = counts[status];
          const swatchClass: Record<DisputeStatus, string> = {
            Open: "bg-destructive/10 text-destructive",
            "In review": "bg-secondary/10 text-secondary-foreground",
            Resolved: "bg-success/10 text-success",
            Rejected: "bg-muted text-muted-foreground",
          };
          return (
            <Card key={status}>
              <CardContent className="space-y-2 p-5">
                <div
                  aria-hidden
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md",
                    swatchClass[status],
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <div className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
                  {value}
                </div>
                <p className="text-base text-muted-foreground">{status}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* List controls */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-subheading">My disputes</h2>
            <p className="text-sm text-muted-foreground">
              Track the status of disputes you&apos;ve filed with your
              institution.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setFiling(true)}
            id="file-dispute-btn"
          >
            <PlusCircle aria-hidden />
            File a dispute
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-0 flex-1 space-y-1.5 sm:min-w-[16rem]">
            <label htmlFor="candidate-dispute-search" className="block">
              <small className="text-sm font-medium text-foreground">
                Search
              </small>
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="candidate-dispute-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by credential, field, or message"
                className="pl-9"
                aria-label="Search disputes by credential, field, or message"
              />
            </div>
          </div>
          <div className="space-y-1.5 sm:w-[14rem]">
            <label htmlFor="candidate-dispute-status" className="block">
              <small className="text-sm font-medium text-foreground">
                Status
              </small>
            </label>
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                setStatusFilter(v as "all" | DisputeStatus)
              }
            >
              <SelectTrigger
                id="candidate-dispute-status"
                className="w-full sm:w-[14rem]"
                aria-label="Filter by status"
              >
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DisputeList records={filteredDisputes} onOpenThread={openThread} />
      </section>
    </div>
  );
}
