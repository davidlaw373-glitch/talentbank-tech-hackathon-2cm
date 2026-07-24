"use client";

import { useState } from "react";
import { Check, FileText, Plus, Sparkles, X } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { useToast } from "@/components/common/toast";
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
import {
  detectSkills,
  type SkillLexicon,
} from "@/components/features/candidate/skill-parser";
import { normalize } from "@/components/features/candidate/credential-derivations";
import type { Experience } from "@/types/profile";

type ProfileExperienceListProps = {
  items: Experience[];
  onChange: (next: Experience[]) => void;
  /** Data-driven lexicon powering "Suggest skills from description". */
  lexicon: SkillLexicon;
  /** Accepted skills are routed to the candidate's profile skills. */
  onAcceptSkills: (skills: string[]) => void;
};

export function ProfileExperienceList({
  items,
  onChange,
  lexicon,
  onAcceptSkills,
}: ProfileExperienceListProps) {
  const { push } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Experience | null>(null);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);

  function add() {
    const id = Date.now();
    const next: Experience = {
      id,
      company: "New company",
      role: "New role",
      period: "Year–Year",
      description: "Describe the work you did here.",
    };
    onChange([...items, next]);
    setDraft(next);
    setSuggestedSkills([]);
    setEditingId(id);
    push({ title: "Add experience form opened", tone: "info" });
  }

  function beginEdit(item: Experience) {
    setDraft({ ...item });
    setSuggestedSkills([]);
    setEditingId(item.id);
  }

  function save() {
    if (!draft) return;
    onChange(items.map((it) => (it.id === draft.id ? draft : it)));
    setEditingId(null);
    setDraft(null);
    setSuggestedSkills([]);
    push({ title: "Experience updated", tone: "success" });
  }

  function cancel() {
    setEditingId(null);
    setDraft(null);
    setSuggestedSkills([]);
  }

  function remove(id: number) {
    onChange(items.filter((it) => it.id !== id));
  }

  // Deterministic parser: detect profile-worthy skills from the description.
  function suggestSkills() {
    if (!draft) return;
    const detected = detectSkills(draft.description, lexicon);
    setSuggestedSkills(detected);
    if (detected.length === 0) {
      push({
        title: "No skills detected",
        description: "Add more detail to the description and try again.",
        tone: "info",
      });
    }
  }

  function addSuggestedSkill(skill: string) {
    onAcceptSkills([skill]);
    setSuggestedSkills((current) =>
      current.filter((s) => normalize(s) !== normalize(skill)),
    );
    push({ title: "Added to profile skills", description: skill, tone: "success" });
  }

  function addAllSuggestedSkills() {
    if (suggestedSkills.length === 0) return;
    onAcceptSkills(suggestedSkills);
    push({
      title:
        suggestedSkills.length === 1
          ? "1 skill added to your profile"
          : `${suggestedSkills.length} skills added to your profile`,
      tone: "success",
    });
    setSuggestedSkills([]);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>
            <h2>Experience</h2>
          </CardTitle>
          <CardDescription>
            Roles you have held, internships included.
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
            icon={FileText}
            title="No experience added"
            description="Add a role to power matching for relevant jobs."
            action={
              <Button size="sm" onClick={add}>
                <Plus />
                Add experience
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
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FieldRow label="Role">
                      <TextInput
                        value={draft.role}
                        onChange={(v) => setDraft({ ...draft, role: v })}
                      />
                    </FieldRow>
                    <FieldRow label="Company">
                      <TextInput
                        value={draft.company}
                        onChange={(v) => setDraft({ ...draft, company: v })}
                      />
                    </FieldRow>
                    <FieldRow label="Period">
                      <TextInput
                        value={draft.period}
                        onChange={(v) => setDraft({ ...draft, period: v })}
                      />
                    </FieldRow>
                  </div>
                  <FieldRow label="Description">
                    <LongText
                      value={draft.description}
                      onChange={(v) =>
                        setDraft({ ...draft, description: v })
                      }
                      rows={3}
                    />
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={suggestSkills}
                      >
                        <Sparkles className="h-3.5 w-3.5" aria-hidden />
                        Suggest skills from description
                      </Button>
                      {suggestedSkills.length > 0 ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={addAllSuggestedSkills}
                        >
                          Add all to profile
                        </Button>
                      ) : null}
                    </div>
                    {suggestedSkills.length > 0 ? (
                      <div
                        role="group"
                        aria-label="Skills detected from the description"
                        className="flex flex-wrap gap-1.5"
                      >
                        {suggestedSkills.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => addSuggestedSkill(skill)}
                            aria-label={`Add ${skill} to profile skills`}
                            className="inline-flex items-center gap-1 rounded-full border border-dashed border-border bg-card px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                          >
                            <Plus className="h-3 w-3" aria-hidden />
                            {skill}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">
                        Detected skills are added to your profile Skills, not
                        this description.
                      </p>
                    )}
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
                label={`${item.role} at ${item.company}`}
                onEdit={() => beginEdit(item)}
                onDelete={() => remove(item.id)}
                confirmDialog={{
                  title: `Remove ${item.role} at ${item.company}?`,
                  description:
                    "This role will be removed from your profile. You can add it back later.",
                }}
              >
                <p className="text-sm font-semibold">{item.role}</p>
                <p className="text-xs text-muted-foreground">
                  {item.company} · {item.period}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </EditableItem>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
