"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import { Eye, Pencil, Plus, Search, Trash2, X } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  selectEmploymentOutcome,
  selectGraduateVerificationStatus,
  selectVerificationAudit,
  type UniversityCommandResult,
  type UniversityDemoState,
} from "@/lib/university-demo-state";
import type {
  AcademicVerificationStatus,
  EmploymentStatus,
  Graduate,
} from "@/types/university";

type GraduateDraft = Omit<Graduate, "id" | "initials">;

type GraduateView = {
  record: Graduate;
  employmentStatus: EmploymentStatus;
  verificationStatus: AcademicVerificationStatus;
};

const employmentStatuses: EmploymentStatus[] = [
  "Employed",
  "Seeking",
  "Further study",
  "Not seeking",
  "Unknown",
];

const verificationStatuses: AcademicVerificationStatus[] = [
  "Pending",
  "Verified",
  "Rejected",
  "Disputed",
];

const emptyGraduateDraft: GraduateDraft = {
  studentId: "",
  name: "",
  faculty: "Faculty of Computer Science and Information Technology",
  programme: "",
  graduationYear: new Date().getFullYear(),
  profileCompletion: 0,
  nextAction: "Review graduate record",
};

function statusVariant(
  status: EmploymentStatus | AcademicVerificationStatus
) {
  if (status === "Rejected") return "destructive" as const;
  if (status === "Verified" || status === "Employed") {
    return "secondary" as const;
  }
  return "outline" as const;
}

function resultMessage(result: UniversityCommandResult) {
  return result.ok ? result.message : result.error;
}

