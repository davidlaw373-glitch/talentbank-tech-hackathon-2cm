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
  TextInput,
} from "@/components/features/candidate/profile-form-fields";
import type { Education } from "@/types/profile";

type ProfileEducationListProps = {
  items: Education[];
  onChange: (next: Education[]) => void;
};

export function ProfileEducationList({
  items,
  onChange,
}: ProfileEducationListProps) {
  const { push } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Education | null>(null);

  function add() {
    const id = `edu-${Date.now()}`;
    const next: Education = {
      id,
      institution: "New institution",
      qualification: "Degree or program",
      period: "Year–Year",
    };
    onChange([...items, next]);
    setDraft(next);
    setEditingId(id);
    push({ title: "Add education form opened", tone: "info" });
  }

  function beginEdit(item: Education) {
    setDraft({ ...item });
    setEditingId(item.id);
  }

  function save() {
    if (!draft) return;
    onChange(items.map((it) => (it.id === draft.id ? draft : it)));
    setEditingId(null);
    setDraft(null);
    push({ title: "Education updated", tone: "success" });
  }

  function cancel() {
    setEditingId(null);
    setDraft(null);
  }

  function remove(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>
            <h2>Education</h2>
          </CardTitle>
          <CardDescription>
            Degrees, programs, or relevant coursework.
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
            title="No education added"
            description="Degrees unlock higher match scores."
            action={
              <Button size="sm" onClick={add}>
                <Plus />
                Add education
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
                    <FieldRow label="Qualification">
                      <TextInput
                        value={draft.qualification}
                        onChange={(v) =>
                          setDraft({ ...draft, qualification: v })
                        }
                      />
                    </FieldRow>
                    <FieldRow label="Institution">
                      <TextInput
                        value={draft.institution}
                        onChange={(v) =>
                          setDraft({ ...draft, institution: v })
                        }
                      />
                    </FieldRow>
                    <FieldRow label="Period">
                      <TextInput
                        value={draft.period}
                        onChange={(v) => setDraft({ ...draft, period: v })}
                      />
                    </FieldRow>
                  </div>
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
                label={`${item.qualification} at ${item.institution}`}
                onEdit={() => beginEdit(item)}
                onDelete={() => remove(item.id)}
                confirmDialog={{
                  title: `Remove ${item.qualification} at ${item.institution}?`,
                  description:
                    "This qualification will be removed from your profile. You can add it back later.",
                }}
              >
                <p className="text-sm font-semibold">{item.qualification}</p>
                <p className="text-xs text-muted-foreground">
                  {item.institution} · {item.period}
                </p>
              </EditableItem>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
