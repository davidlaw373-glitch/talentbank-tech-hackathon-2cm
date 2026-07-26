"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Check,
  Clock,
  Inbox,
  Search,
  Send,
  ShieldAlert,
  X,
} from "lucide-react";

import { BackButton } from "@/components/common/back-button";
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
import type {
  DisputeStatus,
  UniversityDispute,
} from "@/types/university";
import type { DisputeMessage } from "@/types/dispute";

const STATUSES: DisputeStatus[] = ["Open", "In review", "Resolved", "Rejected"];

/**
 * Demo stand-in for the signed-in faculty member. When the current user
 * accepts a dispute, `acceptedBy` is set to this value, which gates the
 * resolve / reject / reply surface for everyone else.
 */
const CURRENT_USER = "You";

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

function countByStatus(disputes: UniversityDispute[]) {
  const counts: Record<DisputeStatus, number> = {
    Open: 0,
    "In review": 0,
    Resolved: 0,
    Rejected: 0,
  };
  for (const dispute of disputes) counts[dispute.status] += 1;
  return counts;
}

/** True when the dispute is being actively handled (status === "In review"). */
function isActivelyHandled(dispute: UniversityDispute): boolean {
  return dispute.status === "In review";
}

/** True when the dispute has been concluded and no further action exists. */
function isConcluded(dispute: UniversityDispute): boolean {
  return dispute.status === "Resolved" || dispute.status === "Rejected";
}

/** True when the current user is the one who accepted this dispute. */
function isOwnedByCurrentUser(dispute: UniversityDispute): boolean {
  return dispute.acceptedBy === CURRENT_USER;
}

/**
 * Build a short, at-a-glance situation summary for a dispute thread.
 * Derived from the message history so the existing dataset stays the
 * source of truth — no duplicate summary fields to maintain.
 */
function deriveDisputeBrief(dispute: UniversityDispute) {
  const messages = dispute.messages;
  const firstCandidate = messages.find((m) => m.author === "candidate");
  const lastMessage = messages[messages.length - 1];
  const lastFaculty = [...messages]
    .reverse()
    .find((m) => m.author === "faculty");

  const lastActivity = lastMessage?.postedDate ?? dispute.filedDate;
  const nextStep = (() => {
    if (dispute.status === "Resolved") {
      return "Outcome updated and synced. No further action.";
    }
    if (dispute.status === "Rejected") {
      return "Dispute closed without changes. Candidate notified.";
    }
    if (dispute.status === "Open") {
      return "Awaiting a faculty reviewer to claim the thread.";
    }
    if (!lastMessage) {
      return "Awaiting the candidate's first response.";
    }
    if (lastMessage.author === "candidate") {
      return "Latest candidate reply needs a faculty response.";
    }
    return "Awaiting the candidate's reply on the latest faculty update.";
  })();

  return {
    subject: dispute.field,
    claimPreview: firstCandidate?.body ?? "No candidate claim yet.",
    lastUpdateBody: lastMessage?.body ?? "No messages yet.",
    lastUpdateAuthor: lastMessage?.author ?? null,
    lastUpdateDate: lastActivity,
    lastFacultyBody: lastFaculty?.body ?? "",
    nextStep,
  };
}

type DisputeListProps = {
  records: UniversityDispute[];
  onAccept: (dispute: UniversityDispute) => void;
  onRequestResolve: (dispute: UniversityDispute) => void;
  onRequestReject: (dispute: UniversityDispute) => void;
};

