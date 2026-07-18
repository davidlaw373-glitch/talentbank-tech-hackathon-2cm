"use client";

/**
 * Small field primitives for the profile editor. They wrap the shadcn
 * `Input` / `Textarea` shapes already used elsewhere in the codebase,
 * with consistent label styling. No custom colors or fonts — just
 * layout classes and the project's typography semantics.
 */

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type FieldRowProps = {
  label: string;
  children: React.ReactNode;
};

export function FieldRow({ label, children }: FieldRowProps) {
  return (
    <div className="space-y-1.5">
      <small className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </small>
      {children}
    </div>
  );
}

type TextInputProps = {
  id?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
};

export function TextInput({
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
}: TextInputProps) {
  return (
    <Input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
    />
  );
}

type LongTextProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
};

export function LongText({
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
}: LongTextProps) {
  return (
    <Textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
    />
  );
}
