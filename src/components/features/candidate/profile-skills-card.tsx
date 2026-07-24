"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

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

type ProfileSkillsCardProps = {
  skills: string[];
  onChange: (next: string[]) => void;
};

export function ProfileSkillsCard({ skills, onChange }: ProfileSkillsCardProps) {
  const { push } = useToast();
  const [draft, setDraft] = useState("");
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);

  function addSkill() {
    const value = draft.trim();
    if (!value) return;
    if (skills.includes(value)) {
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
    push({
      title: "Skill added",
      description: value,
      tone: "success",
    });
  }

  function removeSkill(skill: string) {
    onChange(skills.filter((s) => s !== skill));
    push({
      title: "Skill removed",
      description: skill,
      tone: "info",
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
            Used to inform your match scores on every job.
          </CardDescription>
        </div>
        <Badge variant="secondary">{skills.length} listed</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {skills.map((skill) => (
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
          {skills.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No skills yet — add one below.
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
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
