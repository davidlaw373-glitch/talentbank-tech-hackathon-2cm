"use client";

import { useState } from "react";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Lightbulb,
  Share2,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { useToast } from "@/components/common/toast";
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
import type { SkillDemand } from "@/types/university";

export type AnalyticsReport = {
  id: string;
  title: string;
  type: string;
  issued: string;
};

export function AnalyticsActions() {
  const { push } = useToast();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        onClick={() =>
          push({
            title: "PDF export started",
            description: "Your analytics report is being prepared.",
            tone: "success",
          })
        }
      >
        <FileText aria-hidden />
        Export PDF
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          push({
            title: "Excel export started",
            description: "Your analytics workbook is being prepared.",
            tone: "success",
          })
        }
      >
        <FileSpreadsheet aria-hidden />
        Export Excel
      </Button>
      <Button
        onClick={() =>
          push({
            title: "Report generation started",
            description: "Current cohort and demand data will be included.",
            tone: "success",
          })
        }
      >
        <BarChart3 aria-hidden />
        Generate report
      </Button>
    </div>
  );
}

export function CurriculumRecommendations({
  skills,
}: {
  skills: SkillDemand[];
}) {
  const { push } = useToast();
  const sorted = [...skills].sort((a, b) => b.delta - a.delta);
  const top = sorted[0];
  const mid = sorted[1];
  const low = sorted[sorted.length - 1];

  const recommendations = [
    {
      title: `Add a ${top.skill} elective`,
      body: `Demand up ${top.delta}% in the last year — only ${top.openings} openings being filled.`,
      icon: Sparkles,
    },
    {
      title: `Increase ${mid.skill} coverage in core tracks`,
      body: `Openings grew ${mid.delta}% to ${mid.openings}. Pair it with hands-on capstone briefs.`,
      icon: TrendingUp,
    },
    {
      title: `Pair ${low.skill} with an adjacent skill`,
      body: `Demand steady at ${low.delta}% — combine with dbt or analytics to lift placement.`,
      icon: Lightbulb,
    },
  ];

  return (
    <ul className="space-y-3">
      {recommendations.map((recommendation) => {
        const Icon = recommendation.icon;
        return (
          <li
            key={recommendation.title}
            className="flex items-start gap-3 rounded-lg border bg-card p-4"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="flex-1 space-y-2">
              <div className="space-y-1">
                <p className="text-base font-medium">{recommendation.title}</p>
                <p className="text-sm text-muted-foreground">{recommendation.body}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  push({
                    title:
                      "Recommendation shared with curriculum committee",
                    description: recommendation.title,
                    tone: "success",
                  })
                }
              >
                Adopt recommendation
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function ReportsArchive({
  reports,
}: {
  reports: readonly AnalyticsReport[];
}) {
  const { push } = useToast();

  return (
    <ul className="divide-y">
      {reports.map((report) => (
        <li key={report.id} className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                <FileText className="h-4 w-4" aria-hidden />
              </span>
              <div className="space-y-0.5">
                <p className="text-base font-medium">{report.title}</p>
                <p className="text-sm text-muted-foreground">{report.issued}</p>
              </div>
            </div>
            <Badge variant="outline">{report.type}</Badge>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                push({
                  title: `${report.title} download started`,
                  description: `${report.type} will be saved when ready.`,
                  tone: "success",
                })
              }
            >
              <Download aria-hidden />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                push({
                  title: `${report.title} share link created`,
                  description: "The report is ready to share with faculty.",
                  tone: "info",
                })
              }
            >
              <Share2 aria-hidden />
              Share
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

const REPORT_FORMATS = [
  { value: "pdf", label: "PDF" },
  { value: "excel", label: "Excel" },
  { value: "csv", label: "CSV" },
] as const;

function ToggleChip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={
        selected
          ? "rounded-full border border-primary bg-primary px-3 py-1 text-sm font-medium text-primary-foreground"
          : "rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-muted-foreground hover:border-foreground/40"
      }
    >
      {label}
    </button>
  );
}

export function CustomSliceBuilder({
  cohorts,
  skills,
}: {
  cohorts: string[];
  skills: string[];
}) {
  const { push } = useToast();
  const [selectedCohorts, setSelectedCohorts] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(
    () => new Set(),
  );
  const [format, setFormat] = useState<string>("pdf");

  function toggle(
    setter: (updater: (current: Set<string>) => Set<string>) => void,
    value: string,
  ) {
    setter((current) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  const canBuild = selectedCohorts.size > 0;

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>
          <h3 className="text-subheading">Need a custom slice?</h3>
        </CardTitle>
        <CardDescription>
          Combine cohorts, skills, and a format into a one-off report.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium">Cohorts</p>
          <div className="flex flex-wrap gap-2">
            {cohorts.map((cohort) => (
              <ToggleChip
                key={cohort}
                label={cohort}
                selected={selectedCohorts.has(cohort)}
                onToggle={() => toggle(setSelectedCohorts, cohort)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Skills (optional)</p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <ToggleChip
                key={skill}
                label={skill}
                selected={selectedSkills.has(skill)}
                onToggle={() => toggle(setSelectedSkills, skill)}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Format</p>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_FORMATS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            disabled={!canBuild}
            onClick={() => {
              const cohortList = Array.from(selectedCohorts).join(", ");
              const skillList = Array.from(selectedSkills).join(", ");
              push({
                title: "Custom report queued",
                description: `${cohortList}${
                  skillList ? ` · Skills: ${skillList}` : ""
                } · ${format.toUpperCase()}`,
                tone: "success",
              });
            }}
          >
            <BarChart3 aria-hidden />
            Build report
          </Button>
        </div>
        {!canBuild && (
          <p className="text-sm text-muted-foreground">
            Select at least one cohort to build a report.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