export function GraduateManagement() {
  const { role } = useUniversityRole();
  const { state, execute } = useCareerOSDemo();
  const [query, setQuery] = useState("");
  const [faculty, setFaculty] = useState("all");
  const [programme, setProgramme] = useState("all");
  const [graduationYear, setGraduationYear] = useState("all");
  const [employmentStatus, setEmploymentStatus] = useState("all");
  const [verificationStatus, setVerificationStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<GraduateDraft>(emptyGraduateDraft);
  const [notice, setNotice] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [pendingDeletionId, setPendingDeletionId] = useState<string | null>(null);
  const deleteReturnFocusRef = useRef<HTMLElement | null>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const isRegistry = role === "registry";
  const records = state.graduates;
  const views = useMemo<GraduateView[]>(
    () =>
      records.map((record) => ({
        record,
        employmentStatus: selectEmploymentOutcome(state, record.id).status,
        verificationStatus: selectGraduateVerificationStatus(state, record.id),
      })),
    [records, state]
  );
  const faculties = useMemo(
    () => [...new Set(records.map((record) => record.faculty))].sort(),
    [records]
  );
  const programmes = useMemo(
    () => [...new Set(records.map((record) => record.programme))].sort(),
    [records]
  );
  const years = useMemo(
    () =>
      [...new Set(records.map((record) => record.graduationYear))].sort(
        (left, right) => right - left
      ),
    [records]
  );
  const filteredViews = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return views.filter(({ record, employmentStatus: outcome, verificationStatus: status }) => {
      const matchesQuery =
        !normalizedQuery ||
        [record.name, record.studentId, record.programme].some((value) =>
          value.toLocaleLowerCase().includes(normalizedQuery)
        );
      return (
        matchesQuery &&
        (faculty === "all" || record.faculty === faculty) &&
        (programme === "all" || record.programme === programme) &&
        (graduationYear === "all" ||
          record.graduationYear === Number(graduationYear)) &&
        (employmentStatus === "all" || outcome === employmentStatus) &&
        (verificationStatus === "all" || status === verificationStatus)
      );
    });
  }, [
    employmentStatus,
    faculty,
    graduationYear,
    programme,
    query,
    verificationStatus,
    views,
  ]);

  const detailGraduate = detailId
    ? records.find((record) => record.id === detailId) ?? null
    : null;
  const pendingDeletion = pendingDeletionId
    ? records.find((record) => record.id === pendingDeletionId) ?? null
    : null;

  function clearFilters() {
    setQuery("");
    setFaculty("all");
    setProgramme("all");
    setGraduationYear("all");
    setEmploymentStatus("all");
    setVerificationStatus("all");
  }

  function openNewGraduateForm() {
    if (!isRegistry) {
      setNotice("Registry access is required to add academic records.");
      return;
    }
    setEditingId(null);
    setDraft(emptyGraduateDraft);
    setShowForm(true);
    setNotice("");
  }

  function openEditGraduateForm(record: Graduate) {
    if (!isRegistry) {
      setNotice("Registry access is required to edit academic records.");
      return;
    }
    setEditingId(record.id);
    setDraft({
      studentId: record.studentId,
      name: record.name,
      faculty: record.faculty,
      programme: record.programme,
      graduationYear: record.graduationYear,
      profileCompletion: record.profileCompletion,
      nextAction: record.nextAction,
    });
    setShowForm(true);
    setNotice("");
  }

  function updateDraft<Key extends keyof GraduateDraft>(
    key: Key,
    value: GraduateDraft[Key]
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function saveGraduate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isRegistry) {
      setNotice("Registry access is required to maintain academic records.");
      return;
    }

    const result = editingId
      ? execute({
          type: "graduate/update-academic",
          role,
          graduateId: editingId,
          patch: draft,
        })
      : execute({
          type: "graduate/add",
          role,
          graduate: {
            id: `local-graduate-${Date.now()}`,
            initials: "",
            ...draft,
          },
          actor: "Registry Demo User",
          occurredAt: new Date().toISOString(),
        });

    setNotice(resultMessage(result));
    if (!result.ok) return;
    setShowForm(false);
    setEditingId(null);
    setDraft(emptyGraduateDraft);
  }

  function requestDelete(record: Graduate) {
    if (!isRegistry) {
      setNotice("Registry access is required to delete academic records.");
      return;
    }
    deleteReturnFocusRef.current = document.activeElement as HTMLElement | null;
    setPendingDeletionId(record.id);
  }

  function confirmDelete(record: Graduate) {
    const result = execute({
      type: "graduate/delete",
      role,
      graduateId: record.id,
    });
    setNotice(resultMessage(result));
    if (result.ok && detailId === record.id) setDetailId(null);
    setPendingDeletionId(null);
  }

  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>
            <h2>Find graduate records</h2>
          </CardTitle>
          <CardDescription>
            Search shared academic records and review their current employment
            and verification projections.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="relative block">
            <span className="sr-only">Search graduate records</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9"
              placeholder="Search name, student ID, or programme"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <FilterSelect
              label="Faculty"
              value={faculty}
              onValueChange={setFaculty}
              options={faculties}
            />
            <FilterSelect
              label="Programme"
              value={programme}
              onValueChange={setProgramme}
              options={programmes}
            />
            <FilterSelect
              label="Graduation year"
              value={graduationYear}
              onValueChange={setGraduationYear}
              options={years.map(String)}
            />
            <FilterSelect
              label="Employment status"
              value={employmentStatus}
              onValueChange={setEmploymentStatus}
              options={employmentStatuses}
            />
            <FilterSelect
              label="Verification status"
              value={verificationStatus}
              onValueChange={setVerificationStatus}
              options={verificationStatuses}
            />
          </div>
        </CardContent>
      </Card>

      <section
        className="flex flex-wrap items-center justify-between gap-3"
        aria-label="Graduate record actions"
      >
        <div>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {filteredViews.length}
            </span>{" "}
            of {records.length} shared records shown
          </p>
          {!isRegistry && (
            <p className="mt-1 text-xs text-muted-foreground">
              Career Services can view academic records here and update outcomes
              in Employment.
            </p>
          )}
        </div>
        {isRegistry && (
          <Button ref={addButtonRef} onClick={openNewGraduateForm}>
            <Plus aria-hidden />
            Add graduate
          </Button>
        )}
      </section>

      {showForm && isRegistry && (
        <Card className="border-foreground/20">
          <CardHeader>
            <CardTitle>
              <h2>{editingId ? "Edit academic record" : "Add graduate record"}</h2>
            </CardTitle>
            <CardDescription>
              Registry maintains student and programme fields. Verification and
              employment are changed only in their audited workflows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
              onSubmit={saveGraduate}
            >
              <Field label="Graduate name" id="graduate-name">
                <Input
                  id="graduate-name"
                  value={draft.name}
                  onChange={(event) => updateDraft("name", event.target.value)}
                  required
                />
              </Field>
              <Field label="Student ID" id="graduate-student-id">
                <Input
                  id="graduate-student-id"
                  value={draft.studentId}
                  onChange={(event) =>
                    updateDraft("studentId", event.target.value)
                  }
                  required
                />
              </Field>
              <Field label="Faculty" id="graduate-faculty">
                <Input
                  id="graduate-faculty"
                  value={draft.faculty}
                  onChange={(event) => updateDraft("faculty", event.target.value)}
                  required
                />
              </Field>
              <Field label="Programme" id="graduate-programme">
                <Input
                  id="graduate-programme"
                  value={draft.programme}
                  onChange={(event) =>
                    updateDraft("programme", event.target.value)
                  }
                  required
                />
              </Field>
              <Field label="Graduation year" id="graduate-year">
                <Input
                  id="graduate-year"
                  type="number"
                  min="1900"
                  max="2100"
                  value={draft.graduationYear}
                  onChange={(event) =>
                    updateDraft("graduationYear", Number(event.target.value))
                  }
                  required
                />
              </Field>
              <Field label="Profile completeness (%)" id="graduate-profile">
                <Input
                  id="graduate-profile"
                  type="number"
                  min="0"
                  max="100"
                  value={draft.profileCompletion}
                  onChange={(event) =>
                    updateDraft("profileCompletion", Number(event.target.value))
                  }
                  required
                />
              </Field>
              <div className="md:col-span-2 xl:col-span-3">
                <Field label="Next academic action" id="graduate-next-action">
                  <Input
                    id="graduate-next-action"
                    value={draft.nextAction}
                    onChange={(event) =>
                      updateDraft("nextAction", event.target.value)
                    }
                  />
                </Field>
              </div>
              <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-3">
                <Button type="submit">
                  {editingId ? "Save academic record" : "Add graduate"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                >
                  <X aria-hidden />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {records.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <div>
              <h2 className="font-semibold">No graduate records yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isRegistry
                  ? "Add the first academic record to begin verification and outcome tracking."
                  : "Registry must add the first academic record before Career Services can track an outcome."}
              </p>
            </div>
            {isRegistry && (
              <Button onClick={openNewGraduateForm}>
                <Plus aria-hidden />
                Add first graduate
              </Button>
            )}
          </CardContent>
        </Card>
      ) : filteredViews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <div>
              <h2 className="font-semibold">
                No graduate records match these filters
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Clear the search and filters to view the shared record set.
              </p>
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Graduate</TableHead>
                  <TableHead>Programme</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead>Employment</TableHead>
                  <TableHead>Credential</TableHead>
                  <TableHead>Next action</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredViews.map((view) => (
                  <GraduateRow
                    key={view.record.id}
                    view={view}
                    isRegistry={isRegistry}
                    onDetails={() => setDetailId(view.record.id)}
                    onEdit={() => openEditGraduateForm(view.record)}
                    onDelete={() => requestDelete(view.record)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="grid gap-3 md:hidden">
            {filteredViews.map((view) => (
              <GraduateCard
                key={view.record.id}
                view={view}
                isRegistry={isRegistry}
                onDetails={() => setDetailId(view.record.id)}
                onEdit={() => openEditGraduateForm(view.record)}
                onDelete={() => requestDelete(view.record)}
              />
            ))}
          </div>
        </>
      )}

      {detailGraduate && (
        <GraduateDetail
          graduate={detailGraduate}
          state={state}
          onClose={() => setDetailId(null)}
        />
      )}

      <GraduateDeletionDialog
        record={pendingDeletion}
        returnFocusRef={deleteReturnFocusRef}
        fallbackFocusRef={addButtonRef}
        onCancel={() => setPendingDeletionId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly string[];
}) {
  const id = `graduate-filter-${label.toLocaleLowerCase().replaceAll(" ", "-")}`;
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={`All ${label.toLocaleLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {label.toLocaleLowerCase()}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function GraduateRow({
  view,
  isRegistry,
  onDetails,
  onEdit,
  onDelete,
}: {
  view: GraduateView;
  isRegistry: boolean;
  onDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { record, employmentStatus, verificationStatus } = view;
  return (
    <TableRow>
      <TableCell>
        <p className="font-medium">{record.name}</p>
        <p className="text-xs text-muted-foreground">{record.studentId}</p>
      </TableCell>
      <TableCell>{record.programme}</TableCell>
      <TableCell className="tabular-nums">{record.graduationYear}</TableCell>
      <TableCell className="tabular-nums">{record.profileCompletion}%</TableCell>
      <TableCell>
        <Badge variant={statusVariant(employmentStatus)}>
          {employmentStatus}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={statusVariant(verificationStatus)}>
          {verificationStatus}
        </Badge>
      </TableCell>
      <TableCell className="max-w-56 text-sm text-muted-foreground">
        {record.nextAction}
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            aria-label={`View details for ${record.name}`}
            onClick={onDetails}
          >
            <Eye aria-hidden />
          </Button>
          {isRegistry && (
            <>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Edit ${record.name}`}
                onClick={onEdit}
              >
                <Pencil aria-hidden />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Delete ${record.name}`}
                onClick={onDelete}
              >
                <Trash2 aria-hidden />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function GraduateCard({
  view,
  isRegistry,
  onDetails,
  onEdit,
  onDelete,
}: {
  view: GraduateView;
  isRegistry: boolean;
  onDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { record, employmentStatus, verificationStatus } = view;
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">{record.name}</h2>
            <p className="text-sm text-muted-foreground">{record.studentId}</p>
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={onDetails}>
              <Eye aria-hidden />
              View details
            </Button>
            {isRegistry && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Edit ${record.name}`}
                  onClick={onEdit}
                >
                  <Pencil aria-hidden />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Delete ${record.name}`}
                  onClick={onDelete}
                >
                  <Trash2 aria-hidden />
                </Button>
              </>
            )}
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <RecordDetail label="Programme" value={record.programme} />
          <RecordDetail label="Year" value={record.graduationYear} />
          <RecordDetail
            label="Profile completion"
            value={`${record.profileCompletion}%`}
          />
          <StatusDetail label="Employment" status={employmentStatus} />
          <StatusDetail label="Credential" status={verificationStatus} />
          <RecordDetail
            label="Next action"
            value={record.nextAction}
            className="col-span-2"
          />
        </dl>
      </CardContent>
    </Card>
  );
}

function GraduateDetail({
  graduate,
  state,
  onClose,
}: {
  graduate: Graduate;
  state: UniversityDemoState;
  onClose: () => void;
}) {
  const outcome = selectEmploymentOutcome(state, graduate.id);
  const evidence = state.verificationRecords.filter(
    (record) => record.graduateId === graduate.id
  );

  return (
    <Card className="border-primary/30" id={`graduate-detail-${graduate.id}`}>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>
            <h2>{graduate.name} · record detail</h2>
          </CardTitle>
          <CardDescription>
            Profile, institution evidence, audit history, and current outcome.
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X aria-hidden />
          Close
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-lg border p-4" aria-labelledby={`profile-${graduate.id}`}>
          <h3 id={`profile-${graduate.id}`} className="font-semibold">
            Graduate profile
          </h3>
          <dl className="mt-3 space-y-3 text-sm">
            <RecordDetail label="Student ID" value={graduate.studentId} />
            <RecordDetail label="Faculty" value={graduate.faculty} />
            <RecordDetail label="Programme" value={graduate.programme} />
            <RecordDetail
              label="Profile completeness"
              value={`${graduate.profileCompletion}%`}
            />
          </dl>
        </section>
        <section className="rounded-lg border p-4" aria-labelledby={`evidence-${graduate.id}`}>
          <h3 id={`evidence-${graduate.id}`} className="font-semibold">
            Evidence and audit
          </h3>
          {evidence.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No verification evidence has been submitted.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {evidence.map((record) => {
                const latestAudit = selectVerificationAudit(state, record.id).at(-1);
                return (
                  <li key={record.id} className="rounded-md bg-muted/30 p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium">{record.evidenceName}</span>
                      <Badge variant={statusVariant(record.status)}>
                        {record.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {record.institutionRecord}
                    </p>
                    {latestAudit && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Latest: {latestAudit.action} by {latestAudit.actor}
                        {latestAudit.note ? ` · ${latestAudit.note}` : ""}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <section className="rounded-lg border p-4" aria-labelledby={`outcome-${graduate.id}`}>
          <h3 id={`outcome-${graduate.id}`} className="font-semibold">
            Employment outcome
          </h3>
          <div className="mt-3">
            <Badge variant={statusVariant(outcome.status)}>{outcome.status}</Badge>
          </div>
          {outcome.status === "Employed" ? (
            <dl className="mt-3 space-y-3 text-sm">
              <RecordDetail label="Employer" value={outcome.employer ?? "Not recorded"} />
              <RecordDetail label="Role" value={outcome.jobTitle ?? "Not recorded"} />
              <RecordDetail label="Industry" value={outcome.industry ?? "Not recorded"} />
              <RecordDetail
                label="Days to employment"
                value={outcome.daysToEmployment ?? "Not recorded"}
              />
            </dl>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No employment-only details are stored for this outcome.
            </p>
          )}
        </section>
      </CardContent>
    </Card>
  );
}

function GraduateDeletionDialog({
  record,
  returnFocusRef,
  fallbackFocusRef,
  onCancel,
  onConfirm,
}: {
  record: Graduate | null;
  returnFocusRef: RefObject<HTMLElement | null>;
  fallbackFocusRef: RefObject<HTMLButtonElement | null>;
  onCancel: () => void;
  onConfirm: (record: Graduate) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (record && dialog && !dialog.open) dialog.showModal();
    if (!record && dialog?.open) dialog.close();
  }, [record]);

  function restoreFocus() {
    window.requestAnimationFrame(() => {
      const returnTarget = returnFocusRef.current;
      if (returnTarget?.isConnected) returnTarget.focus();
      else fallbackFocusRef.current?.focus();
    });
  }

  function cancel() {
    dialogRef.current?.close();
    onCancel();
    restoreFocus();
  }

  function confirm() {
    if (!record) return;
    dialogRef.current?.close();
    onConfirm(record);
    restoreFocus();
  }

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="graduate-delete-title"
      aria-describedby="graduate-delete-description"
      onCancel={(event) => {
        event.preventDefault();
        cancel();
      }}
      className="w-[min(92vw,30rem)] rounded-xl border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/45"
    >
      <div className="space-y-5 p-6">
        <div>
          <h2 id="graduate-delete-title" className="text-lg font-semibold">
            Delete graduate record?
          </h2>
          <p id="graduate-delete-description" className="mt-2 text-sm text-muted-foreground">
            {record
              ? `This removes ${record.name}'s academic record, verification history, and linked employment outcome from this demo session.`
              : "This removes the selected graduate record from this demo session."}
          </p>
        </div>
        <div className="flex flex-row-reverse flex-wrap gap-2">
          <Button type="button" variant="destructive" onClick={confirm}>
            Delete record
          </Button>
          <Button type="button" variant="outline" onClick={cancel} autoFocus>
            Keep record
          </Button>
        </div>
      </div>
    </dialog>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  );
}

function RecordDetail({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function StatusDetail({
  label,
  status,
}: {
  label: string;
  status: EmploymentStatus | AcademicVerificationStatus;
}) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd>
        <Badge variant={statusVariant(status)}>{status}</Badge>
      </dd>
    </div>
  );
}
