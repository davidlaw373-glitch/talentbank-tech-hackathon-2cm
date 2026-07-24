"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  Info,
  Lightbulb,
  PencilLine,
  RotateCcw,
  Sparkles,
  Wand2,
  X,
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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { get as getCandidate } from "@/data/candidates";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Domain types                                                        */
/* ------------------------------------------------------------------ */

type IssueSeverity = "critical" | "warning" | "info";

type IssueCategory =
  | "Spelling"
  | "Grammar"
  | "Phrasing"
  | "Metrics"
  | "Keywords"
  | "Length"
  | "Tone";

type IssueField =
  | { kind: "name" }
  | { kind: "title" }
  | { kind: "summary" }
  | { kind: "skills" }
  | { kind: "experience"; experienceId: number }
  | { kind: "project"; projectId: number };

type Issue = {
  id: string;
  severity: IssueSeverity;
  category: IssueCategory;
  title: string;
  detail: string;
  suggestion: string;
  rationale?: string;
  field: IssueField;
  /** Phrase-level resolve: when this substring disappears, the issue
   *  auto-resolves. Omit for issues that resolve on any edit. */
  matchText?: string;
};

/** The editable document. We keep a deep shape so individual fields can
 *  change without bumping the entire object — important because the
 *  resume renders every render and we don't want flashes. */
type ResumeDraft = {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  experience: Array<{
    id: number;
    company: string;
    role: string;
    period: string;
    description: string;
  }>;
  education: Array<{
    id: number;
    institution: string;
    qualification: string;
    period: string;
  }>;
  projects: Array<{
    id: number;
    name: string;
    description: string;
    skills: string[];
  }>;
};

const EMPTY_RESUME: ResumeDraft = {
  name: "",
  title: "",
  location: "",
  email: "",
  phone: "",
  summary: "",
  skills: [],
  experience: [],
  education: [],
  projects: [],
};

/* ------------------------------------------------------------------ */
/* Visual tokens                                                       */
/* ------------------------------------------------------------------ */

const SEVERITY_LABEL: Record<IssueSeverity, string> = {
  critical: "Critical",
  warning: "Suggestion",
  info: "Tip",
};

const SEVERITY_SURFACE: Record<IssueSeverity, string> = {
  critical:
    "border-destructive/50 border-l-destructive bg-destructive/10 text-foreground",
  warning:
    "border-warning/50 border-l-warning bg-warning/10 text-foreground",
  info: "border-info/40 border-l-info bg-info/10 text-foreground",
};

const SEVERITY_BADGE: Record<IssueSeverity, string> = {
  critical: "border-destructive/50 bg-destructive/15 text-foreground",
  warning: "border-warning/50 bg-warning/15 text-foreground",
  info: "border-info/40 bg-info/10 text-foreground",
};

const SEVERITY_ICON: Record<IssueSeverity, string> = {
  critical: "text-destructive",
  warning: "text-warning",
  info: "text-info",
};

const SEVERITY_FIELD: Record<IssueSeverity, string> = {
  critical:
    "bg-destructive/5 ring-2 ring-destructive/60 ring-offset-4 ring-offset-card",
  warning:
    "bg-warning/5 ring-2 ring-warning/60 ring-offset-4 ring-offset-card",
  info: "bg-info/5 ring-2 ring-info/50 ring-offset-4 ring-offset-card",
};

const SEVERITY_HIGHLIGHT: Record<IssueSeverity, string> = {
  critical:
    "bg-destructive/15 text-foreground underline decoration-destructive decoration-2 underline-offset-2",
  warning:
    "bg-warning/15 text-foreground underline decoration-warning decoration-2 underline-offset-2",
  info: "bg-info/10 text-foreground underline decoration-info decoration-dotted decoration-2 underline-offset-2",
};

/* ------------------------------------------------------------------ */
/* AI issues — anchored to the same fields the user can edit           */
/* ------------------------------------------------------------------ */

