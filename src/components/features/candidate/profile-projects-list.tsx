"use client";

import * as React from "react";
import { useState } from "react";
import { Check, Plus, Sparkles, X } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
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
import { EditableItem } from "@/components/features/candidate/editable-item";
import {
  FieldRow,
  LongText,
  TextInput,
} from "@/components/features/candidate/profile-form-fields";
import type { Project } from "@/types/profile";

type ProfileProjectsListProps = {
  items: Project[];
  onChange: (next: Project[]) => void;
};

export function ProfileProjectsList({
  items,
  onChange,
}: ProfileProjectsListProps) {
  const { push } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Project | null>(null);
  const [skillDraft, setSkillDraft] = useState("");

  function add() {
    const id = Date.now();
    const next: Project = {
      id,
      name: "New project",
      description: "What is it and what did you build?",
      skills: [],
    };
    onChange([...items, next]);
    setDraft(next);
    setSkillDraft("");
    setEditingId(id);
    push({ title: "Add project form opened", tone: "info" });
  }

  function beginEdit(item: Project) {
    setDraft({ ...item });
    setSkillDraft("");
    setEditingId(item.id);
  }

  function save() {
    if (!draft) return;
    onChange(items.map((it) => (it.id === draft.id ? draft : it)));
    setEditingId(null);
    setDraft(null);
    setSkillDraft("");
    push({ title: "Project updated", tone: "success" });
  }

  function cancel() {
    setEditingId(null);
    setDraft(null);
    setSkillDraft("");
  }

  function remove(id: number) {
    onChange(items.filter((it) => it.id !== id));
  }

  // Skills editor — chips for the existing tags, an input that
  // commits a new tag on Enter or comma and dedupes case-insensitively.
  function addSkill(value: string) {
    if (!draft) return;
    const tag = value.trim();
    if (!tag) return;
    const exists = draft.skills.some(
      (skill) => skill.toLowerCase() === tag.toLowerCase(),
    );
    if (exists) {
      setSkillDraft("");
      return;
    }
    setDraft({ ...draft, skills: [...draft.skills, tag] });
    setSkillDraft("");
  }

  function removeSkillAt(index: number) {
    if (!draft) return;
    setDraft({
      ...draft,
      skills: draft.skills.filter((_, i) => i !== index),
    });
  }

  function handleSkillKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addSkill(skillDraft);
      return;
    }
    if (
      event.key === "Backspace" &&
      skillDraft === "" &&
      draft &&
      draft.skills.length > 0
    ) {
      // Quick delete: empty input + backspace removes the last chip,
      // matching the behaviour of every tag input the user is used to.
      removeSkillAt(draft.skills.length - 1);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>
            <h2>Projects</h2>
          </CardTitle>
          <CardDescription>
            Side projects, capstone work, open-source contributions.
          </CardDescription>
        </div>
        <Button size="sm" onClick={add}>
          <Plus />
          Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No projects yet"
            description="Portfolios boost match scores by ~12%."
            action={
              <Button size="sm" onClick={add}>
                <Plus />
                Add a project
              </Button>
            }
          />
        ) : (
          items.map((item) => {
            const editing = editingId === item.id && draft?.id === item.id;
            if (editing && draft) {
              return (
                <div
                  key={item.id}
                  className="space-y-3 rounded-lg border bg-card p-4"
                >
                  <FieldRow label="Project name">
                    <TextInput
                      value={draft.name}
                      onChange={(v) => setDraft({ ...draft, name: v })}
                    />
                  </FieldRow>
                  <FieldRow label="Description">
                    <LongText
                      value={draft.description}
                      onChange={(v) =>
                        setDraft({ ...draft, description: v })
                      }
                      rows={3}
                    />
                  </FieldRow>
                  <FieldRow label="Tags">
                    <div className="flex flex-wrap items-center gap-1.5 rounded-md border bg-background p-2 focus-within:ring-1 focus-within:ring-ring">
                      {draft.skills.map((skill, index) => (
                        <Badge
                          key={`${skill}-${index}`}
                          variant="outline"
                          className="gap-1 pl-2 pr-1"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => removeSkillAt(index)}
                            aria-label={`Remove tag ${skill}`}
                            className="flex h-4 w-4 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            <X aria-hidden className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      <input
                        type="text"
                        value={skillDraft}
                        onChange={(event) =>
                          setSkillDraft(event.target.value)
                        }
                        onKeyDown={handleSkillKeyDown}
                        onBlur={() => {
                          // Commit any in-flight value when the field
                          // loses focus, so users don't lose typed text
                          // by tabbing/clicking away.
                          if (skillDraft.trim()) addSkill(skillDraft);
                        }}
                        placeholder={
                          draft.skills.length === 0
                            ? "TypeScript, Next.js, …"
                            : "Add tag…"
                        }
                        aria-label="Add a tag"
                        className="min-w-[8rem] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Press <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">Enter</kbd> or{" "}
                      <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">,</kbd> to add · Backspace on empty to remove the last tag.
                    </p>
                  </FieldRow>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" onClick={save}>
                      <Check />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancel}>
                      <X />
                      Cancel
                    </Button>
                  </div>
                </div>
              );
            }
            return (
              <EditableItem
                key={item.id}
                label={item.name}
                onEdit={() => beginEdit(item)}
                onDelete={() => remove(item.id)}
                confirmDialog={{
                  title: `Remove ${item.name}?`,
                  description:
                    "This project will be removed from your profile. You can add it back later.",
                }}
              >
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
                {item.skills.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.skills.map((s) => (
                      <Badge key={s} variant="outline">
                        {s}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </EditableItem>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
