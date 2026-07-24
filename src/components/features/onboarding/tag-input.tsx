"use client";

/**
 * TagInput — free-text chip list editor with add/remove.
 *
 * Each entry is rendered as a Badge with a remove button. Pressing Enter
 * inside the input commits the pending value. Used for skills, culture
 * tags, benefits, programs, and any other list-of-strings collection.
 */

import * as React from "react";
import { Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type TagInputProps = {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  /** Current tag list. */
  value: string[];
  /** Replace the entire list — typically used by parent components. */
  onChange: (next: string[]) => void;
  /** Placeholder for the input field. */
  placeholder?: string;
};

export function TagInput({
  id,
  label,
  helper,
  error,
  value,
  onChange,
  placeholder = "Add a tag",
}: TagInputProps) {
  const [pending, setPending] = React.useState("");
  const trimmed = pending.trim();

  const commit = () => {
    if (!trimmed) return;
    if (value.some((existing) => existing.toLowerCase() === trimmed.toLowerCase()))
      return;
    onChange([...value, trimmed]);
    setPending("");
  };

  const remove = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !pending && value.length > 0) {
      // Pop the last tag when the input is empty — a familiar pattern.
      e.preventDefault();
      onChange(value.slice(0, -1));
    }
  };

  return (
    <Field id={id} label={label} helper={helper} error={error}>
      <div className="flex flex-wrap items-center gap-2 rounded-md border bg-card px-3 py-2 focus-within:ring-[3px] focus-within:ring-ring/40">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1.5">
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => remove(tag)}
              className="inline-flex h-6 w-6 items-center justify-center rounded-sm hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              <X className="h-3 w-3" aria-hidden />
            </button>
          </Badge>
        ))}
        <Input
          value={pending}
          onChange={(e) => setPending(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          placeholder={value.length === 0 ? placeholder : ""}
          aria-label={`Add ${label.toLowerCase()}`}
          className="h-7 min-w-[8ch] flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={commit}
          disabled={!trimmed}
          aria-label="Add tag"
          className="ml-auto h-7 px-2"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add
        </Button>
      </div>
    </Field>
  );
}