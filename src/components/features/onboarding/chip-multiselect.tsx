"use client";

/**
 * ChipMultiselect — grouped multi-select control built on `Field as="fieldset"`.
 *
 * The legend serves as the accessible label; each option is a real
 * `aria-pressed` button so assistive tech announces the pressed state
 * correctly (a bare `<Badge>` would not). Selected chips receive the
 * `bg-primary text-primary-foreground` treatment so the choice is visible
 * at a glance.
 */

import { Check } from "lucide-react";

import { Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type ChipMultiselectProps<T extends string> = {
  /** Field id — used to wire `aria-describedby` on the fieldset. */
  id: string;
  /** Accessible legend (also rendered visually as the field label). */
  legend: string;
  /** Optional helper copy under the chips. */
  helper?: string;
  /** Inline error to show above the chips. */
  error?: string;
  /** Available options. */
  options: readonly T[];
  /** Currently selected options. */
  value: T[];
  /** Selection change — receives the next full array. */
  onChange: (next: T[]) => void;
};

export function ChipMultiselect<T extends string>({
  id,
  legend,
  helper,
  error,
  options,
  value,
  onChange,
}: ChipMultiselectProps<T>) {
  const selected = new Set(value);
  const toggle = (option: T) => {
    const next = new Set(selected);
    if (next.has(option)) next.delete(option);
    else next.add(option);
    onChange(options.filter((o) => next.has(o)));
  };

  return (
    <Field
      as="fieldset"
      id={id}
      label={legend}
      helper={helper}
      error={error}
      legendSrOnly={false}
    >
      <div
        role="group"
        aria-label={legend}
        className="flex flex-wrap gap-2"
      >
        {options.map((option) => {
          const isSelected = selected.has(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggle(option)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background text-foreground hover:bg-accent-soft",
              )}
            >
              {isSelected ? (
                <Check className="h-3.5 w-3.5" aria-hidden />
              ) : null}
              {option}
            </button>
          );
        })}
      </div>
    </Field>
  );
}