function DisputeList({
  records,
  onAccept,
  onRequestResolve,
  onRequestReject,
}: DisputeListProps) {
  if (records.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No disputes in this status"
        description="When candidates or faculty file a dispute it will show up here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {records.map((dispute) => {
        const brief = deriveDisputeBrief(dispute);
        const handled = isActivelyHandled(dispute);
        const concluded = isConcluded(dispute);
        const isMine = isOwnedByCurrentUser(dispute);
        const lockedForViewer = concluded || (handled && !isMine);
        const showProgressInfo = handled && isMine;
        return (
          <Card
            key={dispute.id}
            className={cn(
              "group border-l-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md",
              STATUS_BORDER[dispute.status],
            )}
          >
            <Link
              href={`/university/disputes/${dispute.id}`}
              aria-label={`Open dispute thread for ${dispute.graduateName}`}
              className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
                    {dispute.graduateInitials}
                  </span>
                  <div className="space-y-1">
                    <CardTitle>
                      <h3>{dispute.graduateName}</h3>
                    </CardTitle>
                    <CardDescription>
                      {dispute.field} · Filed {dispute.filedDate}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {handled ? (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                        isMine
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary/10 text-secondary",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "inline-flex h-1.5 w-1.5 animate-pulse-soft rounded-full",
                          isMine ? "bg-primary" : "bg-secondary",
                        )}
                      />
                      {isMine
                        ? "You are handling"
                        : dispute.acceptedBy
                          ? `Handled by ${dispute.acceptedBy}`
                          : "In progress"}
                    </span>
                  ) : null}
                  <Badge variant={STATUS_VARIANT[dispute.status]}>
                    {dispute.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border bg-card p-4">
                  <small className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Subject
                  </small>
                  <p className="mt-1 text-base font-medium">{brief.subject}</p>
                </div>

                <div className="rounded-lg border bg-surface-tint p-4">
                  <small className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Situation
                  </small>
                  <p className="mt-1 line-clamp-2 text-base">
                    {brief.claimPreview}
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <small className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {brief.lastUpdateAuthor === "candidate"
                      ? "Latest candidate reply"
                      : brief.lastUpdateAuthor === "faculty"
                        ? "Latest faculty update"
                        : "Awaiting first faculty response"}
                  </small>
                  <p className="mt-1 line-clamp-2 text-base">
                    {brief.lastUpdateBody}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {brief.lastUpdateDate}
                  </p>
                </div>

                {showProgressInfo ? (
                  <div className="rounded-lg border bg-card p-4">
                    <small className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Latest faculty note
                    </small>
                    <p className="mt-1 line-clamp-2 text-base">
                      {brief.lastFacultyBody || "No faculty response yet."}
                    </p>
                  </div>
                ) : null}

                {showProgressInfo ? (
                  <div className="rounded-lg border bg-card p-4">
                    <small className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Next step
                    </small>
                    <p className="mt-1 text-base">{brief.nextStep}</p>
                  </div>
                ) : null}
              </CardContent>
            </Link>

            {lockedForViewer ? (
              <CardContent className="border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  {concluded
                    ? "This dispute is closed. No further action is needed."
                    : `This dispute is being handled by ${dispute.acceptedBy ?? "another colleague"}. You can follow the thread, but cannot take action.`}
                </p>
              </CardContent>
            ) : dispute.status === "Open" ? (
              <CardContent className="border-t pt-4">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onAccept(dispute);
                    }}
                  >
                    <Check aria-hidden />
                    Accept
                  </Button>
                </div>
              </CardContent>
            ) : (
              <CardContent className="border-t pt-4">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRequestResolve(dispute);
                    }}
                  >
                    <CheckCircle2 aria-hidden />
                    Resolve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRequestReject(dispute);
                    }}
                  >
                    <X aria-hidden />
                    Reject
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

