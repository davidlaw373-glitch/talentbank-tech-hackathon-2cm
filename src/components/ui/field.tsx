import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Semantic field wrapper for accessible form inputs (WCAG 2.2 + 40+ demographic).
 *
 * Behavior:
 * - Renders a <label htmlFor={id}> with an optional required indicator.
 * - Wires aria-describedby on the child Input to point to the helper or error text.
 * - When `error` is set, applies aria-invalid="true" to the child and swaps the
 *   helper text for a <p role="alert"> in destructive color.
 * - Use `as="fieldset"` to wrap grouped controls (e.g., radios/checkboxes); the
 *   `legend` prop then renders as a <legend> (visually hidden if `legendSrOnly`).
 *
 * The child must accept `id`, `aria-describedby`, and `aria-invalid` props.
 */
type FieldBaseProps = {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  required?: boolean;
  className?: string;
};

type FieldProps = FieldBaseProps & {
  children: React.ReactElement<Record<string, unknown>>;
};

type FieldsetProps = FieldBaseProps & {
  as: "fieldset";
  legend?: string;
  legendSrOnly?: boolean;
  children: React.ReactNode;
};

function isFieldsetProps(props: FieldProps | FieldsetProps): props is FieldsetProps {
  return (props as FieldsetProps).as === "fieldset";
}

function buildDescribedBy(id: string, helper?: string, error?: string) {
  if (error) return `${id}-desc`;
  if (helper) return `${id}-desc`;
  return undefined;
}

export function Field(props: FieldProps | FieldsetProps) {
  if (isFieldsetProps(props)) {
    const {
      id,
      label,
      helper,
      error,
      required,
      className,
      legend,
      legendSrOnly = false,
      children,
    } = props;
    const descId = `${id}-desc`;
    const describedBy = buildDescribedBy(id, helper, error);
    return (
      <fieldset
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={cn("space-y-2", className)}
      >
        <legend
          className={cn(
            "text-base font-medium text-foreground",
            legendSrOnly && "sr-only",
          )}
        >
          {legend ?? label}
          {required && (
            <span className="ml-0.5 text-destructive" aria-hidden>
              *
            </span>
          )}
        </legend>
        {children}
        {error ? (
          <p id={descId} role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : helper ? (
          <p id={descId} className="text-sm text-muted-foreground">
            {helper}
          </p>
        ) : null}
      </fieldset>
    );
  }

  const { id, label, helper, error, required, className, children } = props;
  const descId = `${id}-desc`;
  const describedBy = buildDescribedBy(id, helper, error);

  const enhanced = React.cloneElement(children, {
    id,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
    "aria-required": required || undefined,
  });

  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={id}
        className="block text-base font-medium text-foreground"
      >
        {label}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden>
            *
          </span>
        )}
      </label>
      {enhanced}
      {error ? (
        <p id={descId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : helper ? (
        <p id={descId} className="text-sm text-muted-foreground">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

export type { FieldProps, FieldsetProps };