const ISSUES: Issue[] = [
  {
    id: "name-cta",
    severity: "info",
    category: "Tone",
    title: "Pair the role with a headline proof point",
    detail:
      "Your full name (`Alex Morgan`) reads cleanly and your headline already shows the role. Once the Suggestion above adds TypeScript to the headline, take another beat to pair the role with a concrete result. This Tip doesn't propose an edit on its own — apply it together with the Suggestion.",
    suggestion:
      "Senior Frontend Developer · TypeScript & React — design-system lead adopted by 4 teams (~80 engineers)",
    rationale:
      "Recruiters skim name → headline in the first second. An evidence-bearing tagline outperforms a name tweak when both already read correctly.",
    field: { kind: "title" },
  },
  {
    id: "title-typescript",
    severity: "warning",
    category: "Keywords",
    title: "Surface TypeScript in your headline",
    detail:
      "Recruiters search by skill, not role. Adding TypeScript to the headline keeps it visible within the first two words — useful when ATS pipelines index top-of-document text first.",
    suggestion: "Senior Frontend Developer · TypeScript & React",
    rationale: "ATS pipelines rank on keyword placement in the top 10%.",
    field: { kind: "title" },
    matchText: "Frontend Developer",
  },
  {
    id: "title-em-dash",
    severity: "info",
    category: "Tone",
    title: "Format the headline as role · stack",
    detail:
      "When you reach the recommended rewrite, keep the role and the stack split by a middle dot ( · ) so the headline reads as two crisp halves — many recruiters parse it that way on first scroll. This is a formatting tip on top of the Suggestion above; consider it once the keyword rewrite lands.",
    suggestion:
      "Senior Frontend Developer · TypeScript & React",
    rationale:
      "Avoids role-on-top stacking and keeps the stack keyword visible to screen readers.",
    field: { kind: "title" },
  },
  {
    id: "summary-typescript",
    severity: "warning",
    category: "Keywords",
    title: "Lead with TypeScript, not role title",
    detail:
      "Your summary opens with the role title. Recruiters search by skill — move a flagship skill (TypeScript) to the front so it is visible inside the first two lines.",
    suggestion:
      "TypeScript-led frontend developer with 6+ years shipping accessible, well-tested React systems.",
    rationale:
      "ATS pipelines rank on keyword placement in the top 10% of the document.",
    field: { kind: "summary" },
    matchText: "Product-minded frontend developer",
  },
  {
    id: "summary-metrics",
    severity: "warning",
    category: "Metrics",
    title: "Quantify the design-system reach",
    detail:
      "“4 product teams” is good, but it reads like an afterthought. Pull the metric into the headline and pair it with a business outcome.",
    suggestion:
      "Most recently led the design-system rebuild at Northstar Labs — adopted by 4 product teams (~80 engineers) and shipped to all customer-facing apps.",
    field: { kind: "summary" },
    matchText: "4 product teams",
  },
  {
    id: "summary-length",
    severity: "info",
    category: "Length",
    title: "Summary length is at the upper end",
    detail:
      "Two sentences is the recruiter sweet spot. You are right at the limit. Once the Suggestion above lands and a metric is in the second sentence, this Tip goes away on its own — no extra edit needed.",
    suggestion:
      "Trim “Product-minded” and merge the second sentence with the first.",
    field: { kind: "summary" },
  },
  {
    id: "experience-northstar",
    severity: "critical",
    category: "Phrasing",
    title: "Lead with the action + result",
    detail:
      "Your first bullet on Northstar Labs is the strongest metric on the resume. Lead with the verb (“Reduced…”) so a 6-second scan reads top-down: action → outcome → scope.",
    suggestion:
      "Reduced page load time by 35% across the top 10 Northstar Labs flows by rebuilding the design-system bundle.",
    field: { kind: "experience", experienceId: 1 },
    matchText: "cut page load time by 35% across the top 10 flows",
  },
  {
    id: "experience-lumen",
    severity: "info",
    category: "Tone",
    title: "Replace “end-to-end” with what you actually owned",
    detail:
      "“End-to-end” is vague and overused. This Tip complements the experience you already have — once you swap the phrase in the Lumen Labs bullet, the Tip is satisfied without an additional edit.",
    suggestion:
      "Co-led discovery, specs, and release for the realtime collab suite used by 12,000+ learners.",
    field: { kind: "experience", experienceId: 2 },
    matchText: "partnered with design and product end-to-end",
  },
  {
    id: "skills-typescript",
    severity: "warning",
    category: "Keywords",
    title: "Skills already lead with TypeScript — pair with a metric",
    detail:
      "TypeScript is your top keyword and already leads the list. Pair it with one adoption metric (e.g. the design-system reach) so reviewers see its weight at a glance.",
    suggestion: "TypeScript (adopted by 4 product teams, 80+ engineers)",
    field: { kind: "skills" },
    matchText: "TypeScript",
  },
  {
    id: "skills-discovery",
    severity: "info",
    category: "Phrasing",
    title: "“Product discovery” reads better split",
    detail:
      "“Product discovery” treats the two words as one skill. Splitting them surfaces more searches and reads more naturally on a CV.",
    suggestion: "Product discovery",
    field: { kind: "skills" },
    matchText: "Product discovery",
  },
  {
    id: "project-careeros-spelling",
    severity: "critical",
    category: "Spelling",
    title: "Capitalise “Open Source” consistently",
    detail:
      "Capitalisation is inconsistent across the resume. “Open-source” as an adjective is fine, but the leading capital “O” on the Careeros headline clashes with the rest of the document, which is sentence case.",
    suggestion:
      "Open-source portfolio helper — generates a personalised career timeline from your contributions.",
    field: { kind: "project", projectId: 1 },
    matchText: "Open-source portfolio helper",
  },
  {
    id: "project-careeros-metrics",
    severity: "warning",
    category: "Metrics",
    title: "Add a result line for Careeros",
    detail:
      "The description tells reviewers what the project is, not what it achieved. Add one metric (stars, weekly active users, contributions) so reviewers can weigh the impact.",
    suggestion:
      "Open-source portfolio helper — generates a personalised career timeline from your contributions. Used by 1,200+ contributors; 4.6k GitHub stars.",
    field: { kind: "project", projectId: 1 },
  },
];

/* ------------------------------------------------------------------ */
/* Draft helpers                                                       */
/* ------------------------------------------------------------------ */

const fieldKey = (field: IssueField): string =>
  field.kind === "experience"
    ? `experience:${field.experienceId}`
    : field.kind === "project"
      ? `project:${field.projectId}`
      : field.kind;

const getFieldText = (draft: ResumeDraft, field: IssueField): string => {
  switch (field.kind) {
    case "name":
      return draft.name;
    case "title":
      return draft.title;
    case "summary":
      return draft.summary;
    case "skills":
      return draft.skills.join(", ");
    case "experience":
      return (
        draft.experience.find((exp) => exp.id === field.experienceId)
          ?.description ?? ""
      );
    case "project":
      return (
        draft.projects.find((proj) => proj.id === field.projectId)
          ?.description ?? ""
      );
    default:
      return "";
  }
};

const setFieldText = (
  draft: ResumeDraft,
  field: IssueField,
  value: string,
): ResumeDraft => {
  switch (field.kind) {
    case "name":
      return { ...draft, name: value };
    case "title":
      return { ...draft, title: value };
    case "summary":
      return { ...draft, summary: value };
    case "skills": {
      const next = value
        .split(/[,\n]/)
        .map((part) => part.trim())
        .filter(Boolean);
      return { ...draft, skills: next };
    }
    case "experience":
      return {
        ...draft,
        experience: draft.experience.map((exp) =>
          exp.id === field.experienceId
            ? { ...exp, description: value }
            : exp,
        ),
      };
    case "project":
      return {
        ...draft,
        projects: draft.projects.map((proj) =>
          proj.id === field.projectId
            ? { ...proj, description: value }
            : proj,
        ),
      };
    default:
      return draft;
  }
};

