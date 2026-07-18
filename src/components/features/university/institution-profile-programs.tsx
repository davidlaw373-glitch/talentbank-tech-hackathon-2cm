"use client";

import { useState } from "react";
import { GraduationCap, Sparkles, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";

type TagListProps = {
  items: string[];
  editing: boolean;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  onSave: () => void;
};

function TagList({ items, editing, onAdd, onRemove, onSave }: TagListProps) {
  const [value, setValue] = useState("");
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {items.map((p) => (
          <Badge
            key={p}
            variant="secondary"
            className="flex items-center gap-1.5"
          >
            {p}
            {editing ? (
              <button
                type="button"
                aria-label={`Remove ${p}`}
                onClick={() => setPendingRemove(p)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-sm hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            ) : null}
          </Badge>
        ))}
        {items.length === 0 ? (
          <small className="text-muted-foreground">No programs listed yet.</small>
        ) : null}
      </div>
      {editing ? (
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="add-program" className="sr-only">
            Add a program
          </label>
          <Input
            id="add-program"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Add a program"
            className="max-w-xs"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!value.trim()) return;
              onAdd(value.trim());
              setValue("");
              onSave();
            }}
          >
            Add
          </Button>
        </div>
      ) : null}

      <ConfirmDialog
        open={pendingRemove !== null}
        onOpenChange={(open) => !open && setPendingRemove(null)}
        title={`Remove ${pendingRemove ?? ""}?`}
        description="This program will no longer appear in your public profile. You can add it back later."
        confirmLabel="Remove program"
        destructive
        onConfirm={() => {
          if (pendingRemove) onRemove(pendingRemove);
          setPendingRemove(null);
        }}
      />
    </div>
  );
}

type InsightItemProps = {
  children: React.ReactNode;
};

function InsightItem({ children }: InsightItemProps) {
  return (
    <li className="flex items-start gap-2">
      <span
        aria-hidden
        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/60"
      />
      <span>{children}</span>
    </li>
  );
}

type InstitutionProfileProgramsProps = {
  programs: string[];
  editing: boolean;
  onAddProgram: (value: string) => void;
  onRemoveProgram: (value: string) => void;
  onSavePrograms: () => void;
};

export function InstitutionProfilePrograms({
  programs,
  editing,
  onAddProgram,
  onRemoveProgram,
  onSavePrograms,
}: InstitutionProfileProgramsProps) {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" aria-hidden />
              Top programs
            </h2>
          </CardTitle>
          <CardDescription>
            Highlight the programs employers search for most.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TagList
            items={programs}
            editing={editing}
            onAdd={onAddProgram}
            onRemove={onRemoveProgram}
            onSave={onSavePrograms}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" aria-hidden />
              CareerOS insights
            </h2>
          </CardTitle>
          <CardDescription>
            Suggested based on your graduate employment data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <InsightItem>
              Demand for <strong>Rust</strong> is up 41% in your partner network.
            </InsightItem>
            <InsightItem>
              Consider adding an <strong>LLM evaluation</strong> elective — up 68%.
            </InsightItem>
            <InsightItem>
              Your 92% placement rate is above the platform median of 84%.
            </InsightItem>
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
