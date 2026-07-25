"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Inbox,
  Pencil,
  Search,
  Send,
  ShieldAlert,
  X,
} from "lucide-react";

import { PageHeading } from "@/components/common/page-heading";
import { useToast } from "@/components/common/toast";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type {
  DisputeStatus,
  UniversityDispute,
} from "@/types/university";
import type { DisputeMessage } from "@/types/dispute";

const STATUSES: DisputeStatus[] = ["Open", "In review", "Resolved", "Rejected"];
type DisputeTab = DisputeStatus | "All";

const STATUS_DESCRIPTION: Record<DisputeStatus, string> = {
  Open: "Awaiting faculty reviewer.",
  "In review": "Faculty reviewer assigned.",
  Resolved: "Outcome updated and synced.",
  Rejected: "Dispute was not upheld.",
};

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

type DisputeListProps = {
  records: UniversityDispute[];
  onStatusChange: (dispute: UniversityDispute, status: DisputeStatus) => void;
};

function DisputeList({ records, onStatusChange }: DisputeListProps) {
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
      {records.map((dispute) => (
        <Card
          key={dispute.id}
          className={cn("border-l-4", STATUS_BORDER[dispute.status])}
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
            <Badge variant={STATUS_VARIANT[dispute.status]}>
              {dispute.status}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-surface-tint p-4">
              <small className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Candidate claim
              </small>
              <p className="mt-1 text-base">{dispute.claim}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <small className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Faculty counter
              </small>
              <p className="mt-1 text-base">
                {dispute.counter || "No faculty response yet."}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/university/disputes/${dispute.id}`}>
                  <ArrowRight aria-hidden />
                  View thread
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={dispute.status === "Open"}
                onClick={() => onStatusChange(dispute, "Open")}
              >
                <AlertCircle aria-hidden />
                Open
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={dispute.status === "In review"}
                onClick={() => onStatusChange(dispute, "In review")}
              >
                <Clock aria-hidden />
                In review
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
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
  const [activeTab, setActiveTab] = useState<DisputeTab>("All");
  const [search, setSearch] = useState("");
  const counts = useMemo(() => countByStatus(disputes), [disputes]);
  const filteredDisputes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return disputes;
    return disputes.filter(
      (dispute) =>
        dispute.graduateName.toLowerCase().includes(query) ||
        dispute.field.toLowerCase().includes(query) ||
        dispute.claim.toLowerCase().includes(query),
    );
  }, [disputes, search]);

  function updateStatus(dispute: UniversityDispute, nextStatus: DisputeStatus) {
    if (dispute.status === nextStatus) {
      push({
        title: `${dispute.graduateName} is already ${nextStatus.toLowerCase()}`,
        description: "No status change was needed.",
        tone: "info",
      });
      return;
    }

    setDisputes((current) =>
      current.map((record) =>
        record.id === dispute.id ? { ...record, status: nextStatus } : record,
      ),
    );
    push({
      title: `${dispute.graduateName}: ${nextStatus}`,
      description: `${dispute.graduateName}'s dispute changed from ${dispute.status} to ${nextStatus}.`,
      tone: nextStatus === "Resolved" ? "success" : "info",
    });
  }

  return (
    <div className="space-y-8">
      <PageHeading
        title="Dispute resolution"
        description="Review, mediate, and resolve disputes between candidates and faculty."
      />

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
          return (
            <Card key={status}>
              <CardContent className="space-y-2 p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <div className="text-3xl font-semibold tabular-nums">
                  {counts[status]}
                </div>
                <p className="text-base">{status}</p>
                <p className="text-sm text-muted-foreground">
                  {STATUS_DESCRIPTION[status]}
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
            <p className="text-sm text-muted-foreground">Filter by status to focus the queue.</p>
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

        <div className="flex min-w-0 flex-col gap-1.5">
          <label
            htmlFor="dispute-search"
            className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            Search
          </label>
          <div className="relative sm:max-w-sm">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="dispute-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Graduate, field, or claim"
              className="pl-9"
            />
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as DisputeTab)}
        >
          <TabsList className="flex h-auto flex-wrap justify-start gap-1">
            <TabsTrigger value="All" className="gap-2">
              All
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                {filteredDisputes.length}
              </span>
            </TabsTrigger>
            {STATUSES.map((status) => (
              <TabsTrigger key={status} value={status} className="gap-2">
                {status}
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                  {counts[status]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="All" className="mt-4">
            <DisputeList
              records={filteredDisputes}
              onStatusChange={updateStatus}
            />
          </TabsContent>

          {STATUSES.map((status) => (
            <TabsContent key={status} value={status} className="mt-4">
              <DisputeList
                records={filteredDisputes.filter(
                  (dispute) => dispute.status === status,
                )}
                onStatusChange={updateStatus}
              />
            </TabsContent>
          ))}
        </Tabs>
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
  canEdit,
  editing,
  editDraft,
  onEditDraftChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
}: {
  message: DisputeMessage;
  label: string;
  canEdit: boolean;
  editing: boolean;
  editDraft: string;
  onEditDraftChange: (value: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
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
          <p className="text-xs text-muted-foreground">
            {message.postedDate}
            {message.edited ? " · Edited" : ""}
          </p>
        </div>
        {canEdit && !editing ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Edit this response"
            onClick={onStartEdit}
          >
            <Pencil aria-hidden />
          </Button>
        ) : null}
      </div>

      {editing ? (
        <div className="mt-2 space-y-2">
          <Textarea
            value={editDraft}
            onChange={(e) => onEditDraftChange(e.target.value)}
            rows={3}
            aria-label="Edit faculty counter"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onCancelEdit}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!editDraft.trim()}
              onClick={onSaveEdit}
            >
              Save changes
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-1 text-base">{message.body}</p>
      )}
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [pendingReject, setPendingReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const lastMessage = messages[messages.length - 1] as DisputeMessage | undefined;

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

  function startEdit(message: DisputeMessage) {
    setEditingId(message.id);
    setEditDraft(message.body);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft("");
  }

  function saveEdit() {
    if (!editingId || !editDraft.trim()) return;
    setMessages((current) =>
      current.map((m) =>
        m.id === editingId ? { ...m, body: editDraft.trim(), edited: true } : m,
      ),
    );
    setEditingId(null);
    setEditDraft("");
    push({
      title: "Response updated",
      description: "Your edit now shows in the thread, marked as edited.",
      tone: "success",
    });
  }

  function updateStatus(nextStatus: DisputeStatus, reason?: string) {
    if (dispute.status === nextStatus) {
      push({
        title: `Already ${nextStatus.toLowerCase()}`,
        description: "No status change was needed.",
        tone: "info",
      });
      return;
    }
    const previousStatus = dispute.status;
    setDispute((current) => ({ ...current, status: nextStatus }));
    push({
      title: `${dispute.graduateName}: ${nextStatus}`,
      description: reason
        ? `Reason: ${reason}`
        : `Status changed from ${previousStatus}.`,
      tone: nextStatus === "Resolved" ? "success" : "info",
    });
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" size="sm">
        <Link href="/university/disputes">
          <ArrowLeft aria-hidden />
          Back
        </Link>
      </Button>

      <header className="space-y-2">
        <p className="text-caption">Dispute thread</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-heading">{dispute.graduateName}</h1>
          <Badge variant={STATUS_VARIANT[dispute.status]}>
            {dispute.status}
          </Badge>
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
            The full back-and-forth between the candidate and faculty. Once a
            newer message exists, earlier messages are locked — only the
            latest, unanswered faculty response can still be edited.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.map((message, index) => (
            <ThreadMessageCard
              key={message.id}
              message={message}
              label={threadMessageLabel(message, index, messages)}
              canEdit={
                message.author === "faculty" && message.id === lastMessage?.id
              }
              editing={editingId === message.id}
              editDraft={editDraft}
              onEditDraftChange={setEditDraft}
              onStartEdit={() => startEdit(message)}
              onSaveEdit={saveEdit}
              onCancelEdit={cancelEdit}
            />
          ))}

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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Update status</h2>
          </CardTitle>
          <CardDescription>
            Move this dispute through the resolution pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={dispute.status === "Open"}
            onClick={() => updateStatus("Open")}
          >
            <AlertCircle aria-hidden />
            Open
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={dispute.status === "In review"}
            onClick={() => updateStatus("In review")}
          >
            <Clock aria-hidden />
            In review
          </Button>
          <Button
            size="sm"
            disabled={dispute.status === "Resolved"}
            onClick={() => updateStatus("Resolved")}
          >
            <CheckCircle2 aria-hidden />
            Resolve
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={dispute.status === "Rejected"}
            onClick={() => setPendingReject(true)}
          >
            <X aria-hidden />
            Reject
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={pendingReject}
        onOpenChange={(open) => {
          if (!open) {
            setPendingReject(false);
            setRejectReason("");
          }
        }}
        title="Reject this dispute?"
        description={
          <>
            The dispute for <strong>{dispute.graduateName}</strong> will be
            marked Rejected. They&apos;ll be notified by email.
          </>
        }
        confirmLabel="Reject dispute"
        destructive
        noteLabel="Reason for rejection"
        noteValue={rejectReason}
        onNoteChange={setRejectReason}
        noteRequired
        onConfirm={() => {
          updateStatus("Rejected", rejectReason);
          setPendingReject(false);
          setRejectReason("");
        }}
      />
    </div>
  );
}
