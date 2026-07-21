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

import { graduates, verificationRecords } from "@/data/university";
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
import type {
  AcademicVerificationStatus,
  VerificationRecord,
} from "@/types/university";

const verificationStatuses: AcademicVerificationStatus[] = [
  "Pending",
  "Verified",
  "Rejected",
  "Disputed",
];

type ReviewHistoryEntry = {
  id: string;
  action: string;
  actor: string;
  date: string;
  note?: string;
};

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

function createInitialHistory(record: VerificationRecord): ReviewHistoryEntry[] {
  const submittedEntry: ReviewHistoryEntry = {
    id: `${record.id}-submitted`,
    action: "Evidence submitted",
    actor: "Graduate",
    date: formatDate(record.submittedAt),
  };

  if (!record.reviewer || !record.reviewedAt) return [submittedEntry];

  return [
    submittedEntry,
    {
      id: `${record.id}-reviewed`,
      action: `${record.status} by Registry`,
      actor: record.reviewer,
      date: formatDate(record.reviewedAt),
      note: record.note,
    },
  ];
}

export function VerificationCenter() {
  const { role } = useUniversityRole();
  const [records, setRecords] = useState<VerificationRecord[]>(() =>
    verificationRecords.map((record) => ({ ...record }))
  );
  const [history, setHistory] = useState<Record<string, ReviewHistoryEntry[]>>(
    () =>
      Object.fromEntries(
        verificationRecords.map((record) => [
          record.id,
          createInitialHistory(record),
        ])
      )
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    verificationRecords.find((record) => record.status === "Pending")?.id ?? null
  );
  const [activeStatus, setActiveStatus] =
    useState<AcademicVerificationStatus>("Pending");
  const [selectedPendingIds, setSelectedPendingIds] = useState<string[]>([]);
  const [requestNote, setRequestNote] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionConfirmed, setRejectionConfirmed] = useState(false);
  const [notice, setNotice] = useState("");

  const isRegistry = role === "registry";
  const selectedRecord = records.find((record) => record.id === selectedId) ?? null;
  const selectedGraduate = selectedRecord
    ? graduates.find((graduate) => graduate.id === selectedRecord.graduateId)
    : null;
  const selectedHistory = selectedRecord ? history[selectedRecord.id] ?? [] : [];

  const recordsByStatus = useMemo(
    () =>
      Object.fromEntries(
        verificationStatuses.map((status) => [
          status,
          records.filter((record) => record.status === status),
        ])
      ) as Record<AcademicVerificationStatus, VerificationRecord[]>,
    [records]
  );

  const selectedPendingRecords = records.filter((record) =>
    selectedPendingIds.includes(record.id)
  );
  const selectedEvidenceTypes = new Set(
    selectedPendingRecords.map((record) => record.evidenceType)
  );
  const incompleteSelection = selectedPendingRecords.some(
    (record) => !record.evidenceComplete
  );
  const bulkUnavailableReason =
    selectedPendingRecords.length === 0
      ? "Select at least one pending record to approve a batch."
      : selectedEvidenceTypes.size > 1 && incompleteSelection
        ? "Selected records must share one evidence type and have complete evidence."
        : selectedEvidenceTypes.size > 1
          ? "Selected records must share the same evidence type."
          : incompleteSelection
            ? "Every selected record must have complete evidence."
            : null;
  const canApproveSelected = isRegistry && !bulkUnavailableReason;

  function appendHistory(
    recordId: string,
    entry: Omit<ReviewHistoryEntry, "id">
  ) {
    setHistory((currentHistory) => ({
      ...currentHistory,
      [recordId]: [
        ...(currentHistory[recordId] ?? []),
        { ...entry, id: `${recordId}-${Date.now()}` },
      ],
    }));
  }

  function selectRecord(record: VerificationRecord) {
    setSelectedId(record.id);
    setRequestNote("");
    setShowRejectForm(false);
    setRejectionReason("");
    setRejectionConfirmed(false);
  }

  function updateRecord(
    recordId: string,
    updates: Partial<VerificationRecord>
  ) {
    setRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.id === recordId ? { ...record, ...updates } : record
      )
    );
  }

  function approveRecord(record: VerificationRecord) {
    if (!isRegistry) return;

    const date = formatDate(new Date());
    updateRecord(record.id, {
      status: "Verified",
      reviewer: "Registry Demo User",
      reviewedAt: new Date().toISOString(),
      note: "Approved after Registry review.",
    });
    appendHistory(record.id, {
      action: "Approved",
      actor: "Registry Demo User",
      date,
      note: "Evidence verified against the institution record.",
    });
    setActiveStatus("Verified");
    setSelectedPendingIds((ids) => ids.filter((id) => id !== record.id));
    setShowRejectForm(false);
    setNotice(`${record.evidenceName} was approved by Registry Demo User on ${date}.`);
  }

  function requestMoreInformation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRecord || !isRegistry) return;

    const note = requestNote.trim();
    if (!note) {
      setNotice("Add a note before requesting more information.");
      return;
    }

    const date = formatDate(new Date());
    updateRecord(selectedRecord.id, {
      status: "Pending",
      reviewer: "Registry Demo User",
      reviewedAt: new Date().toISOString(),
      note,
    });
    appendHistory(selectedRecord.id, {
      action: "More information requested",
      actor: "Registry Demo User",
      date,
      note,
    });
    setActiveStatus("Pending");
    setRequestNote("");
    setShowRejectForm(false);
    setNotice(`More information was requested for ${selectedRecord.evidenceName}.`);
  }

  function rejectRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRecord || !isRegistry) return;

    const reason = rejectionReason.trim();
    if (!reason) {
      setNotice("Add a rejection reason before rejecting this evidence.");
      return;
    }
    if (!rejectionConfirmed) {
      setNotice("Confirm the rejection before continuing.");
      return;
    }

    const date = formatDate(new Date());
    updateRecord(selectedRecord.id, {
      status: "Rejected",
      reviewer: "Registry Demo User",
      reviewedAt: new Date().toISOString(),
      note: reason,
    });
    appendHistory(selectedRecord.id, {
      action: "Rejected",
      actor: "Registry Demo User",
      date,
      note: reason,
    });
    setActiveStatus("Rejected");
    setSelectedPendingIds((ids) => ids.filter((id) => id !== selectedRecord.id));
    setShowRejectForm(false);
    setRejectionReason("");
    setRejectionConfirmed(false);
    setNotice(`${selectedRecord.evidenceName} was rejected. The reason was added to its review history.`);
  }

  function togglePendingSelection(recordId: string) {
    setSelectedPendingIds((ids) =>
      ids.includes(recordId)
        ? ids.filter((id) => id !== recordId)
        : [...ids, recordId]
    );
  }

  function approveSelected() {
    if (!canApproveSelected) return;

    const date = formatDate(new Date());
    const approvedIds = new Set(selectedPendingIds);
    setRecords((currentRecords) =>
      currentRecords.map((record) =>
        approvedIds.has(record.id)
          ? {
              ...record,
              status: "Verified",
              reviewer: "Registry Demo User",
              reviewedAt: new Date().toISOString(),
              note: "Approved in a batch Registry review.",
            }
          : record
      )
    );
    setHistory((currentHistory) => {
      const nextHistory = { ...currentHistory };
      selectedPendingRecords.forEach((record) => {
        nextHistory[record.id] = [
          ...(currentHistory[record.id] ?? []),
          {
            id: `${record.id}-${Date.now()}`,
            action: "Approved in batch",
            actor: "Registry Demo User",
            date,
            note: "Evidence verified in a compatible batch.",
          },
        ];
      });
      return nextHistory;
    });
    setSelectedPendingIds([]);
    setActiveStatus("Verified");
    setNotice(`${selectedPendingRecords.length} records were approved by Registry Demo User on ${date}.`);
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
            Review submitted academic evidence, resolve disputes, and keep a clear Registry history.
          </p>
        </div>
        <Badge variant={isRegistry ? "secondary" : "outline"} className="gap-1.5 px-3 py-1.5">
          <FileCheck2 className="h-3.5 w-3.5" aria-hidden />
          {isRegistry ? "Registry review access" : "Read-only review"}
        </Badge>
      </section>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {notice}
      </p>

      <Tabs
        value={activeStatus}
        onValueChange={(value) => setActiveStatus(value as AcademicVerificationStatus)}
      >
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto sm:w-auto" aria-label="Verification status">
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
            {status === "Pending" && (
              <Card className="border-dashed bg-muted/20">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-medium">Batch approval</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Select complete records of the same evidence type to approve them together.
                    </p>
                    {!isRegistry ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Registry access is required to change academic verification.
                      </p>
                    ) : bulkUnavailableReason ? (
                      <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                        {bulkUnavailableReason}
                      </p>
                    ) : null}
                  </div>
                  {isRegistry && (
                    <Button onClick={approveSelected} disabled={!canApproveSelected}>
                      <CheckCircle2 aria-hidden />
                      Approve selected
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)]">
              <div className="space-y-3" aria-label={`${status} verification records`}>
                {recordsByStatus[status].length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-sm text-muted-foreground">
                      No {status.toLocaleLowerCase()} verification records.
                    </CardContent>
                  </Card>
                ) : (
                  recordsByStatus[status].map((record) => {
                    const graduate = graduates.find(
                      (candidate) => candidate.id === record.graduateId
                    );
                    const isSelected = selectedId === record.id;
                    const isPendingSelected = selectedPendingIds.includes(record.id);

                    return (
                      <Card
                        key={record.id}
                        className={isSelected ? "border-primary ring-1 ring-primary/30" : ""}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {status === "Pending" && isRegistry && (
                              <div className="pt-1">
                                <input
                                  id={`select-${record.id}`}
                                  type="checkbox"
                                  checked={isPendingSelected}
                                  onChange={() => togglePendingSelection(record.id)}
                                  className="h-4 w-4 rounded border-input accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                <label htmlFor={`select-${record.id}`} className="sr-only">
                                  Select {record.evidenceName} for batch approval
                                </label>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => selectRecord(record)}
                              className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              aria-pressed={isSelected}
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
                                <div>
                                  <dt className="text-muted-foreground">Evidence type</dt>
                                  <dd className="mt-0.5 font-medium">{record.evidenceType}</dd>
                                </div>
                                <div>
                                  <dt className="text-muted-foreground">Submitted</dt>
                                  <dd className="mt-0.5 font-medium">{formatDate(record.submittedAt)}</dd>
                                </div>
                                <div>
                                  <dt className="text-muted-foreground">Completeness</dt>
                                  <dd className="mt-0.5 font-medium">
                                    {record.evidenceComplete ? "Complete" : "Incomplete"}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-muted-foreground">Student ID</dt>
                                  <dd className="mt-0.5 font-medium">{graduate?.studentId ?? "Not available"}</dd>
                                </div>
                              </dl>
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>

              <ReviewPanel
                record={selectedRecord}
                graduateName={selectedGraduate?.name ?? "Graduate record"}
                history={selectedHistory}
                isRegistry={isRegistry}
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
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function ReviewPanel({
  record,
  graduateName,
  history,
  isRegistry,
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
}: {
  record: VerificationRecord | null;
  graduateName: string;
  history: ReviewHistoryEntry[];
  isRegistry: boolean;
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
              <h2 className="text-lg">Review {graduateName}</h2>
            </CardTitle>
            <CardDescription className="mt-1">{record.evidenceName}</CardDescription>
          </div>
          <Badge variant={statusVariant(record.status)}>{record.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <section aria-labelledby={`institution-${record.id}`}>
          <h3 id={`institution-${record.id}`} className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4" aria-hidden />
            Institution record
          </h3>
          <p className="mt-2 rounded-lg border bg-muted/30 p-3 text-sm">{record.institutionRecord}</p>
        </section>

        <section aria-labelledby={`evidence-${record.id}`}>
          <h3 id={`evidence-${record.id}`} className="flex items-center gap-2 text-sm font-semibold">
            <Info className="h-4 w-4" aria-hidden />
            Submitted evidence summary
          </h3>
          <dl className="mt-2 grid gap-2 rounded-lg border p-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Type</dt><dd className="font-medium text-right">{record.evidenceType}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Submitted</dt><dd className="font-medium text-right">{formatDate(record.submittedAt)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Completeness</dt><dd className="font-medium text-right">{record.evidenceComplete ? "Complete" : "Incomplete"}</dd></div>
          </dl>
        </section>

        <section aria-labelledby={`history-${record.id}`}>
          <h3 id={`history-${record.id}`} className="flex items-center gap-2 text-sm font-semibold">
            <History className="h-4 w-4" aria-hidden />
            Reviewer history
          </h3>
          <ol className="mt-2 space-y-3 border-l pl-4">
            {history.map((entry) => (
              <li key={entry.id} className="relative text-sm">
                <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
                <p className="font-medium">{entry.action}</p>
                <p className="text-xs text-muted-foreground">{entry.actor} · {entry.date}</p>
                {entry.note && <p className="mt-1 text-xs text-muted-foreground">{entry.note}</p>}
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby={`notes-${record.id}`}>
          <h3 id={`notes-${record.id}`} className="text-sm font-semibold">Latest notes</h3>
          <p className="mt-2 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
            {record.note ?? "No reviewer notes have been added."}
          </p>
        </section>

        {!isRegistry ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
            Registry access is required to change academic verification.
          </p>
        ) : (
          <section className="space-y-3 border-t pt-5" aria-label="Registry decisions">
            <h3 className="text-sm font-semibold">Registry decision</h3>
            <Button type="button" className="w-full" onClick={onApprove}>
              <CheckCircle2 aria-hidden />
              Approve
            </Button>

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
              <Button type="button" variant="destructive" className="w-full" onClick={onShowRejectForm}>
                <XCircle aria-hidden />
                Reject
              </Button>
            ) : (
              <form className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3" onSubmit={onReject}>
                <div>
                  <label htmlFor={`rejection-reason-${record.id}`} className="text-sm font-medium">
                    Rejection reason
                  </label>
                  <Textarea
                    id={`rejection-reason-${record.id}`}
                    value={rejectionReason}
                    onChange={(event) => onRejectionReasonChange(event.target.value)}
                    placeholder="State the reason this evidence cannot be accepted."
                    required
                    className="mt-2"
                  />
                </div>
                <label className="flex items-start gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={rejectionConfirmed}
                    onChange={(event) => onRejectionConfirmedChange(event.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-input accent-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  I confirm this evidence should be rejected and understand the reason will be recorded in its history.
                </label>
                <Button type="submit" variant="destructive" className="w-full" disabled={!rejectionReason.trim() || !rejectionConfirmed}>
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
