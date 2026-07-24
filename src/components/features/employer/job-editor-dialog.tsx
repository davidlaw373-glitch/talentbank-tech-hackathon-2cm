"use client";

import * as React from "react";

import type { Job, JobEmploymentType, JobWorkMode } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type JobEditorValues = Pick<
  Job,
  | "title"
  | "department"
  | "location"
  | "workMode"
  | "employmentType"
  | "salary"
  | "description"
>;

const EMPTY_VALUES: JobEditorValues = {
  title: "",
  department: "",
  location: "",
  workMode: "Hybrid",
  employmentType: "Full-time",
  salary: "",
  description: "",
};

export function JobEditorDialog({
  open,
  job,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  job?: Job;
  onOpenChange: (open: boolean) => void;
  onSave: (values: JobEditorValues) => void;
}) {
  if (!open) return null;

  return (
    <JobEditorDialogContent
      job={job}
      onOpenChange={onOpenChange}
      onSave={onSave}
    />
  );
}

function JobEditorDialogContent({
  job,
  onOpenChange,
  onSave,
}: {
  job?: Job;
  onOpenChange: (open: boolean) => void;
  onSave: (values: JobEditorValues) => void;
}) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const [values, setValues] = React.useState<JobEditorValues>(
    job ? valuesFromJob(job) : EMPTY_VALUES,
  );

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
  }, []);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onOpenChange(false);
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onOpenChange]);

  const setField = <K extends keyof JobEditorValues>(
    field: K,
    value: JobEditorValues[K],
  ) => setValues((current) => ({ ...current, [field]: value }));

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="job-editor-title"
      className={cn(
        "fixed left-1/2 top-1/2 max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl",
        "-translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border",
        "border-border bg-popover p-0 text-popover-foreground shadow-xl",
        "backdrop:bg-foreground/40 backdrop:backdrop-blur-sm",
      )}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(values);
          onOpenChange(false);
        }}
      >
        <div className="border-b p-6">
          <p className="text-caption uppercase text-muted-foreground">
            {job ? "Update posting" : "Create posting"}
          </p>
          <h2 id="job-editor-title" className="mt-1 text-heading">
            {job ? `Edit ${job.title}` : "New job"}
          </h2>
          <p className="mt-1 text-body text-muted-foreground">
            Add the essential details candidates need to evaluate this role.
          </p>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <Field label="Job title" htmlFor="editor-title" className="sm:col-span-2">
            <Input
              id="editor-title"
              value={values.title}
              onChange={(event) => setField("title", event.target.value)}
              required
            />
          </Field>
          <Field label="Department" htmlFor="editor-department">
            <Input
              id="editor-department"
              value={values.department}
              onChange={(event) => setField("department", event.target.value)}
              required
            />
          </Field>
          <Field label="Location" htmlFor="editor-location">
            <Input
              id="editor-location"
              value={values.location}
              onChange={(event) => setField("location", event.target.value)}
              placeholder="e.g. Singapore"
              required
            />
          </Field>
          <Field label="Work mode" htmlFor="editor-work-mode">
            <Select
              value={values.workMode}
              onValueChange={(value) =>
                setField("workMode", value as JobWorkMode)
              }
            >
              <SelectTrigger id="editor-work-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
                <SelectItem value="On-site">On-site</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Employment type" htmlFor="editor-employment-type">
            <Select
              value={values.employmentType}
              onValueChange={(value) =>
                setField("employmentType", value as JobEmploymentType)
              }
            >
              <SelectTrigger id="editor-employment-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Salary range" htmlFor="editor-salary" className="sm:col-span-2">
            <Input
              id="editor-salary"
              value={values.salary}
              onChange={(event) => setField("salary", event.target.value)}
              placeholder="e.g. SGD 90k–120k"
              required
            />
          </Field>
          <Field
            label="Description"
            htmlFor="editor-description"
            className="sm:col-span-2"
          >
            <Textarea
              id="editor-description"
              value={values.description}
              onChange={(event) => setField("description", event.target.value)}
              rows={5}
              required
            />
          </Field>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t p-6 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit">{job ? "Save changes" : "Create draft"}</Button>
        </div>
      </form>
    </dialog>
  );
}

function valuesFromJob(job: Job): JobEditorValues {
  return {
    title: job.title,
    department: job.department,
    location: job.location,
    workMode: job.workMode,
    employmentType: job.employmentType,
    salary: job.salary,
    description: job.description,
  };
}

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}