const parseTechnologyList = (value: string): string[] => {
  const seen = new Set<string>();

  return value
    .split(/[,\n]/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter((technology) => {
      if (!technology) return false;
      const key = technology.toLocaleLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const getFieldLabel = (draft: ResumeDraft, field: IssueField): string => {
  switch (field.kind) {
    case "name":
      return "Full name";
    case "title":
      return "Headline";
    case "summary":
      return "Summary";
    case "skills":
      return "Skills";
    case "experience":
      return (
        draft.experience.find((exp) => exp.id === field.experienceId)?.company ??
        "Experience"
      );
    case "project":
      return (
        draft.projects.find((project) => project.id === field.projectId)?.name ??
        "Project"
      );
    default:
      return "Resume field";
  }
};

const getOriginalFieldText = (
  original: ResumeDraft,
  field: IssueField,
): string => getFieldText(original, field);

const isIssueResolved = (
  issue: Issue,
  draft: ResumeDraft,
  original: ResumeDraft,
): boolean => {
  const current = getFieldText(draft, issue.field).trim();
  if (issue.matchText) {
    const remainingOccurrences = current
      ? current
          .toLocaleLowerCase()
          .split(issue.matchText.toLocaleLowerCase()).length - 1
      : 0;
    if (remainingOccurrences <= 0) return true;
  }
  const originalText = getOriginalFieldText(original, issue.field).trim();
  return current !== "" && originalText !== "" && current !== originalText;
};

const getResolutionProgress = (
  issue: Issue,
  draft: ResumeDraft,
  original: ResumeDraft,
): number => {
  const current = getFieldText(draft, issue.field);
  const originalText = getOriginalFieldText(original, issue.field);
  if (issue.matchText) {
    const remaining = current
      ? current
          .toLocaleLowerCase()
          .split(issue.matchText.toLocaleLowerCase()).length - 1
      : 0;
    if (remaining <= 0) return 1;
  }
  const suggestion = issue.suggestion.trim();
  const currentNorm = current.trim().toLocaleLowerCase();
  const originalNorm = originalText.trim().toLocaleLowerCase();
  if (suggestion && suggestion.toLocaleLowerCase() === currentNorm) return 1;
  if (originalNorm && currentNorm === originalNorm) return 0;
  if (!suggestion) return current.trim() === "" ? 1 : 0;
  const reference = suggestion.length >= originalText.trim().length
    ? suggestion
    : originalText;
  const overlap =
    reference.toLocaleLowerCase() === currentNorm
      ? 1
      : reference
          .toLocaleLowerCase()
          .split(currentNorm || " ")
          .filter(Boolean).length > 1
        ? 0.4
        : 0.6;
  if (current.trim() === "") return 0;
  return Math.min(0.85, Math.max(0.1, overlap));
};

const buildOriginalDraft = (
  candidate: NonNullable<ReturnType<typeof getCandidate>>,
): ResumeDraft => ({
  name: candidate.name,
  title: candidate.title,
  location: candidate.location,
  email: candidate.email,
  phone: candidate.phone,
  summary: candidate.summary,
  skills: [...candidate.skills],
  experience: candidate.experience.map((exp) => ({
    id: exp.id,
    company: exp.company,
    role: exp.role,
    period: exp.period,
    description: exp.description,
  })),
  education: candidate.education.map((edu) => ({
    id: edu.id,
    institution: edu.institution,
    qualification: edu.qualification,
    period: edu.period,
  })),
  projects: candidate.projects.map((proj) => ({
    id: proj.id,
    name: proj.name,
    description: proj.description,
    skills: [...proj.skills],
  })),
});

const isSameDraft = (a: ResumeDraft, b: ResumeDraft): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

/* ------------------------------------------------------------------ */
/* EditableText — click to edit in place                               */
/* ------------------------------------------------------------------ */

type HighlightSpan = {
  issueId: string;
  matchText: string;
  severity: IssueSeverity;
  isActive: boolean;
};

type EditableTextProps = {
  value: string;
  onCommit: (next: string) => void;
  as?: "h1" | "h2" | "p" | "span";
  multiline?: boolean;
  className?: string;
  placeholder?: string;
  /** Bumped for accessibility labelling when many editables share text. */
  label: string;
  /** Optional phrase-level highlights to weave into the display text.
   *  When provided and any match `value`, they render as `<mark>` spans
   *  on top of the click-to-edit affordance — the user always sees the
   *  AI-flagged phrases inline. */
  highlights?: HighlightSpan[];
  /** Click handler for `<mark>` spans. Stops propagation so the
   *  click-to-edit isn't fired when the user targets a highlight. */
  onHighlightClick?: (issueId: string) => void;
};

function EditableText({
  value,
  onCommit,
  as = "p",
  multiline = false,
  className,
  placeholder,
  label,
  highlights,
  onHighlightClick,
}: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // While editing, prefer the in-flight draft; otherwise render the
  // committed value. This sidesteps the "sync external state inside an
  // effect" anti-pattern — the displayed text is derived, not pushed.
  const displayed = draft ?? value;

  // Focus + select-all on entering edit mode.
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if (
        "setSelectionRange" in inputRef.current &&
        inputRef.current instanceof HTMLInputElement
      ) {
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      }
    }
  }, [editing]);

  const commit = () => {
    onCommit(draft ?? value);
    setDraft(null);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(null);
    setEditing(false);
  };

  const handleDisplayKeyDown = (
    event: ReactKeyboardEvent<HTMLElement>,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setDraft(value);
      setEditing(true);
    }
  };

  const handleEditKeyDown = (
    event: ReactKeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (event.key === "Escape") {
      event.preventDefault();
      cancel();
    }
    if (
      event.key === "Enter" &&
      (!multiline || event.ctrlKey || event.metaKey)
    ) {
      event.preventDefault();
      commit();
    }
  };

  if (!editing) {
    const Tag = as as "h1";

    // If we have highlights whose matchText is present in the current
    // value, weave them in. Phrases are sorted longest-first so that
    // sub-match overlaps don't get highlighted twice.
    const applicableHighlights = (highlights ?? []).filter((highlight) =>
      value.includes(highlight.matchText),
    );
    const renderHighlightedContent = () => {
      if (displayed.trim().length === 0) {
        return (
          <span className="italic text-muted-foreground">
            {placeholder ?? "Click to add"}
          </span>
        );
      }
      if (applicableHighlights.length === 0) return displayed;

      const phrases = applicableHighlights
        .map((highlight) => highlight.matchText)
        .sort((a, b) => b.length - a.length)
        .map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
      const regex = new RegExp(`(${phrases.join("|")})`, "g");
      const parts = displayed.split(regex);

      return parts.map((part, index) => {
        const matched = applicableHighlights.find(
          (highlight) => highlight.matchText === part,
        );
        if (!matched) return <span key={index}>{part}</span>;
        return (
          <mark
            key={index}
            className={cn(
              "cursor-pointer rounded px-0.5 transition-colors",
              SEVERITY_HIGHLIGHT[matched.severity],
              matched.isActive
                ? "outline outline-2 outline-offset-2"
                : null,
            )}
            onClick={(event) => {
              event.stopPropagation();
              onHighlightClick?.(matched.issueId);
            }}
          >
            {part}
          </mark>
        );
      });
    };

    return (
      <Tag
        role="button"
        tabIndex={0}
        aria-label={`Edit ${label}`}
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        onKeyDown={handleDisplayKeyDown}
        className={cn(
          "group relative cursor-pointer rounded outline-none transition-colors",
          "hover:bg-accent-soft/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "before:pointer-events-none before:absolute before:-top-2 before:right-full before:mr-1 before:hidden before:rounded-md before:bg-foreground before:px-1.5 before:py-0.5 before:text-[10px] before:font-semibold before:uppercase before:tracking-[0.18em] before:text-background before:content-['Edit'] group-hover:before:block group-focus-visible:before:block",
          className,
        )}
      >
        {renderHighlightedContent()}
      </Tag>
    );
  }

  if (multiline) {
    return (
      <Textarea
        ref={inputRef as React.Ref<HTMLTextAreaElement>}
        value={draft ?? value}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={handleEditKeyDown}
        aria-label={label}
        rows={4}
        className={cn("text-base leading-relaxed", className)}
      />
    );
  }

  return (
    <Input
      ref={inputRef as React.Ref<HTMLInputElement>}
      value={draft ?? value}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={handleEditKeyDown}
      aria-label={label}
      className={cn("text-base", className)}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Section eyebrow                                                     */
/* ------------------------------------------------------------------ */

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </p>
  );
}

