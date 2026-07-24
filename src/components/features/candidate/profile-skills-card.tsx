"use client";

import { useState } from "react";
import { Plus, Sparkles, ShieldCheck, X } from "lucide-react";

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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { normalize } from "@/components/features/candidate/credential-derivations";
import type { DetectedSkill } from "@/components/features/candidate/skill-parser";

type ProfileSkillsCardProps = {
  skills: string[];
  /** Skills backed by a verified university credential — shown first, locked. */
  verifiedSkills: string[];
  /** Parser suggestions detected from the candidate's own prose. */
  suggestions: DetectedSkill[];
  onChange: (next: string[]) => void;
  onAcceptSkills: (skills: string[]) => void;
  onDismissSuggestion: (skill: string) => void;
};

export function ProfileSkillsCard({
  skills,
  verifiedSkills,
  suggestions,
  onChange,
  onAcceptSkills,
  onDismissSuggestion,
}: ProfileSkillsCardProps) {
  const { push } = useToast();
  const [draft, setDraft] = useState("");
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);

  const verifiedKeys = new Set(verifiedSkills.map(normalize));
  // Self-reported = candidate skills that aren't already institution-verified.
  const selfReported = skills.filter((s) => !verifiedKeys.has(normalize(s)));
  const totalCount = verifiedSkills.length + selfReported.length;

  function addSkill() {
    const value = draft.trim();
    if (!value) return;
    const key = normalize(value);
    if (verifiedKeys.has(key)) {
      setDraft("");
      push({
        title: "Already verified",
        description: `${value} is confirmed by your university.`,
        tone: "info",
      });
      return;
    }
    if (skills.some((s) => normalize(s) === key)) {
      setDraft("");
      push({
        title: "Already in your list",
        description: `${value} is already on your skills.`,
        tone: "info",
      });
      return;
    }
    onChange([...skills, value]);
    setDraft("");
    push({ title: "Skill added", description: value, tone: "success" });
  }

  function removeSkill(skill: string) {
    onChange(skills.filter((s) => s !== skill));
    push({ title: "Skill removed", description: skill, tone: "info" });
  }

  function acceptAll() {
    if (suggestions.length === 0) return;
    onAcceptSkills(suggestions.map((s) => s.skill));
    push({
      title:
        suggestions.length === 1
          ? "1 skill added from your profile"
          : `${suggestions.length} skills added from your profile`,
      tone: "success",
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>
            <h2>Skills and capabilities</h2>
          </CardTitle>
          <CardDescription>
            University-verified skills carry the most weight with employers and
            inform your match scores on every job.
          </CardDescription>
        </div>
        <Badge variant="secondary" className="hover:bg-secondary">
          {totalCount} listed
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* University-verified — authoritative, cannot be removed here. */}
        {verifiedSkills.length > 0 ? (
          <section aria-label="University-verified skills" className="space-y-2">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-foreground" aria-hidden />
              University verified
            </p>
            <div className="flex flex-wrap gap-2">
              {verifiedSkills.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1 hover:bg-secondary">
                  <ShieldCheck className="h-3 w-3" aria-hidden />
                  {skill}
                </Badge>
              ))}
            </div>
          </section>
        ) : null}

        {/* Self-reported — removable. */}
        <section aria-label="Self-reported skills" className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Self-reported
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {selfReported.map((skill) => (
              <Badge key={skill} variant="outline" className="gap-1 pr-1">
                {skill}
                <button
                  type="button"
                  onClick={() => setPendingRemove(skill)}
                  aria-label={`Remove ${skill}`}
                  className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-foreground/10 text-foreground/80 transition-colors hover:bg-destructive hover:text-destructive-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                </button>
              </Badge>
            ))}
            {selfReported.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No self-reported skills yet — add one below.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            <label htmlFor="add-skill" className="sr-only">
              Add a skill
            </label>
            <Input
              id="add-skill"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="Add a skill (e.g. TypeScript)"
              className="flex-1"
            />
            <Button onClick={addSkill}>
              <Plus />
              Add skill
            </Button>
          </div>
        </section>

        {/* Detected from prose — deterministic parser suggestions. */}
        {suggestions.length > 0 ? (
          <section
            aria-label="Skills detected from your profile"
            className="space-y-3 rounded-lg border bg-surface-tint p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <Sparkles className="h-4 w-4" aria-hidden />
                Detected from your profile
              </p>
              <Button size="sm" variant="outline" onClick={acceptAll}>
                Add all
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              We parsed your summary, experience, and projects and structured
              these skills for you.
            </p>
            <ul
              role="list"
              className="flex flex-col gap-2"
              aria-live="polite"
            >
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.skill}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-card p-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{suggestion.skill}</p>
                    <p className="text-xs text-muted-foreground">
                      {suggestion.source}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      aria-label={`Add ${suggestion.skill} skill`}
                      onClick={() => {
                        onAcceptSkills([suggestion.skill]);
                        push({
                          title: "Skill added",
                          description: suggestion.skill,
                          tone: "success",
                        });
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden />
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Dismiss ${suggestion.skill} suggestion`}
                      onClick={() => onDismissSuggestion(suggestion.skill)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </CardContent>

      <ConfirmDialog
        open={pendingRemove !== null}
        onOpenChange={(open) => !open && setPendingRemove(null)}
        title={`Remove ${pendingRemove ?? ""} from your skills?`}
        description="This skill will no longer count toward your match scores. You can add it back later."
        confirmLabel="Remove skill"
        destructive
        onConfirm={() => {
          if (pendingRemove) removeSkill(pendingRemove);
          setPendingRemove(null);
        }}
      />
    </Card>
  );
}
