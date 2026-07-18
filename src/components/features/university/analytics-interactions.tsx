"use client";

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
                <p>{recommendation.title}</p>
                <p className="text-muted-foreground">{recommendation.body}</p>
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
                <p>{report.title}</p>
                <p className="text-muted-foreground">{report.issued}</p>
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

export function BuildReportButton() {
  const { push } = useToast();

  return (
    <Button
      onClick={() =>
        push({
          title: "Custom report builder opened",
          description: "Choose cohorts, programs, and skills for this slice.",
          tone: "info",
        })
      }
    >
      <BarChart3 aria-hidden />
      Build report
    </Button>
  );
}
