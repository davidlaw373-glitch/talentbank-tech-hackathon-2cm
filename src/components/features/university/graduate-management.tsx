"use client";

import { useMemo, useState, type FormEvent } from "react";
import { FileUp, Pencil, Plus, Search, Trash2, X } from "lucide-react";

import { graduates } from "@/data/university";
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
import type {
  AcademicVerificationStatus,
  EmploymentStatus,
  Graduate,
} from "@/types/university";

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

const importedGraduates: Graduate[] = [
  {
    id: "imported-graduate-maya",
    studentId: "UMCS2025001",
    name: "Maya Chen",
    initials: "MC",
    faculty: "Faculty of Computer Science and Information Technology",
    programme: "BSc Computer Science",
    graduationYear: 2025,
    profileCompletion: 65,
    employmentStatus: "Seeking",
    verificationStatus: "Pending",
    nextAction: "Invite graduate to complete their profile",
  },
  {
    id: "imported-graduate-daniel",
    studentId: "UMBE2025002",
    name: "Daniel Wong",
    initials: "DW",
    faculty: "Faculty of Business and Economics",
    programme: "BBA Economics",
    graduationYear: 2025,
    profileCompletion: 72,
    employmentStatus: "Unknown",
    verificationStatus: "Pending",
    nextAction: "Confirm employment outcome",
  },
  {
    id: "imported-graduate-aisha",
    studentId: "UMCS2025003",
    name: "Aisha Malik",
    initials: "AM",
    faculty: "Faculty of Computer Science and Information Technology",
    programme: "BSc Information Systems",
    graduationYear: 2025,
    profileCompletion: 84,
    employmentStatus: "Further study",
    verificationStatus: "Verified",
    nextAction: "Confirm postgraduate programme details",
  },
];

type GraduateDraft = Omit<Graduate, "id" | "initials">;

const emptyGraduateDraft: GraduateDraft = {
  studentId: "",
  name: "",
  faculty: "Faculty of Computer Science and Information Technology",
  programme: "",
  graduationYear: new Date().getFullYear(),
  profileCompletion: 0,
  employmentStatus: "Unknown",
  verificationStatus: "Pending",
  nextAction: "Review graduate record",
};

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function statusVariant(status: EmploymentStatus | AcademicVerificationStatus) {
  if (status === "Rejected") return "destructive" as const;
  if (status === "Disputed") return "outline" as const;
  if (status === "Verified" || status === "Employed") return "secondary" as const;
  return "outline" as const;
}

