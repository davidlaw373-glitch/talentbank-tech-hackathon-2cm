"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Inbox,
  Plus,
  ShieldAlert,
  X,
} from "lucide-react";

import { PageHeading } from "@/components/common/page-heading";
import { useToast } from "@/components/common/toast";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import type {
  DisputeStatus,
  UniversityDispute,
} from "@/types/university";

const STATUSES: DisputeStatus[] = ["Open", "In review", "Resolved", "Rejected"];
type DisputeTab = DisputeStatus | "All";

const STATUS_DESCRIPTION: Record<DisputeStatus, string> = {
  Open: "Awaiting faculty reviewer.",
  "In review": "Faculty reviewer assigned.",
  Resolved: "Outcome updated and synced.",
  Rejected: "Dispute was not upheld.",
};

const STATUS_VARIANT: Record<
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
  onRequestReject: (dispute: UniversityDispute) => void;
};

function DisputeList({ records, onStatusChange, onRequestReject }: DisputeListProps) {
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
              <small className="font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Candidate claim
              </small>
              <p className="mt-1">{dispute.claim}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <small className="font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Faculty counter
              </small>
              <p className="mt-1">{dispute.counter}</p>
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
              <Button
                size="sm"
                disabled={dispute.status === "Resolved"}
                onClick={() => onStatusChange(dispute, "Resolved")}
              >
                <CheckCircle2 aria-hidden />
                {dispute.status === "Resolved" ? "Already resolved" : "Resolve"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={dispute.status === "Rejected"}
                onClick={() => onRequestReject(dispute)}
              >
                <X aria-hidden />
                Reject
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
  const [pendingReject, setPendingReject] = useState<UniversityDispute | null>(
    null,
  );
  const counts = useMemo(() => countByStatus(disputes), [disputes]);

  function updateStatus(dispute: UniversityDispute, nextStatus: DisputeStatus) {
    if (dispute.status === nextStatus) {
      push({
        title:
          nextStatus === "Resolved"
            ? "Already resolved"
            : `${dispute.graduateName} is already ${nextStatus.toLowerCase()}`,
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
      title:
        nextStatus === "Resolved"
          ? "Already resolved"
          : `${dispute.graduateName}: ${nextStatus}`,
      description: `${dispute.graduateName}'s dispute changed from ${dispute.status} to ${nextStatus}.`,
      tone: nextStatus === "Resolved" ? "success" : "info",
    });
  }

  return (
    <div className="space-y-8">
      <PageHeading
        title="Dispute resolution"
        description="Review, mediate, and resolve disputes between candidates and faculty."
        action={
          <Button
            onClick={() =>
              push({
                title: "Opened the dispute form",
                description: "Add the graduate, claim, and supporting evidence.",
                tone: "info",
              })
            }
          >
            <Plus aria-hidden />
            New dispute
          </Button>
        }
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
            <Card key={status} className="lift-on-hover">
              <CardContent className="space-y-2 p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <div className="text-3xl font-semibold tabular-nums">
                  {counts[status]}
                </div>
                <p>{status}</p>
                <p className="text-muted-foreground">
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
            <h2>All disputes</h2>
            <p>Filter by status to focus the queue.</p>
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

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as DisputeTab)}
        >
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="All">All · {disputes.length}</TabsTrigger>
            {STATUSES.map((status) => (
              <TabsTrigger key={status} value={status}>
                {status} · {counts[status]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="All" className="mt-4">
            <DisputeList
              records={disputes}
              onStatusChange={updateStatus}
              onRequestReject={setPendingReject}
            />
          </TabsContent>

          {STATUSES.map((status) => (
            <TabsContent key={status} value={status} className="mt-4">
              <DisputeList
                records={disputes.filter(
                  (dispute) => dispute.status === status,
                )}
                onStatusChange={updateStatus}
                onRequestReject={setPendingReject}
              />
            </TabsContent>
          ))}
        </Tabs>

        <ConfirmDialog
          open={pendingReject !== null}
          onOpenChange={(open) => !open && setPendingReject(null)}
          title="Reject this dispute?"
          description={
            pendingReject ? (
              <>
                The dispute for <strong>{pendingReject.graduateName}</strong>{" "}
                will be marked Rejected. They&apos;ll be notified by email.
              </>
            ) : null
          }
          confirmLabel="Reject dispute"
          destructive
          onConfirm={() => {
            if (pendingReject) updateStatus(pendingReject, "Rejected");
            setPendingReject(null);
          }}
        />
      </section>
    </div>
  );
}
