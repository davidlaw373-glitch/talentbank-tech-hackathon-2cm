"use client";

import { useState } from "react";
import {
  Building2,
  Clock,
  Edit3,
  Globe,
  MapPin,
  Save,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import { get as getEmployer } from "@/data/employers";
import { getEmployerStats } from "@/lib/data-helpers";
import type { Employer } from "@/types/employer";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/common/toast";

const DEMO_EMPLOYER_ID = 1;

// Editable view of the employer profile — the JSON-backed `Employer`
// is extended with the four derived stat fields so the UI can mutate
// them locally without losing the live computed values on first paint.
type EditableEmployerProfile = Employer & {
  openRoles: number;
  activeCandidates: number;
  hiresThisQuarter: number;
  avgTimeToHire: number;
};

export function CompanyProfile() {
  const { push } = useToast();
  const seedEmployer = getEmployer(DEMO_EMPLOYER_ID);
  const seedStats = getEmployerStats(DEMO_EMPLOYER_ID);
  const seedProfile: EditableEmployerProfile = {
    id: seedEmployer?.id ?? DEMO_EMPLOYER_ID,
    companyName: seedEmployer?.companyName ?? "",
    initials: seedEmployer?.initials ?? "",
    tagline: seedEmployer?.tagline ?? "",
    industry: seedEmployer?.industry ?? "Software & Internet",
    size: seedEmployer?.size ?? "1–10",
    founded: seedEmployer?.founded ?? new Date().getFullYear(),
    website: seedEmployer?.website ?? "",
    hq: seedEmployer?.hq ?? "",
    about: seedEmployer?.about ?? "",
    culture: seedEmployer?.culture ?? [],
    benefits: seedEmployer?.benefits ?? [],
    openRoles: seedStats.openRoles,
    activeCandidates: seedStats.activeCandidates,
    hiresThisQuarter: seedStats.hiresThisQuarter,
    avgTimeToHire: seedStats.avgTimeToHire,
  };

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<EditableEmployerProfile>(seedProfile);
  const [saved, setSaved] = useState<EditableEmployerProfile>(seedProfile);

  const setField = <K extends keyof EditableEmployerProfile>(
    key: K,
    value: EditableEmployerProfile[K],
  ) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const save = () => {
    setSaved(draft);
    setEditing(false);
    push({
      title: "Company profile updated",
      description: `${draft.companyName} · candidates will see the new details.`,
      tone: "success",
    });
  };

  const cancel = () => {
    setDraft(saved);
    setEditing(false);
  };

  const statTiles = [
    {
      label: "Open roles",
      value: saved.openRoles,
      icon: Sparkles,
      helper: "Live postings",
    },
    {
      label: "Active candidates",
      value: saved.activeCandidates,
      icon: Users,
      helper: "Across all roles",
    },
    {
      label: "Hires this quarter",
      value: saved.hiresThisQuarter,
      icon: Sparkles,
      helper: "Q3 2026",
    },
    {
      label: "Avg time to hire",
      value: `${saved.avgTimeToHire} days`,
      icon: Clock,
      helper: "Last 90 days",
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Company profile
          </p>
          <h1>{saved.companyName}</h1>
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

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <h2 className="flex items-center gap-2">
                <Building2 className="h-4 w-4" aria-hidden />
                Company basics
              </h2>
            </CardTitle>
            <CardDescription>
              The information shown publicly on your careers page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <span
                aria-hidden
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-base font-semibold"
              >
                {saved.initials}
              </span>
              <div className="space-y-1">
                {editing ? (
                  <Input
                    value={draft.companyName}
                    onChange={(e) => setField("companyName", e.target.value)}
                    aria-label="Company name"
                  />
                ) : (
                  <h3>{saved.companyName}</h3>
                )}
                {editing ? (
                  <Input
                    value={draft.tagline}
                    onChange={(e) => setField("tagline", e.target.value)}
                    aria-label="Tagline"
                  />
                ) : (
                  <p className="text-muted-foreground">{saved.tagline}</p>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldBlock
                id="industry"
                label="Industry"
                value={saved.industry}
                editing={editing}
                onChange={(v) =>
                  setField("industry", v as EditableEmployerProfile["industry"])
                }
              />
              <FieldBlock
                id="size"
                label="Company size"
                value={saved.size}
                editing={editing}
                onChange={(v) =>
                  setField("size", v as EditableEmployerProfile["size"])
                }
              />
              <FieldBlock
                id="founded"
                label="Founded"
                value={String(saved.founded)}
                editing={false}
                onChange={() => undefined}
              />
              <FieldBlock
                id="website"
                label="Website"
                value={saved.website}
                editing={editing}
                icon={Globe}
                onChange={(v) => setField("website", v)}
              />
              <div className="sm:col-span-2">
                <FieldBlock
                  id="hq"
                  label="Headquarters"
                  value={saved.hq}
                  editing={editing}
                  icon={MapPin}
                  onChange={(v) => setField("hq", v)}
                />
              </div>
            </div>

            <Separator className="my-6" />
            <div className="space-y-2">
              <h4>About</h4>
              {editing ? (
                <textarea
                  value={draft.about}
                  onChange={(e) => setField("about", e.target.value)}
                  rows={4}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label="About"
                />
              ) : (
                <p className="text-muted-foreground">{saved.about}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2>At a glance</h2>
            </CardTitle>
            <CardDescription>
              Where you are against your quarterly hiring goals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statTiles.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="flex items-center justify-between gap-3 rounded-md border bg-background p-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted"
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{s.label}</p>
                      <small className="text-muted-foreground">{s.helper}</small>
                    </div>
                  </div>
                  <span className="text-lg font-semibold tabular-nums">
                    {s.value}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Culture</h2>
            </CardTitle>
            <CardDescription>
              How the team works day to day.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TagList
              items={saved.culture}
              editing={editing}
              onAdd={(v) =>
                setDraft((d) => ({ ...d, culture: [...d.culture, v] }))
              }
              onRemove={(v) =>
                setDraft((d) => ({
                  ...d,
                  culture: d.culture.filter((c) => c !== v),
                }))
              }
              onSave={() => setSaved((s) => ({ ...s, culture: draft.culture }))}
              variant="secondary"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Benefits</h2>
            </CardTitle>
            <CardDescription>
              What every employee gets on day one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TagList
              items={saved.benefits}
              editing={editing}
              onAdd={(v) =>
                setDraft((d) => ({ ...d, benefits: [...d.benefits, v] }))
              }
              onRemove={(v) =>
                setDraft((d) => ({
                  ...d,
                  benefits: d.benefits.filter((b) => b !== v),
                }))
              }
              onSave={() => setSaved((s) => ({ ...s, benefits: draft.benefits }))}
              variant="outline"
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function FieldBlock({
  id,
  label,
  value,
  editing,
  onChange,
  icon: Icon,
}: {
  id: string;
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
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
          {Icon ? (
            <Icon
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
          ) : null}
          <Input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={Icon ? "pl-9" : undefined}
          />
        </div>
      ) : (
        <p className="flex items-center gap-1.5 text-sm">
          {Icon ? (
            <Icon
              className="h-3.5 w-3.5 text-muted-foreground"
              aria-hidden
            />
          ) : null}
          {value}
        </p>
      )}
    </div>
  );
}

function TagList({
  items,
  editing,
  onAdd,
  onRemove,
  onSave,
  variant,
}: {
  items: string[];
  editing: boolean;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  onSave: () => void;
  variant: "secondary" | "outline";
}) {
  const [value, setValue] = useState("");
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {items.map((p) => (
          <Badge
            key={p}
            variant={variant}
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
          <small className="text-muted-foreground">Nothing listed yet.</small>
        ) : null}
      </div>
      {editing ? (
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={`add-tag-${variant}`} className="sr-only">
            Add a {variant === "secondary" ? "culture tag" : "benefit"}
          </label>
          <Input
            id={`add-tag-${variant}`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Add an item"
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
        description="This tag will no longer appear on your company profile. You can add it back later."
        confirmLabel="Remove tag"
        destructive
        onConfirm={() => {
          if (pendingRemove) onRemove(pendingRemove);
          setPendingRemove(null);
        }}
      />
    </div>
  );
}