export function GraduateManagement() {
  const { role } = useUniversityRole();
  const [records, setRecords] = useState<Graduate[]>(graduates);
  const [query, setQuery] = useState("");
  const [faculty, setFaculty] = useState("all");
  const [programme, setProgramme] = useState("all");
  const [graduationYear, setGraduationYear] = useState("all");
  const [employmentStatus, setEmploymentStatus] = useState("all");
  const [verificationStatus, setVerificationStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<GraduateDraft>(emptyGraduateDraft);
  const [importPreview, setImportPreview] = useState(false);
  const [notice, setNotice] = useState("");
  const [pendingDeletionId, setPendingDeletionId] = useState<string | null>(null);

  const faculties = useMemo(
    () => Array.from(new Set(records.map((record) => record.faculty))).sort(),
    [records]
  );
  const programmes = useMemo(
    () => Array.from(new Set(records.map((record) => record.programme))).sort(),
    [records]
  );
  const years = useMemo(
    () => Array.from(new Set(records.map((record) => record.graduationYear))).sort((a, b) => b - a),
    [records]
  );

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return records.filter((record) => {
      const matchesQuery = !normalizedQuery || [record.name, record.studentId, record.programme]
        .some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
      return matchesQuery
        && (faculty === "all" || record.faculty === faculty)
        && (programme === "all" || record.programme === programme)
        && (graduationYear === "all" || record.graduationYear === Number(graduationYear))
        && (employmentStatus === "all" || record.employmentStatus === employmentStatus)
        && (verificationStatus === "all" || record.verificationStatus === verificationStatus);
    });
  }, [records, query, faculty, programme, graduationYear, employmentStatus, verificationStatus]);

  const isCareers = role === "careers";
  const roleName = isCareers ? "Career Services" : "Registry";
  const restrictionNotice = isCareers
    ? "Career Services can update employment status and follow-up actions. Academic and credential fields remain read-only."
    : "Registry can update academic and credential fields. Employment status and career follow-up actions remain read-only.";

  function clearFilters() {
    setQuery("");
    setFaculty("all");
    setProgramme("all");
    setGraduationYear("all");
    setEmploymentStatus("all");
    setVerificationStatus("all");
  }

  function openNewGraduateForm() {
    setEditingId(null);
    setDraft(emptyGraduateDraft);
    setShowForm(true);
  }

  function openEditGraduateForm(record: Graduate) {
    setEditingId(record.id);
    setDraft({
      studentId: record.studentId,
      name: record.name,
      faculty: record.faculty,
      programme: record.programme,
      graduationYear: record.graduationYear,
      profileCompletion: record.profileCompletion,
      employmentStatus: record.employmentStatus,
      verificationStatus: record.verificationStatus,
      nextAction: record.nextAction,
    });
    setShowForm(true);
  }

  function updateDraft<Key extends keyof GraduateDraft>(key: Key, value: GraduateDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function saveGraduate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = draft.name.trim();
    const cleanStudentId = draft.studentId.trim();
    if (!cleanName || !cleanStudentId || !draft.programme.trim()) {
      setNotice("Enter a graduate name, student ID, and programme before saving.");
      return;
    }

    if (editingId) {
      setRecords((current) => current.map((record) => {
        if (record.id !== editingId) return record;
        return isCareers
          ? { ...record, employmentStatus: draft.employmentStatus, nextAction: draft.nextAction.trim() || record.nextAction }
          : {
              ...record,
              studentId: cleanStudentId,
              name: cleanName,
              initials: initialsFor(cleanName),
              faculty: draft.faculty,
              programme: draft.programme.trim(),
              graduationYear: draft.graduationYear,
              profileCompletion: draft.profileCompletion,
              verificationStatus: draft.verificationStatus,
            };
      }));
      setNotice(`${cleanName}'s ${isCareers ? "employment record" : "academic record"} was updated locally.`);
    } else {
      const graduate: Graduate = {
        ...draft,
        studentId: cleanStudentId,
        name: cleanName,
        programme: draft.programme.trim(),
        nextAction: draft.nextAction.trim() || "Review graduate record",
        initials: initialsFor(cleanName),
        id: `local-graduate-${Date.now()}`,
      };
      setRecords((current) => [graduate, ...current]);
      setNotice(`${cleanName} was added as a local graduate record.`);
    }

    setShowForm(false);
    setEditingId(null);
    setDraft(emptyGraduateDraft);
  }

  function requestDelete(record: Graduate) {
    if (graduates.some((seedRecord) => seedRecord.id === record.id)) {
      setNotice("Seed graduate records cannot be deleted in this MVP. Locally added records can be removed.");
      return;
    }
    setPendingDeletionId(record.id);
  }

  function deleteGraduate(record: Graduate) {
    setRecords((current) => current.filter((item) => item.id !== record.id));
    setPendingDeletionId(null);
    setNotice(`${record.name} was removed from your local graduate records.`);
  }

  function importValidRecords() {
    const existingIds = new Set(records.map((record) => record.id));
    const newRecords = importedGraduates.filter((record) => !existingIds.has(record.id));
    setRecords((current) => [...newRecords, ...current]);
    setImportPreview(false);
    setNotice(`${newRecords.length} valid demo graduate records were added locally. The record needing review was not imported.`);
  }

  return (
    <div className="space-y-6">
      {notice && (
        <p
          className="rounded-lg border border-foreground/15 bg-muted/30 px-4 py-3 text-sm"
          role="status"
          aria-live="polite"
        >
          {notice}
        </p>
      )}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle><h2>Find graduate records</h2></CardTitle>
            <CardDescription>Search a local working view by graduate, student ID, or programme.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="relative block">
              <span className="sr-only">Search graduate records</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search name, student ID, or programme" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <FilterSelect label="Faculty" value={faculty} onValueChange={setFaculty} options={faculties} />
              <FilterSelect label="Programme" value={programme} onValueChange={setProgramme} options={programmes} />
              <FilterSelect label="Graduation year" value={graduationYear} onValueChange={setGraduationYear} options={years.map(String)} />
              <FilterSelect label="Employment status" value={employmentStatus} onValueChange={setEmploymentStatus} options={employmentStatuses} />
              <FilterSelect label="Verification status" value={verificationStatus} onValueChange={setVerificationStatus} options={verificationStatuses} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle><h2 className="flex items-center gap-2"><FileUp className="h-4 w-4" aria-hidden />Import graduates</h2></CardTitle>
            <CardDescription>Review the demo import result before adding valid records.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="block space-y-2 text-sm font-medium" htmlFor="graduate-import">
              CSV file
              <Input id="graduate-import" type="file" accept=".csv,text/csv" onChange={(event) => setImportPreview(Boolean(event.target.files?.length))} />
            </label>
            {importPreview && (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="font-medium">Import preview ready: 3 valid records, 1 record needs review.</p>
                <p className="mt-1 text-xs text-muted-foreground">This prototype does not parse or upload the selected file.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={importValidRecords}>Import valid records</Button>
                  <Button size="sm" variant="ghost" onClick={() => setImportPreview(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3" aria-label="Graduate record actions">
        <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{filteredRecords.length}</span> of {records.length} local records shown</p>
        <Button onClick={openNewGraduateForm}><Plus aria-hidden />Add graduate</Button>
      </section>

      {showForm && (
        <Card className="border-foreground/20">
          <CardHeader>
            <CardTitle><h2>{editingId ? "Edit graduate record" : "Add graduate record"}</h2></CardTitle>
            <CardDescription>{roleName}: {restrictionNotice}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={saveGraduate}>
              <label className="space-y-2 text-sm font-medium">Graduate name<Input value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} required disabled={Boolean(editingId && isCareers)} /></label>
              <label className="space-y-2 text-sm font-medium">Student ID<Input value={draft.studentId} onChange={(event) => updateDraft("studentId", event.target.value)} required disabled={Boolean(editingId && isCareers)} /></label>
              <label className="space-y-2 text-sm font-medium">Faculty<Select value={draft.faculty} onValueChange={(value) => updateDraft("faculty", value)} disabled={Boolean(editingId && isCareers)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{faculties.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></label>
              <label className="space-y-2 text-sm font-medium">Programme<Input value={draft.programme} onChange={(event) => updateDraft("programme", event.target.value)} required disabled={Boolean(editingId && isCareers)} /></label>
              <label className="space-y-2 text-sm font-medium">Graduation year<Input type="number" min="1900" max="2100" value={draft.graduationYear} onChange={(event) => updateDraft("graduationYear", Number(event.target.value))} disabled={Boolean(editingId && isCareers)} /></label>
              <label className="space-y-2 text-sm font-medium">Profile completeness (%)<Input type="number" min="0" max="100" value={draft.profileCompletion} onChange={(event) => updateDraft("profileCompletion", Number(event.target.value))} disabled={Boolean(editingId && isCareers)} /></label>
              <label className="space-y-2 text-sm font-medium">Employment status<Select value={draft.employmentStatus} onValueChange={(value) => updateDraft("employmentStatus", value as EmploymentStatus)} disabled={Boolean(editingId && !isCareers)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{employmentStatuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></label>
              <label className="space-y-2 text-sm font-medium">Credential status<Select value={draft.verificationStatus} onValueChange={(value) => updateDraft("verificationStatus", value as AcademicVerificationStatus)} disabled={Boolean(editingId && isCareers)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{verificationStatuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></label>
              <label className="space-y-2 text-sm font-medium xl:col-span-3">Next action<Input value={draft.nextAction} onChange={(event) => updateDraft("nextAction", event.target.value)} disabled={Boolean(editingId && !isCareers)} /></label>
              <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-3"><Button type="submit">{editingId ? "Save permitted changes" : "Add graduate"}</Button><Button type="button" variant="ghost" onClick={() => setShowForm(false)}><X aria-hidden />Cancel</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      {filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <div><h2 className="font-semibold">No graduate records match these filters</h2><p className="mt-1 text-sm text-muted-foreground">Clear the search and filters to view the current local record set.</p></div>
            <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader><TableRow><TableHead>Graduate</TableHead><TableHead>Programme</TableHead><TableHead>Year</TableHead><TableHead>Profile</TableHead><TableHead>Employment</TableHead><TableHead>Credential</TableHead><TableHead>Next action</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
              <TableBody>{filteredRecords.map((record) => <GraduateRow key={record.id} record={record} onEdit={openEditGraduateForm} onDelete={requestDelete} />)}</TableBody>
            </Table>
          </div>
          <div className="grid gap-3 md:hidden">{filteredRecords.map((record) => <GraduateCard key={record.id} record={record} onEdit={openEditGraduateForm} onDelete={requestDelete} />)}</div>
        </>
      )}

      {pendingDeletionId && (() => {
        const record = records.find((item) => item.id === pendingDeletionId);
        if (!record) return null;
        return <Card className="border-destructive/50"><CardContent className="flex flex-wrap items-center justify-between gap-3 p-4"><p className="text-sm">Remove <span className="font-semibold">{record.name}</span> from local graduate records?</p><div className="flex gap-2"><Button size="sm" variant="destructive" onClick={() => deleteGraduate(record)}>Remove record</Button><Button size="sm" variant="ghost" onClick={() => setPendingDeletionId(null)}>Keep record</Button></div></CardContent></Card>;
      })()}
    </div>
  );
}

function FilterSelect({ label, value, onValueChange, options }: { label: string; value: string; onValueChange: (value: string) => void; options: readonly string[] }) {
  const id = `graduate-filter-${label.toLocaleLowerCase().replaceAll(" ", "-")}`;
  return <label className="space-y-2 text-sm font-medium" htmlFor={id}>{label}<Select value={value} onValueChange={onValueChange}><SelectTrigger id={id}><SelectValue placeholder={`All ${label.toLocaleLowerCase()}`} /></SelectTrigger><SelectContent><SelectItem value="all">All {label.toLocaleLowerCase()}</SelectItem>{options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></label>;
}

function GraduateRow({ record, onEdit, onDelete }: { record: Graduate; onEdit: (record: Graduate) => void; onDelete: (record: Graduate) => void }) {
  return <TableRow><TableCell><p className="font-medium">{record.name}</p><p className="text-xs text-muted-foreground">{record.studentId}</p></TableCell><TableCell>{record.programme}</TableCell><TableCell className="tabular-nums">{record.graduationYear}</TableCell><TableCell className="tabular-nums">{record.profileCompletion}%</TableCell><TableCell><Badge variant={statusVariant(record.employmentStatus)}>{record.employmentStatus}</Badge></TableCell><TableCell><Badge variant={statusVariant(record.verificationStatus)}>{record.verificationStatus}</Badge></TableCell><TableCell className="max-w-56 text-sm text-muted-foreground">{record.nextAction}</TableCell><TableCell><div className="flex gap-1"><Button size="icon" variant="ghost" aria-label={`Edit ${record.name}`} onClick={() => onEdit(record)}><Pencil aria-hidden /></Button><Button size="icon" variant="ghost" aria-label={`Delete ${record.name}`} onClick={() => onDelete(record)}><Trash2 aria-hidden /></Button></div></TableCell></TableRow>;
}

function GraduateCard({ record, onEdit, onDelete }: { record: Graduate; onEdit: (record: Graduate) => void; onDelete: (record: Graduate) => void }) {
  return <Card><CardContent className="space-y-4 p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{record.name}</h2><p className="text-sm text-muted-foreground">{record.studentId}</p></div><div className="flex gap-1"><Button size="icon" variant="ghost" aria-label={`Edit ${record.name}`} onClick={() => onEdit(record)}><Pencil aria-hidden /></Button><Button size="icon" variant="ghost" aria-label={`Delete ${record.name}`} onClick={() => onDelete(record)}><Trash2 aria-hidden /></Button></div></div><dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm"><RecordDetail label="Programme" value={record.programme} /><RecordDetail label="Year" value={record.graduationYear} /><RecordDetail label="Profile completion" value={`${record.profileCompletion}%`} /><div className="space-y-1"><dt className="text-xs font-medium text-muted-foreground">Employment</dt><dd><Badge variant={statusVariant(record.employmentStatus)}>{record.employmentStatus}</Badge></dd></div><div className="space-y-1"><dt className="text-xs font-medium text-muted-foreground">Credential</dt><dd><Badge variant={statusVariant(record.verificationStatus)}>{record.verificationStatus}</Badge></dd></div><RecordDetail label="Next action" value={record.nextAction} className="col-span-2" /></dl></CardContent></Card>;
}

function RecordDetail({ label, value, className = "" }: { label: string; value: string | number; className?: string }) {
  return <div className={`space-y-1 ${className}`}><dt className="text-xs font-medium text-muted-foreground">{label}</dt><dd>{value}</dd></div>;
}
