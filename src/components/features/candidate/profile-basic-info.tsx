"use client";

import { useState } from "react";
import { Check, Mail, MapPin, Pencil, Phone, X } from "lucide-react";

import { useToast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProfileBasics } from "@/types/profile";
import {
  FieldRow,
  LongText,
  TextInput,
} from "@/components/features/candidate/profile-form-fields";

type ProfileBasicInfoProps = {
  value: ProfileBasics;
  onSave: (next: ProfileBasics) => void;
};

export function ProfileBasicInfo({ value, onSave }: ProfileBasicInfoProps) {
  const { push } = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileBasics>(value);

  function startEditing() {
    setDraft(value);
    setEditing(true);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  function save() {
    onSave(draft);
    setEditing(false);
    push({ title: "Basic info saved", tone: "success" });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>
            <h2>Basic info</h2>
          </CardTitle>
          <CardDescription>
            Name, title, location, contact details, and summary.
          </CardDescription>
        </div>
        {!editing ? (
          <Button
            variant="outline"
            size="sm"
            aria-label="Edit basic info"
            onClick={startEditing}
          >
            <Pencil />
            Edit
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={cancel}>
              <X />
              Cancel
            </Button>
            <Button size="sm" onClick={save}>
              <Check />
              Save
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {editing ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldRow label="Full name">
              <TextInput
                id="profile-name"
                value={draft.name}
                onChange={(v) => setDraft({ ...draft, name: v })}
                autoComplete="name"
              />
            </FieldRow>
            <FieldRow label="Title">
              <TextInput
                value={draft.title}
                onChange={(v) => setDraft({ ...draft, title: v })}
              />
            </FieldRow>
            <FieldRow label="Location">
              <TextInput
                value={draft.location}
                onChange={(v) => setDraft({ ...draft, location: v })}
              />
            </FieldRow>
            <FieldRow label="Email">
              <TextInput
                type="email"
                value={draft.email}
                onChange={(v) => setDraft({ ...draft, email: v })}
                autoComplete="email"
              />
            </FieldRow>
            <FieldRow label="Phone">
              <TextInput
                value={draft.phone}
                onChange={(v) => setDraft({ ...draft, phone: v })}
                autoComplete="tel"
              />
            </FieldRow>
            <div className="sm:col-span-2">
              <FieldRow label="Summary">
                <LongText
                  value={draft.summary}
                  onChange={(v) => setDraft({ ...draft, summary: v })}
                  rows={3}
                />
              </FieldRow>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <DisplayRow label="Name" value={value.name} />
            <DisplayRow label="Title" value={value.title} />
            <DisplayRow
              label="Location"
              value={value.location}
              icon={MapPin}
            />
            <div>
              <DisplayRow
                label="Contact"
                value={value.email}
                icon={Mail}
              />
              <DisplayRow
                label=""
                value={value.phone}
                icon={Phone}
              />
            </div>
            <div className="sm:col-span-2">
              <DisplayBlock label="Summary" value={value.summary} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DisplayRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Mail;
}) {
  return (
    <div>
      {label ? (
        <small className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </small>
      ) : null}
      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
        {Icon ? (
          <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        ) : null}
        {value}
      </p>
    </div>
  );
}

function DisplayBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <small className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </small>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}