export function DisputeResolution({
  initialDisputes,
}: {
  initialDisputes: UniversityDispute[];
}) {
  const { push } = useToast();
  const [disputes, setDisputes] = useState(initialDisputes);
  const [search, setSearch] = useState("");
  const [field, setField] = useState("all");
  const [pendingResolve, setPendingResolve] =
    useState<UniversityDispute | null>(null);
  const [pendingReject, setPendingReject] =
    useState<UniversityDispute | null>(null);

  const counts = useMemo(() => countByStatus(disputes), [disputes]);
  const fields = useMemo(
    () => Array.from(new Set(disputes.map((d) => d.field))).sort(),
    [disputes],
  );
  const filteredDisputes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return disputes.filter((dispute) => {
      const matchesSearch =
        query.length === 0 ||
        dispute.graduateName.toLowerCase().includes(query) ||
        dispute.field.toLowerCase().includes(query) ||
        dispute.claim.toLowerCase().includes(query);
      const matchesField = field === "all" || dispute.field === field;
      return matchesSearch && matchesField;
    });
  }, [disputes, search, field]);

  function updateStatus(
    dispute: UniversityDispute,
    nextStatus: DisputeStatus,
    patch: Partial<Pick<UniversityDispute, "acceptedBy">> = {},
    toast?: { title: string; description: string },
  ) {
    if (dispute.status === nextStatus && Object.keys(patch).length === 0) {
      return;
    }
    setDisputes((current) =>
      current.map((record) =>
        record.id === dispute.id
          ? { ...record, status: nextStatus, ...patch }
          : record,
      ),
    );
    if (toast) {
      push({ ...toast, tone: nextStatus === "Resolved" ? "success" : "info" });
    }
  }

  function accept(dispute: UniversityDispute) {
    if (dispute.status !== "Open") return;
    updateStatus(
      dispute,
      "In review",
      { acceptedBy: CURRENT_USER },
      {
        title: `${dispute.graduateName} accepted`,
        description: `You are now handling this dispute.`,
      },
    );
  }

  function requestResolve(dispute: UniversityDispute) {
    if (dispute.status !== "In review") return;
    if (dispute.acceptedBy !== CURRENT_USER) return;
    setPendingResolve(dispute);
  }

  function requestReject(dispute: UniversityDispute) {
    if (dispute.status !== "In review") return;
    if (dispute.acceptedBy !== CURRENT_USER) return;
    setPendingReject(dispute);
  }

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
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
          const share =
            disputes.length > 0
              ? Math.round((value / disputes.length) * 100)
              : 0;
          return (
            <Card key={status}>
              <CardContent className="space-y-2 p-5">
                <div
                  aria-hidden
                  className="flex h-9 w-9 items-center justify-center rounded-md bg-muted"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <div className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
                  {value}
                </div>
                <p className="text-base text-muted-foreground">{status}</p>
                <p className="text-sm text-muted-foreground">
                  {share}% of queue · {disputes.length} overall
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-subheading">All disputes</h2>
            <p className="text-sm text-muted-foreground">Search the queue and act on disputes you are handling.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              push({
                title: "Dispute policy opened",
                description: "Faculty resolution guidance is ready to review.",
                tone: "info",
              })
            }
          >
            <ShieldAlert aria-hidden />
            Dispute policy
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-0 flex-1 space-y-1.5 sm:min-w-[16rem]">
            <label htmlFor="dispute-search" className="block">
              <small className="text-sm font-medium text-foreground">Search</small>
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="dispute-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by graduate, field, or claim"
                className="pl-9"
                aria-label="Search disputes by graduate, field, or claim"
              />
            </div>
          </div>
          <div className="space-y-1.5 sm:w-[16rem]">
            <label htmlFor="dispute-field" className="block">
              <small className="text-sm font-medium text-foreground">Field</small>
            </label>
            <Select value={field} onValueChange={setField}>
              <SelectTrigger
                id="dispute-field"
                className="w-full sm:w-[16rem]"
                aria-label="Filter by dispute field"
              >
                <SelectValue placeholder="All fields" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All fields</SelectItem>
                {fields.map((disputeField) => (
                  <SelectItem key={disputeField} value={disputeField}>
                    {disputeField}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DisputeList
          records={filteredDisputes}
          onAccept={accept}
          onRequestResolve={requestResolve}
          onRequestReject={requestReject}
        />

        <ConfirmDialog
          open={pendingResolve !== null}
          onOpenChange={(open) => {
            if (!open) setPendingResolve(null);
          }}
          title="Resolve this dispute?"
          description={
            pendingResolve ? (
              <>
                <strong>{pendingResolve.graduateName}</strong>&apos;s
                dispute will be marked as Resolved. The candidate will be
                notified and the outcome will sync to their credential.
              </>
            ) : null
          }
          confirmLabel="Resolve"
          onConfirm={() => {
            if (pendingResolve) {
              updateStatus(
                pendingResolve,
                "Resolved",
                {},
                {
                  title: `${pendingResolve.graduateName} resolved`,
                  description: "Outcome updated and synced.",
                },
              );
            }
            setPendingResolve(null);
          }}
        />

        <ConfirmDialog
          open={pendingReject !== null}
          onOpenChange={(open) => {
            if (!open) setPendingReject(null);
          }}
          title="Reject this dispute?"
          description={
            pendingReject ? (
              <>
                <strong>{pendingReject.graduateName}</strong>&apos;s dispute
                will be rejected. The candidate will be notified that the
                dispute was closed without changes.
              </>
            ) : null
          }
          confirmLabel="Reject"
          destructive
          requireTyping="REJECT"
          onConfirm={() => {
            if (pendingReject) {
              updateStatus(
                pendingReject,
                "Rejected",
                {},
                {
                  title: `${pendingReject.graduateName} rejected`,
                  description: "Dispute closed without changes. Candidate notified.",
                },
              );
            }
            setPendingReject(null);
          }}
        />
      </section>
    </div>
  );
}

/** "Candidate claim" for the first message, "Candidate reply" after that. */
function threadMessageLabel(
  message: DisputeMessage,
  index: number,
  messages: DisputeMessage[],
): string {
  if (message.author === "faculty") return "Faculty counter";
  const isFirstFromCandidate = messages
    .slice(0, index)
    .every((m) => m.author !== "candidate");
  return isFirstFromCandidate ? "Candidate claim" : "Candidate reply";
}

function ThreadMessageCard({
  message,
  label,
}: {
  message: DisputeMessage;
  label: string;
}) {
  const isFaculty = message.author === "faculty";
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        isFaculty ? "bg-card" : "bg-surface-tint",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <small className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </small>
          <p className="text-xs text-muted-foreground">{message.postedDate}</p>
        </div>
      </div>

      <p className="mt-1 text-base">{message.body}</p>
    </div>
  );
}