function SeverityIcon({
  severity,
  className,
}: {
  severity: IssueSeverity;
  className?: string;
}) {
  const Icon =
    severity === "critical"
      ? AlertTriangle
      : severity === "warning"
        ? Lightbulb
        : Info;

  return (
    <Icon
      aria-hidden
      className={cn("h-4 w-4", SEVERITY_ICON[severity], className)}
    />
  );
}

function FieldIssueReference({
  issue,
  isOpen,
}: {
  issue: Issue;
  isOpen: boolean;
}) {
  return (
    <aside
      aria-label={`${SEVERITY_LABEL[issue.severity]} guidance for this field`}
      className={cn(
        "mb-4 rounded-lg border border-l-4 p-3 xl:hidden",
        SEVERITY_SURFACE[issue.severity],
      )}
    >
      <div className="flex items-start gap-2.5">
        <SeverityIcon severity={issue.severity} className="mt-0.5 shrink-0" />
        <div className="min-w-0 space-y-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">
              {SEVERITY_LABEL[issue.severity]} · {issue.category}
            </p>
            <p className="mt-1 text-sm font-semibold leading-snug">
              {issue.title}
            </p>
          </div>
          <div className="rounded-md border border-border/70 bg-card/90 p-2.5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
              Keep this rewrite in view
            </p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-foreground">
              {issue.suggestion}
            </p>
          </div>
          {!isOpen ? (
            <p className="text-xs font-medium text-success">
              This issue is resolved. Reopen it from AI guidance to act on it
              again.
            </p>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Main component — the resume + AI guidance panel                     */
/* ------------------------------------------------------------------ */

export function ResumeQualityChecks() {
  const { push } = useToast();
  const candidate = getCandidate(1);
  const original = useMemo<ResumeDraft>(
    () => (candidate ? buildOriginalDraft(candidate) : EMPTY_RESUME),
    [candidate],
  );

  const [draft, setDraft] = useState<ResumeDraft>(original);
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [skillsEditing, setSkillsEditing] = useState(false);
  const [skillsDraft, setSkillsDraft] = useState<string>(
    () => original.skills.join(", "),
  );

  /** Anchor refs for each editable block on the resume so the AI panel
   *  can scroll-into-view when an issue is selected. */
  const blockRefs = useRef<Record<string, HTMLElement | null>>({});
  const setBlockRef = useCallback((key: string, el: HTMLElement | null) => {
    blockRefs.current[key] = el;
  }, []);
  const focusBlock = useCallback((field: IssueField) => {
    const el = blockRefs.current[fieldKey(field)];
    if (!el) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "center",
    });
    el.focus({ preventScroll: true });
  }, []);

  /** Skills: dual view — chip list for read-only display, textarea for
   *  editing. We sync the textarea string explicitly when chips change. */
  const syncSkillsText = useCallback((next: ResumeDraft) => {
    setSkillsDraft(next.skills.join(", "));
  }, []);

  /** Open vs resolved issues — re-evaluated every render so typing
   *  addresses issues in real time. */
  const issuesByStatus = useMemo(() => {
    const open: Issue[] = [];
    const resolved: Issue[] = [];
    for (const issue of ISSUES) {
      if (dismissedIds.includes(issue.id) || isIssueResolved(issue, draft, original)) {
        resolved.push(issue);
      } else {
        open.push(issue);
      }
    }
    return { open, resolved };
  }, [draft, dismissedIds, original]);

  const activeIssue = useMemo(
    () =>
      activeIssueId
        ? ISSUES.find((issue) => issue.id === activeIssueId)
        : undefined,
    [activeIssueId],
  );

  const byCategory = useMemo(() => {
    const map = new Map<IssueCategory, number>();
    for (const issue of issuesByStatus.open) {
      map.set(issue.category, (map.get(issue.category) ?? 0) + 1);
    }
    return map;
  }, [issuesByStatus]);

  const firstOpenIssue = useMemo(() => ISSUES.find((issue) =>
    issuesByStatus.open.some((open) => open.id === issue.id),
  ), [issuesByStatus]);
  void firstOpenIssue;

  /** Highlight spans, indexed by editable field, ready to drop into
   *  `EditableText`. Phrase-level issues whose `matchText` is present in
   *  the current draft show up immediately; once the user removes the
   *  phrase the highlight disappears, no manual sync required. */
  const summaryHighlights = useMemo<HighlightSpan[]>(
    () =>
      issuesByStatus.open
        .filter(
          (issue) =>
            issue.field.kind === "summary" &&
            issue.matchText &&
            draft.summary.includes(issue.matchText),
        )
        .map((issue) => ({
          issueId: issue.id,
          matchText: issue.matchText as string,
          severity: issue.severity,
          isActive: issue.id === activeIssueId,
        })),
    [issuesByStatus, draft.summary, activeIssueId],
  );

  const titleHighlights = useMemo<HighlightSpan[]>(
    () =>
      issuesByStatus.open
        .filter(
          (issue) =>
            issue.field.kind === "title" &&
            issue.matchText &&
            draft.title.includes(issue.matchText),
        )
        .map((issue) => ({
          issueId: issue.id,
          matchText: issue.matchText as string,
          severity: issue.severity,
          isActive: issue.id === activeIssueId,
        })),
    [issuesByStatus, draft.title, activeIssueId],
  );

  const nameHighlights = useMemo<HighlightSpan[]>(
    () =>
      issuesByStatus.open
        .filter(
          (issue) =>
            issue.field.kind === "name" &&
            issue.matchText &&
            draft.name.includes(issue.matchText),
        )
        .map((issue) => ({
          issueId: issue.id,
          matchText: issue.matchText as string,
          severity: issue.severity,
          isActive: issue.id === activeIssueId,
        })),
    [issuesByStatus, draft.name, activeIssueId],
  );

  const skillsHighlights = useMemo<HighlightSpan[]>(
    () =>
      issuesByStatus.open
        .filter(
          (issue) =>
            issue.field.kind === "skills" &&
            issue.matchText &&
            draft.skills.some((skill) =>
              skill.toLowerCase().includes(issue.matchText!.toLowerCase()),
            ),
        )
        .map((issue) => ({
          issueId: issue.id,
          matchText: issue.matchText as string,
          severity: issue.severity,
          isActive: issue.id === activeIssueId,
        })),
    [issuesByStatus, draft.skills, activeIssueId],
  );

  const experienceHighlights = useMemo<
    Record<number, HighlightSpan[]>
  >(() => {
    const map: Record<number, HighlightSpan[]> = {};
    for (const exp of draft.experience) {
      map[exp.id] = issuesByStatus.open
        .filter(
          (issue) =>
            issue.field.kind === "experience" &&
            issue.field.experienceId === exp.id &&
            issue.matchText &&
            exp.description.includes(issue.matchText),
        )
        .map((issue) => ({
          issueId: issue.id,
          matchText: issue.matchText as string,
          severity: issue.severity,
          isActive: issue.id === activeIssueId,
        }));
    }
    return map;
  }, [issuesByStatus, draft.experience, activeIssueId]);

  const projectHighlights = useMemo<Record<number, HighlightSpan[]>>(() => {
    const map: Record<number, HighlightSpan[]> = {};
    for (const proj of draft.projects) {
      map[proj.id] = issuesByStatus.open
        .filter(
          (issue) =>
            issue.field.kind === "project" &&
            issue.field.projectId === proj.id &&
            issue.matchText &&
            proj.description.includes(issue.matchText),
        )
        .map((issue) => ({
          issueId: issue.id,
          matchText: issue.matchText as string,
          severity: issue.severity,
          isActive: issue.id === activeIssueId,
        }));
    }
    return map;
  }, [issuesByStatus, draft.projects, activeIssueId]);


  const hasChanges = !isSameDraft(draft, original);

  /* ---------------- mutation helpers ---------------- */

  const updateField = useCallback(
    <K extends keyof ResumeDraft>(key: K, value: ResumeDraft[K]) => {
      setDraft((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const updateExperience = useCallback(
    (
      id: number,
      patch: Partial<ResumeDraft["experience"][number]>,
    ) => {
      setDraft((current) => ({
        ...current,
        experience: current.experience.map((exp) =>
          exp.id === id ? { ...exp, ...patch } : exp,
        ),
      }));
    },
    [],
  );

  const updateEducation = useCallback(
    (
      id: number,
      patch: Partial<ResumeDraft["education"][number]>,
    ) => {
      setDraft((current) => ({
        ...current,
        education: current.education.map((edu) =>
          edu.id === id ? { ...edu, ...patch } : edu,
        ),
      }));
    },
    [],
  );

  const updateProject = useCallback(
    (
      id: number,
      patch: Partial<ResumeDraft["projects"][number]>,
    ) => {
      setDraft((current) => ({
        ...current,
        projects: current.projects.map((proj) =>
          proj.id === id ? { ...proj, ...patch } : proj,
        ),
      }));
    },
    [],
  );

  const applySuggestion = useCallback(
    (issue: Issue) => {
      setDraft((current) => {
        const next = setFieldText(current, issue.field, issue.suggestion);
        if (issue.field.kind === "skills") syncSkillsText(next);
        return next;
      });
      setDismissedIds((current) =>
        current.filter((id) => id !== issue.id),
      );
      push({
        title: "Suggestion applied",
        description: issue.title,
        tone: "success",
      });
    },
    [push, syncSkillsText],
  );

  const dismissIssue = useCallback(
    (issue: Issue) => {
      setDismissedIds((current) =>
        current.includes(issue.id) ? current : [...current, issue.id],
      );
      push({
        title: "Issue dismissed",
        description: issue.title,
        tone: "info",
      });
    },
    [push],
  );

  const reopenIssue = useCallback(
    (issue: Issue) => {
      const wasDismissed = dismissedIds.includes(issue.id);
      const shouldUndoEdit =
        !wasDismissed && isIssueResolved(issue, draft, original);

      if (shouldUndoEdit) {
        const originalValue = getOriginalFieldText(original, issue.field);
        setDraft((current) =>
          setFieldText(current, issue.field, originalValue),
        );
        if (issue.field.kind === "skills") {
          setSkillsDraft(originalValue);
        }
      }

      setDismissedIds((current) =>
        current.filter((id) => id !== issue.id),
      );
      push({
        title: shouldUndoEdit ? "Edit undone" : "Issue reopened",
        description: shouldUndoEdit
          ? `${issue.title} was restored to its original field text.`
          : issue.title,
        tone: "info",
      });
    },
    [dismissedIds, draft, original, push],
  );

  const resetAll = useCallback(() => {
    setDraft(original);
    syncSkillsText(original);
    setDismissedIds([]);
    push({
      title: "Resume reset",
      description: "All edits reverted to the original master_v3.",
      tone: "info",
    });
  }, [original, push, syncSkillsText]);

  /* ---------------- skills edit helpers ---------------- */

  const commitSkills = useCallback(
    (next: string) => {
      const parsed = next
        .split(/[,\n]/)
        .map((part) => part.trim())
        .filter(Boolean);
      setDraft((current) => ({ ...current, skills: parsed }));
      setSkillsDraft(parsed.join(", "));
      setSkillsEditing(false);
    },
    [],
  );

  const removeSkill = useCallback(
    (index: number) => {
      setDraft((current) => {
        const nextSkills = current.skills.filter((_, i) => i !== index);
        setSkillsDraft(nextSkills.join(", "));
        return { ...current, skills: nextSkills };
      });
    },
    [],
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const active = document.activeElement;
      if (
        active instanceof HTMLElement &&
        ["INPUT", "TEXTAREA"].includes(active.tagName)
      ) {
        return;
      }
      setActiveIssueId((current) => (current ? null : current));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!activeIssueId) return;
    const onPointerDown = (event: MouseEvent) => {
      if (event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      // Leave the candidate shell's top navigation alone — it's a separate
      // chrome region and reuses the screen space for nav/theme/profile.
      if (target.closest("[data-candidate-shell-header='true']")) return;
      if (
        target.closest(
          "button, a, input, textarea, select, [role='button'], [role='link'], mark, [contenteditable='true'], [data-no-clear]",
        )
      ) {
        return;
      }
      const fieldAnchor = target.closest("[data-field-anchor]");
      if (fieldAnchor) return;
      setActiveIssueId(null);
    };
    document.addEventListener("mousedown", onPointerDown, true);
    return () => document.removeEventListener("mousedown", onPointerDown, true);
  }, [activeIssueId]);

  const handleContainerClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!activeIssueId) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest(
        "button, a, input, textarea, [role='button'], mark, [contenteditable='true'], [data-no-clear]",
      );
      if (interactive) return;
      if (target.closest("[data-clear-active-issue]")) {
        setActiveIssueId(null);
        return;
      }
      setActiveIssueId(null);
    },
    [activeIssueId],
  );

  const handleContainerMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      // Document-level capture already handles the unselect logic; we keep
      // this stub only to swallow the React-bound prop without duplicating
      // the work.
      void event;
    },
    [],
  );

  if (!candidate) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No resume data available.
        </CardContent>
      </Card>
    );
  }

  /* ---------------- render ---------------- */

  const activeIsOpen = activeIssue
    ? issuesByStatus.open.some((issue) => issue.id === activeIssue.id)
    : false;
  const activeFieldKey = activeIssue ? fieldKey(activeIssue.field) : null;
  const activeFieldLabel = activeIssue
    ? getFieldLabel(draft, activeIssue.field)
    : "";
  const isActiveField = (field: IssueField) =>
    activeFieldKey !== null && fieldKey(field) === activeFieldKey;
  const fieldContainerClass = (field: IssueField) =>
    cn(
      "scroll-mt-24 rounded-md outline-none transition-[background-color,box-shadow]",
      activeIssue && isActiveField(field)
        ? SEVERITY_FIELD[activeIssue.severity]
        : null,
    );
  const fieldAnchorAttr = (field: IssueField) =>
    activeIssue && isActiveField(field) ? fieldKey(field) : undefined;
  const renderFieldReference = (field: IssueField) =>
    activeIssue && isActiveField(field) ? (
      <FieldIssueReference issue={activeIssue} isOpen={activeIsOpen} />
    ) : null;

  return (
    <div
      ref={containerRef}
      onClickCapture={handleContainerClick}
      onMouseDownCapture={handleContainerMouseDown}
      data-clear-active-issue
      className="space-y-6"
    >
      {/* Header strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-primary/40 bg-card text-foreground hover:bg-accent-soft hover:text-primary"
        >
          <Link href="/candidate/resume">
            <ArrowLeft aria-hidden />
            Back to resume
          </Link>
        </Button>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Resume editor &amp; quality checks
        </p>
        <Badge variant="secondary">
          {issuesByStatus.open.length} of {ISSUES.length} open
        </Badge>
      </div>

      {/* AI report summary */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-10 w-10 items-center justify-center rounded-md bg-highlight-soft text-highlight-foreground"
            >
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">
                AI quality report · master_v3.pdf
              </p>
              <p className="text-xs text-muted-foreground">
                Edit the resume below — or tap an AI suggestion to apply it
                instantly. Issues clear automatically when you address them.
              </p>
            </div>
          </div>
          <ul className="flex flex-wrap items-center gap-3 text-xs">
            {(["critical", "warning", "info"] as const).map((severity) => (
              <li key={severity} className="flex items-center gap-1.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-md border border-border/70 bg-card">
                  <SeverityIcon severity={severity} className="h-3.5 w-3.5" />
                </span>
                {SEVERITY_LABEL[severity]}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <p className="sr-only" aria-live="polite">
        {activeIssue
          ? `${activeFieldLabel} selected for ${SEVERITY_LABEL[activeIssue.severity].toLowerCase()} guidance: ${activeIssue.title}.`
          : "No issue selected."}
      </p>

      <div
        ref={containerRef}
        onClickCapture={handleContainerClick}
        onMouseDownCapture={handleContainerMouseDown}
        data-clear-active-issue
        className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,0.85fr)]"
      >
        {/* Live resume — the user sees what they're submitting. */}
        <Card className="overflow-hidden">
        <CardContent className="p-0">
          <article
            aria-label="Live editable resume preview"
            className="mx-auto w-full max-w-3xl space-y-7 bg-card p-8 md:p-12"
          >
            {/* Header block */}
            <header className="space-y-1.5">
              <div
                ref={(el) => setBlockRef(fieldKey({ kind: "name" }), el)}
                data-field-anchor={fieldAnchorAttr({ kind: "name" })}
                tabIndex={-1}
                className={fieldContainerClass({ kind: "name" })}
              >
                {renderFieldReference({ kind: "name" })}
                <EditableText
                  as="h1"
                  value={draft.name}
                  onCommit={(value) => updateField("name", value)}
                  label="Full name"
                  className="-m-2 block w-full rounded-md p-2 text-3xl font-semibold tracking-tight hover:bg-accent-soft/30"
                  placeholder="Your name"
                  highlights={nameHighlights}
                  onHighlightClick={setActiveIssueId}
                />
              </div>
              <div
                ref={(el) => setBlockRef(fieldKey({ kind: "title" }), el)}
                data-field-anchor={fieldAnchorAttr({ kind: "title" })}
                tabIndex={-1}
                className={fieldContainerClass({ kind: "title" })}
              >
                {renderFieldReference({ kind: "title" })}
                <EditableText
                  as="p"
                  value={draft.title}
                  onCommit={(value) => updateField("title", value)}
                  label="Headline"
                  className="-m-2 block w-full rounded-md p-2 text-lg text-muted-foreground hover:bg-accent-soft/30"
                  placeholder="Headline (e.g. Senior Frontend Developer)"
                  highlights={titleHighlights}
                  onHighlightClick={setActiveIssueId}
                />
              </div>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                <EditableText
                  as="span"
                  value={draft.location}
                  onCommit={(value) => updateField("location", value)}
                  label="Location"
                  placeholder="Location"
                />
                <span aria-hidden>·</span>
                <EditableText
                  as="span"
                  value={draft.email}
                  onCommit={(value) => updateField("email", value)}
                  label="Email"
                  placeholder="Email"
                />
                <span aria-hidden>·</span>
                <EditableText
                  as="span"
                  value={draft.phone}
                  onCommit={(value) => updateField("phone", value)}
                  label="Phone"
                  placeholder="Phone"
                />
              </p>
            </header>

            <Separator />

            {/* Summary */}
            <section
              ref={(el) => setBlockRef(fieldKey({ kind: "summary" }), el)}
              data-field-anchor={fieldAnchorAttr({ kind: "summary" })}
              tabIndex={-1}
              className={cn(
                "space-y-2",
                fieldContainerClass({ kind: "summary" }),
              )}
            >
              {renderFieldReference({ kind: "summary" })}
              <SectionEyebrow>Summary</SectionEyebrow>
              <EditableText
                as="p"
                multiline
                value={draft.summary}
                onCommit={(value) => updateField("summary", value)}
                label="Summary"
                placeholder="Add a 1-2 sentence summary"
                className="-m-2 block w-full rounded-md p-2 text-base leading-relaxed hover:bg-accent-soft/30"
                highlights={summaryHighlights}
                onHighlightClick={setActiveIssueId}
              />
            </section>

            <Separator />

            {/* Experience */}
            <section className="space-y-4">
              <SectionEyebrow>Experience</SectionEyebrow>
              {draft.experience.map((exp) => (
                <div
                  key={exp.id}
                  ref={(el) =>
                    setBlockRef(
                      fieldKey({ kind: "experience", experienceId: exp.id }),
                      el,
                    )
                  }
                  data-field-anchor={fieldAnchorAttr({
                    kind: "experience",
                    experienceId: exp.id,
                  })}
                  tabIndex={-1}
                  className={cn(
                    "space-y-2",
                    fieldContainerClass({
                      kind: "experience",
                      experienceId: exp.id,
                    }),
                  )}
                >
                  {renderFieldReference({
                    kind: "experience",
                    experienceId: exp.id,
                  })}
                  <EditableText
                    as="p"
                    value={`${exp.role} · ${exp.company}`}
                    onCommit={(value) => {
                      const [role, ...rest] = value.split(" · ");
                      updateExperience(exp.id, {
                        role: role ?? exp.role,
                        company: rest.join(" · ") || exp.company,
                      });
                    }}
                    label={`Role at ${exp.company}`}
                    className="block w-full bg-transparent text-base font-semibold"
                    placeholder="Role · Company"
                  />
                  <EditableText
                    as="p"
                    value={exp.period}
                    onCommit={(value) =>
                      updateExperience(exp.id, { period: value })
                    }
                    label="Period"
                    className="block w-full bg-transparent text-xs text-muted-foreground"
                    placeholder="Jan 2024 — present"
                  />
                  <EditableText
                    as="p"
                    multiline
                    value={exp.description}
                    onCommit={(value) =>
                      updateExperience(exp.id, { description: value })
                    }
                    label={`${exp.company} description`}
                    placeholder="Add the contribution statement"
                    className="-m-2 block w-full rounded-md p-2 text-base leading-relaxed hover:bg-accent-soft/30"
                    highlights={experienceHighlights[exp.id]}
                    onHighlightClick={setActiveIssueId}
                  />
                </div>
              ))}
            </section>

            <Separator />

            {/* Skills */}
            <section
              ref={(el) => setBlockRef(fieldKey({ kind: "skills" }), el)}
              data-field-anchor={fieldAnchorAttr({ kind: "skills" })}
              tabIndex={-1}
              className={cn(
                "space-y-2",
                fieldContainerClass({ kind: "skills" }),
              )}
            >
              {renderFieldReference({ kind: "skills" })}
              <SectionEyebrow>Skills</SectionEyebrow>
              <div className="rounded-md outline-none transition-colors hover:bg-accent-soft/30 focus-within:bg-accent-soft/30">
                {skillsEditing ? (
                  <Textarea
                    autoFocus
                    value={skillsDraft}
                    onChange={(event) => setSkillsDraft(event.target.value)}
                    onBlur={() => commitSkills(skillsDraft)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setSkillsDraft(draft.skills.join(", "));
                        setSkillsEditing(false);
                      }
                      if (
                        event.key === "Enter" &&
                        (event.ctrlKey || event.metaKey)
                      ) {
                        commitSkills(skillsDraft);
                      }
                    }}
                    aria-label="Skills"
                    rows={2}
                    placeholder="Comma-separated skills, e.g. TypeScript, React, Next.js"
                    className="text-base leading-relaxed"
                  />
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSkillsDraft(draft.skills.join(", "));
                      setSkillsEditing(true);
                    }}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSkillsDraft(draft.skills.join(", "));
                        setSkillsEditing(true);
                      }
                    }}
                    className="-m-1 block w-full cursor-text rounded p-1 text-left text-base leading-relaxed outline-none hover:bg-accent-soft/40 focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Edit skills"
                  >
                    {draft.skills.length > 0 ? (
                      <ul className="flex flex-wrap gap-2">
                        {draft.skills.map((skill, index) => {
                          const matchedSkillIssue = skillsHighlights.find(
                            (highlight) =>
                              skill
                                .toLowerCase()
                                .includes(
                                  highlight.matchText.toLowerCase(),
                                ),
                          );
                          return (
                            <li
                              key={`${skill}-${index}`}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-md border bg-card px-2.5 py-1 text-sm",
                                matchedSkillIssue
                                  ? cn(
                                      "cursor-pointer",
                                      SEVERITY_HIGHLIGHT[
                                        matchedSkillIssue.severity
                                      ],
                                      matchedSkillIssue.isActive
                                        ? "outline outline-2 outline-offset-2"
                                        : null,
                                    )
                                  : null,
                              )}
                              onClick={(event) => {
                                if (matchedSkillIssue) {
                                  event.stopPropagation();
                                  setActiveIssueId(matchedSkillIssue.issueId);
                                }
                              }}
                            >
                              <span>{skill}</span>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  removeSkill(index);
                                }}
                                className="text-muted-foreground transition-colors hover:text-destructive"
                                aria-label={`Remove ${skill}`}
                              >
                                <X aria-hidden className="h-3 w-3" />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <span className="italic text-muted-foreground">
                        Click to add skills…
                      </span>
                    )}
                  </div>
                )}
              </div>
            </section>

            <Separator />

            {/* Education */}
            <section className="space-y-3">
              <SectionEyebrow>Education</SectionEyebrow>
              {draft.education.map((edu) => (
                <div key={edu.id} className="space-y-1">
                  <EditableText
                    as="p"
                    value={edu.qualification}
                    onCommit={(value) =>
                      updateEducation(edu.id, { qualification: value })
                    }
                    label="Qualification"
                    className="block w-full bg-transparent text-base font-semibold"
                    placeholder="Qualification"
                  />
                  <EditableText
                    as="p"
                    value={`${edu.institution} · ${edu.period}`}
                    onCommit={(value) => {
                      const [institution, ...rest] = value.split(" · ");
                      updateEducation(edu.id, {
                        institution: institution ?? edu.institution,
                        period: rest.join(" · ") || edu.period,
                      });
                    }}
                    label="Institution and period"
                    className="block w-full bg-transparent text-sm text-muted-foreground"
                    placeholder="Institution · period"
                  />
                </div>
              ))}
            </section>

            <Separator />

            {/* Projects */}
            <section className="space-y-4">
              <SectionEyebrow>Projects</SectionEyebrow>
              {draft.projects.map((proj) => (
                <div
                  key={proj.id}
                  ref={(el) =>
                    setBlockRef(
                      fieldKey({ kind: "project", projectId: proj.id }),
                      el,
                    )
                  }
                  data-field-anchor={fieldAnchorAttr({
                    kind: "project",
                    projectId: proj.id,
                  })}
                  tabIndex={-1}
                  className={cn(
                    "space-y-2",
                    fieldContainerClass({
                      kind: "project",
                      projectId: proj.id,
                    }),
                  )}
                >
                  {renderFieldReference({
                    kind: "project",
                    projectId: proj.id,
                  })}
                  <EditableText
                    as="p"
                    value={proj.name}
                    onCommit={(value) =>
                      updateProject(proj.id, { name: value })
                    }
                    label="Project name"
                    className="block w-full bg-transparent text-base font-semibold"
                    placeholder="Project name"
                  />
                  <EditableText
                    as="p"
                    multiline
                    value={proj.description}
                    onCommit={(value) =>
                      updateProject(proj.id, { description: value })
                    }
                    label={`${proj.name} description`}
                    placeholder="Add the project description"
                    className="-m-2 block w-full rounded-md p-2 text-base leading-relaxed hover:bg-accent-soft/30"
                    highlights={projectHighlights[proj.id]}
                    onHighlightClick={setActiveIssueId}
                  />
                  <div className="flex min-w-0 items-start gap-1.5 text-xs text-muted-foreground">
                    <span className="shrink-0 py-1 font-semibold uppercase tracking-[0.18em]">
                      Stack
                    </span>
                    <span aria-hidden className="py-1">
                      ·
                    </span>
                    <EditableText
                      as="span"
                      value={proj.skills.join(", ")}
                      onCommit={(value) =>
                        updateProject(proj.id, {
                          skills: parseTechnologyList(value),
                        })
                      }
                      label={`${proj.name} stack`}
                      className="min-w-0 flex-1 px-1 py-1 text-xs text-muted-foreground"
                      placeholder="Add technologies"
                    />
                  </div>
                </div>
              ))}
            </section>

            <Separator />

            {/* Footer status */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <PencilLine aria-hidden className="h-4 w-4" />
                {hasChanges
                  ? "Edits apply live — the resume preview reflects them as you type."
                  : "No edits yet — the resume matches the original."}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetAll}
                disabled={!hasChanges && dismissedIds.length === 0}
              >
                <RotateCcw aria-hidden />
                Reset to original
              </Button>
            </div>
          </article>
        </CardContent>
      </Card>

      {/* AI guidance */}
      <section className="space-y-3 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto xl:overscroll-contain xl:pr-1">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2 text-base">
                <Sparkles aria-hidden className="h-4 w-4" />
                AI guidance
              </h2>
            </CardTitle>
            <CardDescription>
              Select an issue to inspect it. Use Review beside field when you
              want to edit with the recommendation kept in view.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected issue */}
            {activeIssue ? (
              <div
                className={cn(
                  "overflow-hidden rounded-lg border border-l-4",
                  SEVERITY_SURFACE[activeIssue.severity],
                )}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/70 bg-card/90 shadow-sm">
                        <SeverityIcon severity={activeIssue.severity} />
                      </span>
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={SEVERITY_BADGE[activeIssue.severity]}
                          >
                            {SEVERITY_LABEL[activeIssue.severity]}
                          </Badge>
                          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">
                            {activeIssue.category}
                          </span>
                        </div>
                        <p className="text-base font-semibold leading-snug text-foreground">
                          {activeIssue.title}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline">{activeFieldLabel}</Badge>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Unselect issue"
                        title="Unselect issue"
                        onClick={() => setActiveIssueId(null)}
                      >
                        <X aria-hidden />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-border/60 pt-4">
                    <p className="text-sm leading-relaxed text-foreground">
                      {activeIssue.detail}
                    </p>
                  </div>

                  <div className="mt-4 rounded-md border border-border/80 bg-card/95 p-3.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Wand2
                        aria-hidden
                        className="h-4 w-4 text-highlight"
                      />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                        Recommended rewrite
                      </p>
                    </div>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">
                      {activeIssue.suggestion}
                    </p>
                  </div>

                  {activeIssue.rationale ? (
                    <div className="mt-3 border-t border-border/60 pt-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                        Why this helps
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-foreground">
                        {activeIssue.rationale}
                      </p>
                    </div>
                  ) : null}

                  {activeIsOpen ? (
                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <Button
                        type="button"
                        size="sm"
                        variant={
                          activeIssue.severity === "critical"
                            ? "destructive"
                            : "default"
                        }
                        className="w-full"
                        onClick={() => applySuggestion(activeIssue)}
                      >
                        <Wand2 aria-hidden />
                        Apply suggestion
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => focusBlock(activeIssue.field)}
                      >
                        <Eye aria-hidden />
                        Review beside field
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="w-full border border-border bg-card/80 text-text-secondary hover:border-warning/60 hover:bg-warning/10 hover:text-foreground focus-visible:ring-warning/60"
                        onClick={() => dismissIssue(activeIssue)}
                      >
                        <X aria-hidden />
                        Dismiss
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-3 sm:flex-row sm:items-center xl:flex-col xl:items-stretch 2xl:flex-row 2xl:items-center">
                      <Badge variant="secondary" className="w-fit">
                        {dismissedIds.includes(activeIssue.id)
                          ? "Dismissed"
                          : "Resolved by your edit"}
                      </Badge>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => reopenIssue(activeIssue)}
                      >
                        <RotateCcw aria-hidden />
                        {dismissedIds.includes(activeIssue.id)
                          ? "Reopen"
                          : "Undo edit & reopen"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border/60 bg-surface-tint/40 p-6 text-center">
                <p className="text-sm font-semibold text-foreground">
                  No issue selected
                </p>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  Tap any issue below, or an inline highlight in the resume, to inspect
                  the suggested rewrite. Press{" "}
                  <kbd className="rounded border border-border/70 bg-card px-1.5 py-0.5 font-mono text-[10px]">
                    Esc
                  </kbd>{" "}
                  to unselect.
                </p>
              </div>
            )}

            {/* Issue list and open-category summary */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-1">
              <div className="md:col-span-2 xl:col-span-1">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  All issues
                </p>
                <div className="space-y-1.5">
                  {ISSUES.map((issue) => {
                    const isOpen = issuesByStatus.open.some(
                      (i) => i.id === issue.id,
                    );
                    const isActive = issue.id === activeIssueId;
                    return (
                      <button
                        key={issue.id}
                        type="button"
                        onClick={() =>
                          setActiveIssueId((current) =>
                            current === issue.id ? null : issue.id,
                          )
                        }
                        aria-pressed={isActive}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-md border border-l-4 p-3 text-left transition-[background-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          isOpen
                            ? SEVERITY_SURFACE[issue.severity]
                            : "border-success/40 border-l-success bg-success/5",
                          isActive ? "ring-2 ring-ring ring-offset-2" : null,
                          !isActive && isOpen
                            ? "hover:bg-card/80"
                            : null,
                          !isOpen ? "opacity-70 hover:opacity-100" : null,
                        )}
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/70 bg-card/90">
                          {isOpen ? (
                            <SeverityIcon severity={issue.severity} />
                          ) : (
                            <CheckCircle2
                              aria-hidden
                              className="h-4 w-4 text-success"
                            />
                          )}
                        </span>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-semibold leading-snug">
                            {!isOpen ? (
                              <span className="text-success">
                                Resolved ·{" "}
                              </span>
                            ) : null}
                            {issue.title}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {issue.category} ·{" "}
                            {SEVERITY_LABEL[issue.severity]}
                          </p>
                          {isOpen &&
                          getResolutionProgress(
                            issue,
                            draft,
                            original,
                          ) >= 0.6 ? (
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-warning">
                              Partial · keep going
                            </p>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  By category
                </p>
                {Array.from(byCategory.entries()).map(([category, count]) => (
                  <div
                    key={category}
                    className="mb-1.5 flex items-center justify-between rounded-md border bg-card p-2.5"
                  >
                    <p className="text-xs font-medium">{category}</p>
                    <Badge variant="outline">{count} open</Badge>
                  </div>
                ))}
                {byCategory.size === 0 ? (
                  <p className="rounded-md border border-success/40 bg-success/10 p-2.5 text-xs text-success-foreground">
                    All clear — every issue has been addressed.
                  </p>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      </div>
    </div>
  );
}
