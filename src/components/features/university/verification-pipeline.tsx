"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  CheckSquare,
  Clock,
  FileUp,
  FolderArchive,
  Inbox,
  RefreshCw,
  ShieldCheck,
  Square,
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
import type {
  GraduateRecord,
  VerificationRecordStatus,
} from "@/types/university";

const STATUSES: VerificationRecordStatus[] = [
  "Verified",
  "Pending review",
  "Action required",
  "Disputed",
];

type VerificationTab = VerificationRecordStatus | "All";

const STATUS_DESCRIPTION: Record<VerificationRecordStatus, string> = {
  Verified: "Credentials confirmed by faculty.",
  "Pending review": "Awaiting faculty sign-off.",
  "Action required": "Missing information from candidate.",
  Disputed: "Open dispute filed against this record.",
};

const STATUS_ICON: Record<
  VerificationRecordStatus,
  React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
> = {
  Verified: CheckCircle2,
  "Pending review": Clock,
  "Action required": AlertCircle,
  Disputed: AlertCircle,
};

const STATUS_VARIANT: Record<
  VerificationRecordStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Verified: "default",
  "Pending review": "secondary",
  "Action required": "outline",
  Disputed: "destructive",
};

function countByStatus(records: GraduateRecord[]) {
  const counts: Record<VerificationRecordStatus, number> = {
    Verified: 0,
    "Pending review": 0,
    "Action required": 0,
    Disputed: 0,
  };
  for (const graduate of records) counts[graduate.status] += 1;
  return counts;
}

type GraduateListProps = {
  records: GraduateRecord[];
  selected: Set<number>;
  onToggleSelected: (graduateId: number) => void;
  onStatusChange: (
    graduate: GraduateRecord,
    status: VerificationRecordStatus,
  ) => void;
  onRequestMarkDispute: (graduate: GraduateRecord) => void;
};

