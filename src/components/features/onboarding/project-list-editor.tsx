"use client";

/**
 * ProjectListEditor — repeated entries with add/remove for candidate
 * projects during onboarding. Each project has name, description, and
 * skills (a small tag list). Records keep stable numeric IDs so React
 * list keys remain stable across edits; the IDs are minted client-side
 * via a monotonically increasing counter that survives re-renders.
 */

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CandidateProjectDraft } from "@/types/onboarding";

type ProjectListEditorProps = {
  /** Current project list — controlled. */
  value: CandidateProjectDraft[];
  onChange: (next: CandidateProjectDraft[]) => void;
};

export function ProjectListEditor({
  value,
  onChange,
}: ProjectListEditorProps) {
  // Mint a stable, monotonic ID each time we add a project. Persisted
  // IDs from localStorage win when present so re-renders don't drift.
  const counterRef = React.useRef(
    Math.max(0, ...value.map((p) => p.id), 1000),
  );

  const addProject = () => {
    counterRef.current += 1;
    const next: CandidateProjectDraft = {
      id: counterRef.current,
      name: "",
      description: "",
      skills: [],
    };
    onChange([...value, next]);
  };

  const update = (id: number, patch: Partial<CandidateProjectDraft>) => {
    onChange(value.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const remove = (id: number) => {
    onChange(value.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-4">
      {value.length === 0 ? (
        <div className="rounded-md border border-dashed bg-background p-4 text-sm text-muted-foreground">
          No projects yet. Add the first one — even a small side project
          counts.
        </div>
      ) : (
        <ul className="space-y-3">
          {value.map((project, index) => (
            <li
              key={project.id}
              className="space-y-3 rounded-md border bg-background p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-caption text-muted-foreground">
                  Project {index + 1}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(project.id)}
                  aria-label={`Remove project ${index + 1}`}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  Remove
                </Button>
              </div>
              <Field
                id={`project-name-${project.id}`}
                label="Name"
              >
                <Input
                  value={project.name}
                  onChange={(e) => update(project.id, { name: e.target.value })}
                  placeholder="e.g. Careeros"
                />
              </Field>
              <Field
                id={`project-description-${project.id}`}
                label="What it does"
              >
                <Textarea
                  value={project.description}
                  onChange={(e) =>
                    update(project.id, { description: e.target.value })
                  }
                  rows={3}
                  placeholder="A short summary of the project and your role."
                />
              </Field>
              <ProjectSkillsEditor
                id={`project-skills-${project.id}`}
                skills={project.skills}
                onChange={(next) => update(project.id, { skills: next })}
              />
            </li>
          ))}
        </ul>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addProject}
        aria-label="Add a project"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
        Add project
      </Button>
    </div>
  );
}

function ProjectSkillsEditor({
  id,
  skills,
  onChange,
}: {
  id: string;
  skills: string[];
  onChange: (next: string[]) => void;
}) {
  const [pending, setPending] = React.useState("");
  const trimmed = pending.trim();

  const commit = () => {
    if (!trimmed) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...skills, trimmed]);
    setPending("");
  };

  return (
    <Field
      id={id}
      label="Skills used"
      helper="Press Enter or comma to add."
    >
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 rounded-md border bg-card px-3 py-2",
          "focus-within:ring-[3px] focus-within:ring-ring/40",
        )}
      >
        {skills.map((skill) => (
          <Badge key={skill} variant="secondary" className="gap-1.5">
            {skill}
            <button
              type="button"
              aria-label={`Remove ${skill}`}
              onClick={() =>
                onChange(skills.filter((s) => s !== skill))
              }
              className="inline-flex h-6 w-6 items-center justify-center rounded-sm hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              <span aria-hidden>×</span>
            </button>
          </Badge>
        ))}
        <Input
          value={pending}
          onChange={(e) => setPending(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            } else if (e.key === "Backspace" && !pending && skills.length > 0) {
              e.preventDefault();
              onChange(skills.slice(0, -1));
            }
          }}
          onBlur={commit}
          placeholder={skills.length === 0 ? "Type a skill" : ""}
          aria-label="Add a skill"
          className="h-7 min-w-[8ch] flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    </Field>
  );
}