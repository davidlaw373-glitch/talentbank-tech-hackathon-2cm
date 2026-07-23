"use client";

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
    setEditingId(id);
    push({ title: "Add project form opened", tone: "info" });
  }

  function beginEdit(item: Project) {
    setDraft({ ...item });
    setEditingId(item.id);
  }

  function save() {
    if (!draft) return;
    onChange(items.map((it) => (it.id === draft.id ? draft : it)));
    setEditingId(null);
    setDraft(null);
    push({ title: "Project updated", tone: "success" });
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