function GraduateList({
  records,
  selected,
  onToggleSelected,
  onStatusChange,
  onRequestMarkDispute,
}: GraduateListProps) {
  if (records.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No records in this stage"
        description="When graduates reach this verification status they will appear here."
      />
    );
  }

  return (
    <ul className="divide-y">
      {records.map((graduate) => {
        const isSelected = selected.has(graduate.id);
        return (
          <li
            key={graduate.id}
            className="flex flex-wrap items-center justify-between gap-4 p-4"
          >
            <div className="flex items-start gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-pressed={isSelected}
                aria-label={`${isSelected ? "Deselect" : "Select"} ${graduate.name}`}
                onClick={() => onToggleSelected(graduate.id)}
              >
                {isSelected ? (
                  <CheckSquare aria-hidden />
                ) : (
                  <Square aria-hidden />
                )}
              </Button>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
                {graduate.initials}
              </span>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p>{graduate.name}</p>
                  <Badge variant={STATUS_VARIANT[graduate.status]}>
                    {graduate.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {graduate.program} · Class of {graduate.graduationYear}
                </p>
                <p className="text-muted-foreground">
                  Capstone: {graduate.capstone}
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {graduate.skills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/university/graduates/${graduate.id}`}>
                  View record
                </Link>
              </Button>
              <Button
                size="sm"
                disabled={graduate.status === "Verified"}
                onClick={() => onStatusChange(graduate, "Verified")}
              >
                Approve
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={graduate.status === "Action required"}
                onClick={() => onStatusChange(graduate, "Action required")}
              >
                Request info
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={graduate.status === "Disputed"}
                onClick={() => onRequestMarkDispute(graduate)}
              >
                Mark dispute
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function VerificationPipeline({
  initialRecords,
}: {
  initialRecords: GraduateRecord[];
}) {
  const { push } = useToast();
  const [records, setRecords] = useState(initialRecords);
  const [activeTab, setActiveTab] = useState<VerificationTab>("All");
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [pendingMarkDispute, setPendingMarkDispute] =
    useState<GraduateRecord | null>(null);

  const counts = useMemo(() => countByStatus(records), [records]);
  const visibleRecords = useMemo(
    () =>
      activeTab === "All"
        ? records
        : records.filter((record) => record.status === activeTab),
    [activeTab, records],
  );
  const allVisibleSelected =
    visibleRecords.length > 0 &&
    visibleRecords.every((record) => selected.has(record.id));

  function changeTab(value: VerificationTab) {
    setActiveTab(value);
    setSelected(new Set());
  }

  function toggleSelected(graduateId: number) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(graduateId)) next.delete(graduateId);
      else next.add(graduateId);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelected((current) => {
      const next = new Set(current);
      if (allVisibleSelected) {
        for (const record of visibleRecords) next.delete(record.id);
      } else {
        for (const record of visibleRecords) next.add(record.id);
      }
      return next;
    });
  }

  function updateRecordStatus(
    graduate: GraduateRecord,
    nextStatus: VerificationRecordStatus,
  ) {
    if (graduate.status === nextStatus) return;
    setRecords((current) =>
      current.map((record) =>
        record.id === graduate.id ? { ...record, status: nextStatus } : record,
      ),
    );
    setSelected((current) => {
      const next = new Set(current);
      next.delete(graduate.id);
      return next;
    });
    push({
      title: `${graduate.name} moved to ${nextStatus}`,
      description: `Status changed from ${graduate.status}.`,
      tone: nextStatus === "Verified" ? "success" : "info",
    });
  }

  function bulkUpdate(nextStatus: VerificationRecordStatus) {
    const ids = selected;
    const count = ids.size;
    if (count === 0) {
      push({
        title: "No records selected",
        description: "Select at least one visible record first.",
        tone: "info",
      });
      return;
    }

    setRecords((current) =>
      current.map((record) =>
        ids.has(record.id) ? { ...record, status: nextStatus } : record,
      ),
    );
    setSelected(new Set());
    push({
      title:
        nextStatus === "Verified"
          ? `${count} ${count === 1 ? "record" : "records"} approved`
          : `Information requested for ${count} ${count === 1 ? "record" : "records"}`,
      description: `Selected records moved to ${nextStatus}.`,
      tone: nextStatus === "Verified" ? "success" : "info",
    });
  }

  return (
    <div className="space-y-8">
      <PageHeading
        title="Verification pipeline"
        description="Approve, request more information, or escalate disputes from a single queue."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                push({
                  title: "Bulk import opened",
                  description: "Choose a graduate records file to continue.",
                  tone: "info",
                })
              }
            >
              <FolderArchive aria-hidden />
              Bulk import
            </Button>
            <Button
              onClick={() =>
                push({
                  title: "Record sync started",
                  description: "We'll notify you when the pipeline is refreshed.",
                  tone: "success",
                })
              }
            >
              <RefreshCw aria-hidden />
              Sync records
            </Button>
          </div>
        }
      />

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {STATUSES.map((status) => {
          const Icon = STATUS_ICON[status];
          const value = counts[status];
          const share =
            records.length > 0 ? Math.round((value / records.length) * 100) : 0;
          return (
            <Card key={status} className="lift-on-hover">
              <CardContent className="space-y-3 p-5">
                <span className="flex items-center justify-between">
                  <span
                    aria-hidden
                    className="flex h-9 w-9 items-center justify-center rounded-md bg-muted"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>
                </span>
                <span className="text-4xl font-semibold tabular-nums">
                  {value}
                </span>
                <span className="text-muted-foreground">
                  {STATUS_DESCRIPTION[status]}
                </span>
                <span className="space-y-1">
                  <span className="flex items-center justify-between">
                    <small className="text-muted-foreground">Share</small>
                    <small className="tabular-nums">{share}%</small>
                  </span>
                  <span
                    aria-hidden
                    className="block h-1.5 overflow-hidden rounded-full bg-muted"
                  >
                    <span
                      className="block h-full rounded-full bg-foreground animate-progress-x"
                      style={{ width: `${share}%` }}
                    />
                  </span>
                </span>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2>Records queue</h2>
            <p>Filter the queue by verification status.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              push({
                title: "Selected records export prepared",
                description: `${selected.size} ${selected.size === 1 ? "record" : "records"} included.`,
                tone: "success",
              })
            }
          >
            <FileUp aria-hidden />
            Export selected
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => changeTab(value as VerificationTab)}
        >
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="All">All · {records.length}</TabsTrigger>
            {STATUSES.map((status) => (
              <TabsTrigger key={status} value={status}>
                {status} · {counts[status]}
              </TabsTrigger>
            ))}
          </TabsList>

          <Card className="mt-4">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-pressed={allVisibleSelected}
                  aria-label={`${allVisibleSelected ? "Deselect" : "Select"} all visible records`}
                  onClick={toggleAllVisible}
                  disabled={visibleRecords.length === 0}
                >
                  {allVisibleSelected ? (
                    <CheckSquare aria-hidden />
                  ) : (
                    <Square aria-hidden />
                  )}
                </Button>
                <p>Select all visible</p>
                <small className="text-muted-foreground">
                  {selected.size} selected
                </small>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkUpdate("Verified")}
                >
                  <CheckSquare aria-hidden />
                  Approve selected
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => bulkUpdate("Action required")}
                >
                  <AlertCircle aria-hidden />
                  Request info on selected
                </Button>
              </div>
            </CardContent>
          </Card>

          <TabsContent value="All" className="mt-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  <h3 className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" aria-hidden />
                    All records
                  </h3>
                </CardTitle>
                <CardDescription>
                  {records.length} records across every status.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <GraduateList
                  records={records}
                  selected={selected}
                  onToggleSelected={toggleSelected}
                  onStatusChange={updateRecordStatus}
                  onRequestMarkDispute={setPendingMarkDispute}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {STATUSES.map((status) => {
            const statusRecords = records.filter(
              (record) => record.status === status,
            );
            return (
              <TabsContent key={status} value={status} className="mt-3">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <h3>{status}</h3>
                    </CardTitle>
                    <CardDescription>
                      {STATUS_DESCRIPTION[status]}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <GraduateList
                      records={statusRecords}
                      selected={selected}
                      onToggleSelected={toggleSelected}
                      onStatusChange={updateRecordStatus}
                      onRequestMarkDispute={setPendingMarkDispute}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        <ConfirmDialog
          open={pendingMarkDispute !== null}
          onOpenChange={(open) => !open && setPendingMarkDispute(null)}
          title="Mark this graduate as disputed?"
          description={
            pendingMarkDispute ? (
              <>
                <strong>{pendingMarkDispute.name}</strong> will be flagged for
                verification review. Their employer pipeline will be paused
                until the dispute is resolved.
              </>
            ) : null
          }
          confirmLabel="Mark dispute"
          destructive
          onConfirm={() => {
            if (pendingMarkDispute)
              updateRecordStatus(pendingMarkDispute, "Disputed");
            setPendingMarkDispute(null);
          }}
        />
      </section>
    </div>
  );
}
