"use client";

import { useMemo, useState } from "react";
import { FileDown, FileSpreadsheet, FileText, RotateCcw } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { curriculumInsights, industryDemand } from "@/data/university";
import { selectReportProjection } from "@/lib/university-demo-state";

type DistributionItem = { label: string; count: number };

function LabelledDistribution({ items, label }: { items: DistributionItem[]; label: string }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">No confirmed {label.toLocaleLowerCase()} data in this scope.</p>;
  const maximum = Math.max(...items.map((item) => item.count), 1);

  return <ol className="space-y-3">{items.map((item, index) => {
    const percentage = Math.round((item.count / maximum) * 100);
    return <li key={item.label} className="space-y-1.5"><div className="flex justify-between gap-3 text-sm"><span><span className="mr-2 text-xs tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>{item.label}</span><span className="shrink-0 font-semibold tabular-nums">{item.count}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={`${item.label}: ${item.count} ${label.toLocaleLowerCase()}`} aria-valuemin={0} aria-valuemax={maximum} aria-valuenow={item.count}><div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} /></div></li>;
  })}</ol>;
}

export function UniversityReports() {
  const { role } = useUniversityRole();
  const { state } = useCareerOSDemo();
  const [graduationYear, setGraduationYear] = useState("all");
  const [faculty, setFaculty] = useState("all");
  const [programme, setProgramme] = useState("all");
  const [requestedPreview, setRequestedPreview] = useState(false);
  const [exportMessage, setExportMessage] = useState("");

  const years = useMemo(() => [...new Set(state.graduates.map((graduate) => graduate.graduationYear))].sort((a, b) => b - a), [state.graduates]);
  const faculties = useMemo(() => [...new Set(state.graduates.map((graduate) => graduate.faculty))].sort(), [state.graduates]);
  const programmes = useMemo(() => [...new Set(state.graduates.map((graduate) => graduate.programme))].sort(), [state.graduates]);
  const report = useMemo(
    () =>
      selectReportProjection(state, {
        graduationYear,
        faculty,
        programme,
      }),
    [faculty, graduationYear, programme, state]
  );
  const relevantInsights = useMemo(() => curriculumInsights.filter((insight) => programme === "all" || insight.programme === programme), [programme]);
  const noMatches = requestedPreview && report.scopedGraduates.length === 0;
  const previewReady = requestedPreview && !noMatches;
  const roleName = role === "careers" ? "Career Services" : "Registry";

  function resetFilters() {
    setGraduationYear("all");
    setFaculty("all");
    setProgramme("all");
    setRequestedPreview(false);
    setExportMessage("");
  }

  function generatePreview() {
    setRequestedPreview(true);
    setExportMessage("");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle><h2>Graduate outcomes report scope</h2></CardTitle>
          <CardDescription>{roleName} can generate a transparent, local preview from the currently tracked graduate outcomes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <ReportFilter label="Graduation year" value={graduationYear} onValueChange={setGraduationYear} options={years.map(String)} />
            <ReportFilter label="Faculty" value={faculty} onValueChange={setFaculty} options={faculties} />
            <ReportFilter label="Programme" value={programme} onValueChange={setProgramme} options={programmes} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={generatePreview}><FileText aria-hidden />Generate preview</Button>
            <Button type="button" variant="ghost" onClick={resetFilters}><RotateCcw aria-hidden />Reset report filters</Button>
          </div>
        </CardContent>
      </Card>

      {exportMessage && <p className="rounded-lg border border-foreground/15 bg-muted/30 px-4 py-3 text-sm" role="status" aria-live="polite">{exportMessage}</p>}

      {!requestedPreview && <Card className="border-dashed"><CardContent className="p-6"><p className="font-medium">Choose a report scope, then generate a local preview.</p><p className="mt-1 text-sm text-muted-foreground">The preview makes coverage and missing outcomes visible before any reporting decision. This Hackathon build does not create files.</p></CardContent></Card>}

      {noMatches && <Card className="border-dashed" role="status" aria-live="polite"><CardContent className="flex flex-wrap items-center justify-between gap-4 p-6"><div><p className="font-medium">No graduate outcomes match this report scope.</p><p className="mt-1 text-sm text-muted-foreground">Your selected filters are still active. Reset them to return to the full graduate cohort.</p></div><Button type="button" variant="outline" onClick={resetFilters}><RotateCcw aria-hidden />Reset report filters</Button></CardContent></Card>}

      {previewReady && <section aria-labelledby="report-preview-heading" className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="report-preview-heading" className="text-xl font-semibold tracking-tight">Report preview</h2><p className="mt-1 text-sm text-muted-foreground">Local calculation for {report.scopedGraduates.length} graduate{report.scopedGraduates.length === 1 ? "" : "s"} in scope.</p></div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => setExportMessage("PDF export is a preview in this Hackathon build; no file was created.")}><FileDown aria-hidden />Export PDF</Button><Button type="button" variant="outline" onClick={() => setExportMessage("Excel export is a preview in this Hackathon build; no file was created.")}><FileSpreadsheet aria-hidden />Export Excel</Button></div></div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Employment rate" value={`${report.metrics.employmentRate}%`} detail={`${report.metrics.employed} employed of ${report.metrics.laborForce} in labour force`} />
          <Metric label="Average days" value={report.metrics.averageDaysToEmployment} detail="For confirmed employed graduates" />
          <Metric label="Known-outcome coverage" value={`${report.metrics.coverageRate}%`} detail={`${report.metrics.knownOutcomes} of ${report.scopedGraduates.length} outcomes known`} />
          <Metric label="Missing outcomes" value={report.missingOutcomeCount} detail="Unknown or not yet recorded" />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <ReportPanel title="Role distribution"><LabelledDistribution items={report.roles} label="roles" /></ReportPanel>
          <ReportPanel title="Industry distribution"><LabelledDistribution items={report.industries} label="industries" /></ReportPanel>
          <ReportPanel title="Leading employers"><LabelledDistribution items={report.employers} label="employers" /></ReportPanel>
          <ReportPanel title="Demand-led skill gaps"><div className="space-y-3">{relevantInsights.length > 0 ? relevantInsights.map((insight, index) => { const demand = industryDemand.find((item) => insight.title.toLocaleLowerCase().includes(item.skill.toLocaleLowerCase()) || insight.evidence.toLocaleLowerCase().includes(item.skill.toLocaleLowerCase())); return <div key={insight.id} className="rounded-lg border bg-muted/20 p-3"><div className="flex items-start justify-between gap-3"><p className="text-sm font-medium">{demand?.skill ?? insight.title}</p><Badge variant="outline">{100 - insight.coverage}% gap</Badge></div><p className="mt-1 text-xs text-muted-foreground">{insight.programme} evidence coverage: {insight.coverage}%{index === 0 && demand ? ` - ${demand.openRoles} open roles tracked` : ""}</p></div>; }) : <p className="text-sm text-muted-foreground">No curriculum evidence is linked to the selected programme in this preview.</p>}</div></ReportPanel>
        </div>
      </section>}
    </div>
  );
}

function ReportFilter({ label, value, onValueChange, options }: { label: string; value: string; onValueChange: (value: string) => void; options: readonly string[] }) {
  const id = `report-filter-${label.toLocaleLowerCase().replaceAll(" ", "-")}`;
  return <label className="space-y-2 text-sm font-medium" htmlFor={id}>{label}<Select value={value} onValueChange={onValueChange}><SelectTrigger id={id}><SelectValue placeholder={`All ${label.toLocaleLowerCase()}`} /></SelectTrigger><SelectContent><SelectItem value="all">All {label.toLocaleLowerCase()}</SelectItem>{options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></label>;
}

function Metric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return <Card><CardContent className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p><p className="mt-2 text-xs text-muted-foreground">{detail}</p></CardContent></Card>;
}

function ReportPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <Card><CardHeader><CardTitle><h3>{title}</h3></CardTitle></CardHeader><CardContent>{children}</CardContent></Card>;
}