export function DisputeThreadView({
  initialDispute,
}: {
  initialDispute: UniversityDispute;
}) {
  const { push } = useToast();
  const [dispute, setDispute] = useState(initialDispute);
  const [messages, setMessages] = useState<DisputeMessage[]>(
    initialDispute.messages,
  );
  const [reply, setReply] = useState("");

  const handled = isActivelyHandled(dispute);
  const concluded = isConcluded(dispute);
  const isMine = dispute.acceptedBy === CURRENT_USER;

  function sendReply() {
    if (!reply.trim()) return;
    const message: DisputeMessage = {
      id: `d${dispute.id}-m${messages.length + 1}`,
      author: "faculty",
      body: reply.trim(),
      postedDate: "Just now",
    };
    setMessages((current) => [...current, message]);
    setReply("");
    push({
      title: "Response sent",
      description: "Your reply was added to the thread and the candidate will be notified.",
      tone: "success",
    });
  }

  function accept() {
    if (dispute.status !== "Open") return;
    setDispute((current) => ({
      ...current,
      status: "In review",
      acceptedBy: CURRENT_USER,
    }));
    push({
      title: `${dispute.graduateName}: Accepted`,
      description: `You are now handling this dispute. Other employees will see it as in progress.`,
      tone: "info",
    });
  }

  function resolve() {
    if (dispute.status !== "In review") return;
    if (!isMine) {
      push({
        title: `Cannot resolve`,
        description: `Only ${dispute.acceptedBy ?? "the colleague who accepted"} can resolve this dispute.`,
        tone: "info",
      });
      return;
    }
    setDispute((current) => ({ ...current, status: "Resolved" }));
    push({
      title: `${dispute.graduateName}: Resolved`,
      description: `Outcome updated and synced.`,
      tone: "success",
    });
  }

  function reject() {
    if (dispute.status !== "In review") return;
    if (!isMine) {
      push({
        title: `Cannot reject`,
        description: `Only ${dispute.acceptedBy ?? "the colleague who accepted"} can reject this dispute.`,
        tone: "info",
      });
      return;
    }
    const reason = window.prompt(
      "Reason for rejection (will be sent to the candidate):",
    );
    if (reason === null) return;
    setDispute((current) => ({ ...current, status: "Rejected" }));
    push({
      title: `${dispute.graduateName}: Rejected`,
      description: reason.trim()
        ? `Reason: ${reason.trim()}`
        : `Status changed from In review.`,
      tone: "info",
    });
  }

  return (
    <div className="space-y-6">
      <BackButton fallbackHref="/university/disputes" />

      <header className="space-y-2">
        <p className="text-caption">Dispute thread</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-heading">{dispute.graduateName}</h1>
          <Badge variant={STATUS_VARIANT[dispute.status]}>
            {dispute.status}
          </Badge>
          {handled ? (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                isMine
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary/10 text-secondary",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "inline-flex h-1.5 w-1.5 animate-pulse-soft rounded-full",
                  isMine ? "bg-primary" : "bg-secondary",
                )}
              />
              {isMine
                ? "You are handling"
                : dispute.acceptedBy
                  ? `Handled by ${dispute.acceptedBy}`
                  : "In progress"}
            </span>
          ) : null}
        </div>
        <p className="text-body text-muted-foreground">
          {dispute.field} · Filed {dispute.filedDate}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Dispute thread</h2>
          </CardTitle>
          <CardDescription>
            The full back-and-forth between the candidate and faculty.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.map((message, index) => (
            <ThreadMessageCard
              key={message.id}
              message={message}
              label={threadMessageLabel(message, index, messages)}
            />
          ))}

          {isMine || dispute.status === "Open" ? (
            <div className="space-y-2 border-t pt-4">
              <label
                htmlFor="faculty-reply"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Add a faculty response
              </label>
              <Textarea
                id="faculty-reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder="Write the faculty's response to the candidate..."
              />
              <div className="flex justify-end">
                <Button size="sm" disabled={!reply.trim()} onClick={sendReply}>
                  <Send aria-hidden />
                  Send response
                </Button>
              </div>
            </div>
          ) : (
            <p className="border-t pt-4 text-sm text-muted-foreground">
              {handled
                ? `This dispute is being handled by ${dispute.acceptedBy ?? "another colleague"}. You can read the conversation, but cannot post a response.`
                : "This dispute is closed. No further responses can be posted."}
            </p>
          )}
        </CardContent>
      </Card>

      {concluded ? (
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Update status</h2>
            </CardTitle>
            <CardDescription>
              This dispute is closed. No further action is needed.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : dispute.status === "Open" ? (
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Update status</h2>
            </CardTitle>
            <CardDescription>
              Accept the task to start handling it, and the rest of the team
              will see it as in progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button size="sm" onClick={accept}>
              <Check aria-hidden />
              Accept
            </Button>
          </CardContent>
        </Card>
      ) : isMine ? (
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Update status</h2>
            </CardTitle>
            <CardDescription>
              You are handling this dispute. Resolve or reject it once the
              thread has run its course.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button size="sm" onClick={resolve}>
              <CheckCircle2 aria-hidden />
              Resolve
            </Button>
            <Button variant="outline" size="sm" onClick={reject}>
              <X aria-hidden />
              Reject
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Update status</h2>
            </CardTitle>
            <CardDescription>
              This dispute is currently in progress. Only{" "}
              {dispute.acceptedBy ?? "the colleague who accepted"} can resolve,
              reject, or post responses.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
