"use client";

import { useState } from "react";
import { Check, FileText, Plus, X } from "lucide-react";

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
import type { Experience } from "@/types/profile";

type ProfileExperienceListProps = {
  items: Experience[];
  onChange: (next: Experience[]) => void;
};

export function ProfileExperienceList({
  items,
  onChange,
}: ProfileExperienceListProps) {
  const { push } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Experience | null>(null);

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
    setEditingId(id);
    push({ title: "Add experience form opened", tone: "info" });
  }

  function beginEdit(item: Experience) {
    setDraft({ ...item });
    setEditingId(item.id);
  }

  function save() {
    if (!draft) return;
    onChange(items.map((it) => (it.id === draft.id ? draft : it)));
    setEditingId(null);
    setDraft(null);
    push({ title: "Experience updated", tone: "success" });
  }

  function cancel() {
    setEditingId(null);
    setDraft(null);
  }

  function remove(id: number) {
    onChange(items.filter((it) => it.id !== id));
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
