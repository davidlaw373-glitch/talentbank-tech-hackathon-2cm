"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  FileCheck2,
  FileText,
  History,
  Info,
  XCircle,
} from "lucide-react";

import { useCareerOSDemo } from "@/components/common/careeros-demo-provider";
import { useUniversityRole } from "@/components/features/university/university-role-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { selectVerificationAudit } from "@/lib/university-demo-state";
import type {
  AcademicVerificationStatus,
  Graduate,
  VerificationAuditEntry,
  VerificationDecision,
  VerificationRecord,
} from "@/types/university";

const verificationStatuses: AcademicVerificationStatus[] = [
  "Pending",
  "Verified",
  "Rejected",
  "Disputed",
];

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function statusVariant(status: AcademicVerificationStatus) {
  if (status === "Verified") return "secondary" as const;
  if (status === "Rejected") return "destructive" as const;
  return "outline" as const;
}

function canDecide(record: VerificationRecord | null) {
  return Boolean(
    record && (record.status === "Pending" || record.status === "Disputed")
  );
}

export function VerificationCenter() {
  const { role } = useUniversityRole();
  const { state, execute } = useCareerOSDemo();
  const [activeStatus, setActiveStatus] =
    useState<AcademicVerificationStatus>("Pending");
  const [selectedId, setSelectedId] = useState<string | null>(
    state.verificationRecords.find((record) => record.status === "Pending")?.id ??
      null
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [requestNote, setRequestNote] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionConfirmed, setRejectionConfirmed] = useState(false);
  const [notice, setNotice] = useState("");

  const isRegistry = role === "registry";
  const recordsByStatus = useMemo(
    () =>
      Object.fromEntries(
        verificationStatuses.map((status) => [
          status,
          state.verificationRecords.filter((record) => record.status === status),
        ])
      ) as Record<AcademicVerificationStatus, VerificationRecord[]>,
    [state.verificationRecords]
  );
  const selectedRecord =
    state.verificationRecords.find((record) => record.id === selectedId) ?? null;
  const selectedGraduate = selectedRecord
    ? state.graduates.find(
        (graduate) => graduate.id === selectedRecord.graduateId
      ) ?? null
    : null;
  const selectedHistory = selectedRecord
    ? selectVerificationAudit(state, selectedRecord.id)
    : [];
  const isDecidable = canDecide(selectedRecord);
  const selectedRecords = state.verificationRecords.filter((record) =>
    selectedIds.includes(record.id)
  );
  const selectedEvidenceTypes = new Set(
    selectedRecords.map((record) => record.evidenceType)
  );
  const bulkUnavailableReason =
    selectedRecords.length === 0
      ? "Select at least one eligible record to approve a batch."
      : selectedRecords.some((record) => !canDecide(record))
        ? "Only Pending or Disputed records can be approved."
        : selectedEvidenceTypes.size > 1
          ? "Selected records must share the same evidence type."
          : selectedRecords.some((record) => !record.evidenceComplete)
            ? "Every selected record must have complete evidence."
            : null;

  function resetDecisionForms() {
    setRequestNote("");
    setShowRejectForm(false);
    setRejectionReason("");
    setRejectionConfirmed(false);
  }

  function handleStatusChange(status: AcademicVerificationStatus) {
    setActiveStatus(status);
    setSelectedId(recordsByStatus[status][0]?.id ?? null);
    setSelectedIds([]);
    resetDecisionForms();
  }

  function selectRecord(record: VerificationRecord) {
    setSelectedId(record.id);
    resetDecisionForms();
  }

  function executeDecision(
    record: VerificationRecord,
    decision: VerificationDecision,
    note?: string
  ) {
    const result = execute({
      type: "verification/decide",
      role,
      recordId: record.id,
      decision,
      note,
      actor: "Registry Demo User",
      occurredAt: new Date().toISOString(),
    });
    setNotice(result.ok ? result.message : result.error);
    if (!result.ok) return;

    const nextStatus =
      decision === "approve"
        ? "Verified"
        : decision === "reject"
          ? "Rejected"
          : "Pending";
    setActiveStatus(nextStatus);
    setSelectedId(record.id);
    setSelectedIds((ids) => ids.filter((id) => id !== record.id));
    resetDecisionForms();
  }

  function requestMoreInformation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRecord || !isRegistry || !isDecidable) {
      setNotice(
        isRegistry
          ? "Only Pending or Disputed records can request more information."
          : "Registry access is required to change academic verification."
      );
      return;
    }
    executeDecision(selectedRecord, "request-information", requestNote);
  }

  function rejectRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRecord || !isRegistry || !isDecidable) {
      setNotice(
        isRegistry
          ? "Only Pending or Disputed records can be rejected."
          : "Registry access is required to change academic verification."
      );
      return;
    }
    if (!rejectionConfirmed) {
      setNotice("Confirm the rejection before continuing.");
      return;
    }
    executeDecision(selectedRecord, "reject", rejectionReason);
  }

  function approveRecord(record: VerificationRecord) {
    if (!isRegistry || !canDecide(record)) {
      setNotice(
        isRegistry
          ? "Only Pending or Disputed records can be approved."
          : "Registry access is required to change academic verification."
      );
      return;
    }
    executeDecision(record, "approve", "Evidence matched the institution record.");
  }

  function submitCompleteEvidence(record: VerificationRecord) {
    if (!isRegistry || !canDecide(record)) {
      setNotice(
        isRegistry
          ? "Only Pending or Disputed records can receive submitted evidence."
          : "Registry access is required to submit academic evidence."
      );
      return;
    }
    if (record.evidenceComplete) {
      setNotice("This verification record already has complete evidence.");
      return;
    }
    const result = execute({
      type: "verification/submit-evidence",
      role,
      recordId: record.id,
      actor: "Registry Demo User",
      occurredAt: new Date().toISOString(),
    });
    setNotice(result.ok ? result.message : result.error);
    if (!result.ok) return;
    setActiveStatus("Pending");
    setSelectedId(record.id);
    resetDecisionForms();
  }

  function toggleSelection(record: VerificationRecord) {
    if (!isRegistry || !canDecide(record)) return;
    setSelectedIds((ids) =>
      ids.includes(record.id)
        ? ids.filter((id) => id !== record.id)
        : [...ids, record.id]
    );
  }

  function approveSelected() {
    if (!isRegistry) {
      setNotice("Registry access is required to change academic verification.");
      return;
    }
    if (bulkUnavailableReason) {
      setNotice(bulkUnavailableReason);
      return;
    }

    const result = execute({
      type: "verification/bulk-approve",
      role,
      recordIds: selectedIds,
      actor: "Registry Demo User",
      occurredAt: new Date().toISOString(),
    });
    setNotice(result.ok ? result.message : result.error);
    if (!result.ok) return;
    setActiveStatus("Verified");
    setSelectedId(selectedIds[0] ?? null);
    setSelectedIds([]);
    resetDecisionForms();
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Academic records
          </p>
          <h1>Verification centre</h1>
          <p className="max-w-2xl text-muted-foreground">
            Review submitted evidence, resolve disputes, and preserve a shared
            Registry audit history.
          </p>
        </div>
        <Badge
          variant={isRegistry ? "secondary" : "outline"}
          className="gap-1.5 px-3 py-1.5"
        >
          <FileCheck2 className="h-3.5 w-3.5" aria-hidden />
          {isRegistry ? "Registry review access" : "Read-only review"}
        </Badge>
      </section>

      {notice && (
        <p
          className="rounded-lg border border-foreground/15 bg-muted/30 px-4 py-3 text-sm"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {notice}
        </p>
      )}

      <Tabs
        value={activeStatus}
        onValueChange={(value) =>
          handleStatusChange(value as AcademicVerificationStatus)
        }
      >
        <TabsList
          className="h-auto w-full justify-start gap-1 overflow-x-auto sm:w-auto"
          aria-label="Verification status"
        >
          {verificationStatuses.map((status) => (
            <TabsTrigger key={status} value={status} className="gap-1.5">
              {status}
              <span className="text-xs tabular-nums text-muted-foreground">
                {recordsByStatus[status].length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {verificationStatuses.map((status) => (
          <TabsContent key={status} value={status} className="mt-5 space-y-4">
            {(status === "Pending" || status === "Disputed") && (
              <Card className="border-dashed bg-muted/20">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-medium">Batch approval</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Select complete, eligible records of one evidence type.
                    </p>
                    {!isRegistry ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Registry access is required to approve records.
                      </p>
                    ) : bulkUnavailableReason ? (
                      <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                        {bulkUnavailableReason}
                      </p>
                    ) : null}
                  </div>
                  {isRegistry && (
                    <Button
                      onClick={approveSelected}
                      disabled={Boolean(bulkUnavailableReason)}
                    >
                      <CheckCircle2 aria-hidden />
                      Approve selected
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)]">
              <div
                className="space-y-3"
                aria-label={`${status} verification records`}
              >
                {recordsByStatus[status].length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-sm text-muted-foreground">
                      No {status.toLocaleLowerCase()} verification records.
                    </CardContent>
                  </Card>
                ) : (
                  recordsByStatus[status].map((record) => (
                    <VerificationRecordCard
                      key={record.id}
                      record={record}
                      graduate={state.graduates.find(
                        (candidate) => candidate.id === record.graduateId
                      )}
                      selected={selectedId === record.id}
                      batchSelected={selectedIds.includes(record.id)}
                      showBatchSelection={
                        isRegistry &&
                        (status === "Pending" || status === "Disputed")
                      }
                      onSelect={() => selectRecord(record)}
                      onToggleBatch={() => toggleSelection(record)}
                    />
                  ))
                )}
              </div>

              <ReviewPanel
                record={selectedRecord}
                graduate={selectedGraduate}
                history={selectedHistory}
                isRegistry={isRegistry}
                isDecidable={isDecidable}
                requestNote={requestNote}
                onRequestNoteChange={setRequestNote}
                onRequestMoreInformation={requestMoreInformation}
                showRejectForm={showRejectForm}
                onShowRejectForm={() => setShowRejectForm(true)}
                rejectionReason={rejectionReason}
                onRejectionReasonChange={setRejectionReason}
                rejectionConfirmed={rejectionConfirmed}
                onRejectionConfirmedChange={setRejectionConfirmed}
                onReject={rejectRecord}
                onApprove={() => selectedRecord && approveRecord(selectedRecord)}
                onSubmitEvidence={() =>
                  selectedRecord && submitCompleteEvidence(selectedRecord)
                }
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function VerificationRecordCard({
  record,
  graduate,
  selected,
  batchSelected,
  showBatchSelection,
  onSelect,
  onToggleBatch,
}: {
  record: VerificationRecord;
  graduate?: Graduate;
  selected: boolean;
  batchSelected: boolean;
  showBatchSelection: boolean;
  onSelect: () => void;
  onToggleBatch: () => void;
}) {
  return (
    <Card className={selected ? "border-primary ring-1 ring-primary/30" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {showBatchSelection && (
            <div className="pt-1">
              <input
                id={`select-${record.id}`}
                type="checkbox"
                checked={batchSelected}
                onChange={onToggleBatch}
                className="h-4 w-4 rounded border-input accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <label htmlFor={`select-${record.id}`} className="sr-only">
                Select {record.evidenceName} for batch approval
              </label>
            </div>
          )}
          <button
            type="button"
            onClick={onSelect}
            className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-pressed={selected}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{graduate?.name ?? "Graduate record"}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {record.evidenceName}
                </p>
              </div>
              <Badge variant={statusVariant(record.status)}>{record.status}</Badge>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4">
              <SmallDetail label="Evidence type" value={record.evidenceType} />
              <SmallDetail label="Submitted" value={formatDate(record.submittedAt)} />
              <SmallDetail
                label="Completeness"
                value={record.evidenceComplete ? "Complete" : "Incomplete"}
              />
              <SmallDetail
                label="Student ID"
                value={graduate?.studentId ?? "Not available"}
              />
            </dl>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewPanel({
  record,
  graduate,
  history,
  isRegistry,
  isDecidable,
  requestNote,
  onRequestNoteChange,
  onRequestMoreInformation,
  showRejectForm,
  onShowRejectForm,
  rejectionReason,
  onRejectionReasonChange,
  rejectionConfirmed,
  onRejectionConfirmedChange,
  onReject,
  onApprove,
  onSubmitEvidence,
}: {
  record: VerificationRecord | null;
  graduate: Graduate | null;
  history: VerificationAuditEntry[];
  isRegistry: boolean;
  isDecidable: boolean;
  requestNote: string;
  onRequestNoteChange: (value: string) => void;
  onRequestMoreInformation: (event: FormEvent<HTMLFormElement>) => void;
  showRejectForm: boolean;
  onShowRejectForm: () => void;
  rejectionReason: string;
  onRejectionReasonChange: (value: string) => void;
  rejectionConfirmed: boolean;
  onRejectionConfirmedChange: (value: boolean) => void;
  onReject: (event: FormEvent<HTMLFormElement>) => void;
  onApprove: () => void;
  onSubmitEvidence: () => void;
}) {
  if (!record) {
    return (
      <Card className="h-fit">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Select a verification record to review its evidence and history.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit xl:sticky xl:top-6">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>
              <h2 className="text-lg">Review {graduate?.name ?? "graduate"}</h2>
            </CardTitle>
            <CardDescription className="mt-1">{record.evidenceName}</CardDescription>
          </div>
          <Badge variant={statusVariant(record.status)}>{record.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <section aria-labelledby={`institution-${record.id}`}>
          <h3
            id={`institution-${record.id}`}
            className="flex items-center gap-2 text-sm font-semibold"
          >
            <FileText className="h-4 w-4" aria-hidden />
            Institution record
          </h3>
          <p className="mt-2 rounded-lg border bg-muted/30 p-3 text-sm">
            {record.institutionRecord}
          </p>
        </section>

        <section aria-labelledby={`evidence-${record.id}`}>
          <h3
            id={`evidence-${record.id}`}
            className="flex items-center gap-2 text-sm font-semibold"
          >
            <Info className="h-4 w-4" aria-hidden />
            Submitted evidence summary
          </h3>
          <dl className="mt-2 grid gap-2 rounded-lg border p-3 text-sm">
            <SmallDetail label="Type" value={record.evidenceType} />
            <SmallDetail label="Submitted" value={formatDate(record.submittedAt)} />
            <SmallDetail
              label="Completeness"
              value={record.evidenceComplete ? "Complete" : "Incomplete"}
            />
          </dl>
        </section>

        <section aria-labelledby={`history-${record.id}`}>
          <h3
            id={`history-${record.id}`}
            className="flex items-center gap-2 text-sm font-semibold"
          >
            <History className="h-4 w-4" aria-hidden />
            Reviewer history
          </h3>
          <ol className="mt-2 space-y-3 border-l pl-4">
            {history.map((entry) => (
              <li key={entry.id} className="relative text-sm">
                <span
                  className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary"
                  aria-hidden
                />
                <p className="font-medium">{entry.action}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.actor} · {formatDate(entry.occurredAt)}
                </p>
                {entry.note && (
                  <p className="mt-1 text-xs text-muted-foreground">{entry.note}</p>
                )}
              </li>
            ))}
          </ol>
        </section>

        {!isRegistry ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
            Registry access is required to change academic verification.
          </p>
        ) : !isDecidable ? (
          <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
            {record.status} is a terminal decision in this MVP. Its audit history
            remains visible, but no further decision can be made.
          </p>
        ) : (
          <section className="space-y-3 border-t pt-5" aria-label="Registry decisions">
            <h3 className="text-sm font-semibold">Registry decision</h3>
            {!record.evidenceComplete && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onSubmitEvidence}
              >
                <FileText aria-hidden />
                Submit complete evidence
              </Button>
            )}
            <Button
              type="button"
              className="w-full"
              onClick={onApprove}
              disabled={!record.evidenceComplete}
            >
              <CheckCircle2 aria-hidden />
              Approve
            </Button>
            {!record.evidenceComplete && (
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Complete evidence is required before approval.
              </p>
            )}

            <form className="space-y-2" onSubmit={onRequestMoreInformation}>
              <label htmlFor={`request-note-${record.id}`} className="text-sm font-medium">
                Request more information
              </label>
              <Textarea
                id={`request-note-${record.id}`}
                value={requestNote}
                onChange={(event) => onRequestNoteChange(event.target.value)}
                placeholder="Explain what the graduate needs to provide."
                required
              />
              <Button type="submit" variant="outline" className="w-full">
                Request more information
              </Button>
            </form>

            {!showRejectForm ? (
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                onClick={onShowRejectForm}
              >
                <XCircle aria-hidden />
                Reject
              </Button>
            ) : (
              <form
                className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
                onSubmit={onReject}
              >
                <div>
                  <label
                    htmlFor={`rejection-reason-${record.id}`}
                    className="text-sm font-medium"
                  >
                    Rejection reason
                  </label>
                  <Textarea
                    id={`rejection-reason-${record.id}`}
                    value={rejectionReason}
                    onChange={(event) =>
                      onRejectionReasonChange(event.target.value)
                    }
                    placeholder="State why this evidence cannot be accepted."
                    required
                    className="mt-2"
                  />
                </div>
                <label className="flex items-start gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={rejectionConfirmed}
                    onChange={(event) =>
                      onRejectionConfirmedChange(event.target.checked)
                    }
                    className="mt-0.5 h-4 w-4 rounded border-input accent-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  I confirm this terminal rejection and its reason should be
                  recorded in the audit history.
                </label>
                <Button
                  type="submit"
                  variant="destructive"
                  className="w-full"
                  disabled={!rejectionReason.trim() || !rejectionConfirmed}
                >
                  Confirm rejection
                </Button>
              </form>
            )}
          </section>
        )}
      </CardContent>
    </Card>
  );
}

function SmallDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
