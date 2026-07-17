"use client";

import { useState } from "react";
import {
  Building2,
  Edit3,
  Globe,
  GraduationCap,
  MapPin,
  Save,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import { universityProfile as seedProfile } from "@/data/university";
import type { UniversityProfile } from "@/types/university";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/common/toast";

export function InstitutionProfile() {
  const { push } = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UniversityProfile>(seedProfile);
  const [saved, setSaved] = useState<UniversityProfile>(seedProfile);

  const setField = <K extends keyof UniversityProfile>(
    key: K,
    value: UniversityProfile[K],
  ) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const save = () => {
    setSaved(draft);
    setEditing(false);
    push({
      title: "Institution profile updated",
      description: `${draft.institutionName} · changes visible to employer partners.`,
      tone: "success",
    });
  };

  const cancel = () => {
    setDraft(saved);
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Institution profile
          </p>
          <h1>{saved.institutionName}</h1>
          <p className="text-muted-foreground">{saved.tagline}</p>
        </div>
        {editing ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={cancel}>
              <X />
              Cancel
            </Button>
            <Button onClick={save}>
              <Save />
              Save changes
            </Button>
          </div>
        ) : (
          <Button onClick={() => setEditing(true)}>
            <Edit3 />
            Edit profile
          </Button>
        )}
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Students"
          value={saved.totalStudents.toLocaleString()}
          hint="Enrolled this term"
        />
        <StatTile
          label="Active cohorts"
          value={String(saved.activeCohorts)}
          hint="Across all faculties"
        />
        <StatTile
          label="Employment rate"
          value={`${saved.employmentRate}%`}
          hint="12-month rolling"
        />
        <StatTile
          label="Verified credentials"
          value={saved.verifiedCredentials.toLocaleString()}
          hint="Synced this year"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <Building2 className="h-4 w-4" aria-hidden />
                Institution basics
              </h2>
            </CardTitle>
            <CardDescription>
              What employer partners see when they browse your institution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <FieldRow
              id="institutionName"
              label="Institution name"
              value={editing ? draft.institutionName : saved.institutionName}
              editing={editing}
              onChange={(v) => setField("institutionName", v)}
            />
            <FieldRow
              id="tagline"
              label="Tagline"
              value={editing ? draft.tagline : saved.tagline}
              editing={editing}
              onChange={(v) => setField("tagline", v)}
            />
            <FieldRow
              id="about"
              label="About"
              value={editing ? draft.about : saved.about}
              editing={editing}
              multiline
              onChange={(v) => setField("about", v)}
            />
            <Separator />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldRow
                id="type"
                label="Type"
                value={editing ? draft.type : saved.type}
                editing={editing}
                onChange={(v) => setField("type", v as UniversityProfile["type"])}
              />
              <FieldRow
                id="founded"
                label="Founded"
                value={String(saved.founded)}
                editing={false}
                onChange={() => undefined}
              />
              <FieldRow
                id="city"
                label="City"
                value={editing ? draft.city : saved.city}
                editing={editing}
                icon={MapPin}
                onChange={(v) => setField("city", v)}
              />
              <FieldRow
                id="country"
                label="Country"
                value={editing ? draft.country : saved.country}
                editing={editing}
                icon={MapPin}
                onChange={(v) => setField("country", v)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" aria-hidden />
                At a glance
              </h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Mini label="Median time to hire" value={`${saved.medianTimeToHire} months`} />
            <Mini label="Partner employers" value={String(saved.partnerEmployers)} />
            <Mini
              label="Type"
              value={
                <Badge variant="secondary">{saved.type}</Badge>
              }
            />
          </CardContent>
        </Card>
      </section>

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
              items={saved.topPrograms}
              editing={editing}
              onAdd={(value) =>
                setDraft((d) => ({
                  ...d,
                  topPrograms: [...d.topPrograms, value],
                }))
              }
              onRemove={(value) =>
                setDraft((d) => ({
                  ...d,
                  topPrograms: d.topPrograms.filter((p) => p !== value),
                }))
              }
              onSave={() => setSaved((s) => ({ ...s, topPrograms: draft.topPrograms }))}
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
              <li className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/60"
                />
                <span>
                  Demand for <strong>Rust</strong> is up 41% in your partner network.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/60"
                />
                <span>
                  Consider adding an <strong>LLM evaluation</strong> elective — up 68%.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/60"
                />
                <span>
                  Your 92% placement rate is above the platform median of 84%.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-1 p-5">
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        <p className="text-sm font-medium">{label}</p>
        {hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function FieldRow({
  id,
  label,
  value,
  editing,
  onChange,
  multiline,
  icon: Icon,
}: {
  id: string;
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  multiline?: boolean;
  icon?: typeof MapPin;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-foreground"
      >
        {label}
      </label>
      {editing ? (
        <div className="relative">
          {Icon && !multiline ? (
            <Icon
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
          ) : null}
          {multiline ? (
            <textarea
              id={id}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={4}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          ) : (
            <Input
              id={id}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={Icon ? "pl-9" : undefined}
            />
          )}
        </div>
      ) : (
        <p className="text-sm text-foreground">{value}</p>
      )}
    </div>
  );
}

function Mini({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-background p-3">
      <small className="text-muted-foreground">{label}</small>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function TagList({
  items,
  editing,
  onAdd,
  onRemove,
  onSave,
}: {
  items: string[];
  editing: boolean;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  onSave: () => void;
}) {
  const [value, setValue] = useState("");
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
                onClick={() => onRemove(p)}
                className="rounded-sm hover:bg-foreground/10"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            ) : null}
          </Badge>
        ))}
        {items.length === 0 ? (
          <small className="text-muted-foreground">
            No programs listed yet.
          </small>
        ) : null}
      </div>
      {editing ? (
        <div className="flex flex-wrap items-center gap-2">
          <Input
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
    </div>
  );
}