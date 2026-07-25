"use client";

import { useRef, useState } from "react";
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
import type { Skill } from "@/types/candidate";

type ProfileSkillsCardProps = {
  skills: Skill[];
  /** Parser suggestions detected from the candidate's own prose. */
  suggestions: DetectedSkill[];
  onChange: (next: Skill[]) => void;
  onAcceptSkills: (skills: string[]) => void;
  onDismissSuggestion: (skill: string) => void;
};

export function ProfileSkillsCard({
  skills,
  suggestions,
  onChange,
  onAcceptSkills,
  onDismissSuggestion,
}: ProfileSkillsCardProps) {
  const { push } = useToast();
  const [draft, setDraft] = useState("");
  const [pendingRemove, setPendingRemove] = useState<Skill | null>(null);
  const [pendingVerifiedRemove, setPendingVerifiedRemove] = useState<
    Skill | null
  >(null);

  // Mint new ids monotonically above the largest existing id so re-adds
  // never collide with persisted records.
  const counterRef = useRef(Math.max(0, ...skills.map((s) => s.id), 1000));

  // Verification is now part of each Skill's own status — no separate
  // "verified skills" projection needed.
  const verified = skills.filter((s) => s.status === "Verified");
  const selfReported = skills.filter((s) => s.status !== "Verified");

  function addSkill() {
    const value = draft.trim();
    if (!value) return;
    const key = normalize(value);
    const existing = skills.find((s) => normalize(s.name) === key);
    if (existing) {
      setDraft("");
      if (existing.status === "Verified") {
        push({
          title: "Already verified",
          description: `${value} is confirmed by your university.`,
          tone: "info",
        });
      } else {
        push({
          title: "Already in your list",
          description: `${value} is already on your skills.`,
          tone: "info",
        });
      }
      return;
    }
    counterRef.current += 1;
    const next: Skill = {
      id: counterRef.current,
      name: value,
      status: "Not started",
    };
    onChange([...skills, next]);
    setDraft("");
    push({ title: "Skill added", description: value, tone: "success" });
  }

  function removeSkill(skill: Skill) {
    onChange(skills.filter((s) => s.id !== skill.id));
    push({ title: "Skill removed", description: skill.name, tone: "info" });
  }

  function removeVerifiedSkill(skill: Skill) {
    onChange(skills.filter((s) => s.id !== skill.id));
    push({
      title: "Verified skill removed",
      description: `${skill.name} needs to be re-verified by your university before it counts toward match scores again.`,
      tone: "info",
    });
  }

  // Clear the other dialog if a request comes in for one of them, so
  // only one confirm dialog is ever visible at a time.
  function requestRemoveSelf(skill: Skill) {
    setPendingVerifiedRemove(null);
    setPendingRemove(skill);
  }
  function requestRemoveVerified(skill: Skill) {
    setPendingRemove(null);
    setPendingVerifiedRemove(skill);
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
      <CardHeader>
        <CardTitle>
          <h2>Skills and capabilities</h2>
        </CardTitle>
        <CardDescription>
          University-verified skills carry the most weight with employers and
          inform your match scores on every job.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* University-verified — authoritative, but the candidate can
            opt out (re-verification then becomes required). */}
        {verified.length > 0 ? (
          <section aria-label="University-verified skills" className="space-y-2">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-foreground" aria-hidden />
              University verified
            </p>
            <div className="flex flex-wrap gap-2">
              {verified.map((skill) => (
                <Badge
                  key={skill.id}
                  variant="secondary"
                  className="gap-1 pr-1 hover:bg-secondary"
                >
                  <ShieldCheck className="h-3 w-3" aria-hidden />
                  {skill.name}
                  <button
                    type="button"
                    onClick={() => requestRemoveVerified(skill)}
                    aria-label={`Remove verified skill ${skill.name}`}
                    className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-foreground/10 text-foreground/80 transition-colors hover:bg-destructive hover:text-destructive-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                  </button>
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
              <Badge key={skill.id} variant="outline" className="gap-1 pr-1">
                {skill.name}
                <button
                  type="button"
                  onClick={() => requestRemoveSelf(skill)}
                  aria-label={`Remove ${skill.name}`}
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
        title={`Remove ${pendingRemove?.name ?? ""} from your skills?`}
        description="This skill will no longer count toward your match scores. You can add it back later."
        confirmLabel="Remove skill"
        destructive
        onConfirm={() => {
          if (pendingRemove) removeSkill(pendingRemove);
          setPendingRemove(null);
        }}
      />
      <ConfirmDialog
        open={pendingVerifiedRemove !== null}
        onOpenChange={(open) => !open && setPendingVerifiedRemove(null)}
        title={`Remove verified skill ${pendingVerifiedRemove?.name ?? ""}?`}
        description={
          <>
            Removing a verified skill drops it from your match scores immediately.
            To restore it, you'll need to <strong>re-add</strong> the skill and have
            your <strong>university re-verify</strong> it before it counts again.
          </>
        }
        confirmLabel="Remove verified skill"
        destructive
        onConfirm={() => {
          if (pendingVerifiedRemove) removeVerifiedSkill(pendingVerifiedRemove);
          setPendingVerifiedRemove(null);
        }}
      />
    </Card>
  );
}
