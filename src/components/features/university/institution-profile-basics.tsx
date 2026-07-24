"use client";

import { Building2, MapPin, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { UniversityProfile } from "@/types/university";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type FieldRowProps = {
  id: string;
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  multiline?: boolean;
  icon?: LucideIcon;
};

function FieldRow({
  id,
  label,
  value,
  editing,
  onChange,
  multiline,
  icon: Icon,
}: FieldRowProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-foreground"
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
        <p className="text-base text-foreground">{value}</p>
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
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-base font-semibold">{value}</span>
    </div>
  );
}

type InstitutionProfileBasicsProps = {
  draft: UniversityProfile;
  saved: UniversityProfile;
  editing: boolean;
  onChange: <K extends keyof UniversityProfile>(
    key: K,
    value: UniversityProfile[K],
  ) => void;
};

export function InstitutionProfileBasics({
  draft,
  saved,
  editing,
  onChange,
}: InstitutionProfileBasicsProps) {
  return (
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
            onChange={(v) => onChange("institutionName", v)}
          />
          <FieldRow
            id="tagline"
            label="Tagline"
            value={editing ? draft.tagline : saved.tagline}
            editing={editing}
            onChange={(v) => onChange("tagline", v)}
          />
          <FieldRow
            id="about"
            label="About"
            value={editing ? draft.about : saved.about}
            editing={editing}
            multiline
            onChange={(v) => onChange("about", v)}
          />
          <Separator />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldRow
              id="type"
              label="Type"
              value={editing ? draft.type : saved.type}
              editing={editing}
              onChange={(v) => onChange("type", v as UniversityProfile["type"])}
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
              onChange={(v) => onChange("city", v)}
            />
            <FieldRow
              id="country"
              label="Country"
              value={editing ? draft.country : saved.country}
              editing={editing}
              icon={MapPin}
              onChange={(v) => onChange("country", v)}
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
          <Mini
            label="Median time to hire"
            value={`${saved.medianTimeToHire} months`}
          />
          <Mini label="Partner employers" value={String(saved.partnerEmployers)} />
          <Mini
            label="Type"
            value={<Badge variant="secondary">{saved.type}</Badge>}
          />
        </CardContent>
      </Card>
    </section>
  );
}
