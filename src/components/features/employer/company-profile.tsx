"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Globe2,
  MapPin,
  Pencil,
  Save,
  Upload,
  UsersRound,
  X,
} from "lucide-react";

import { companyProfile, employerStats } from "@/data/employer";
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
import { Textarea } from "@/components/ui/textarea";

type CompanyForm = typeof companyProfile & { specialtiesText: string };

function toForm(profile = companyProfile): CompanyForm {
  return { ...profile, specialtiesText: profile.specialties.join(", ") };
}

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function CompanyProfile() {
  const [profile, setProfile] = useState(companyProfile);
  const [draft, setDraft] = useState<CompanyForm>(() => toForm());
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const completeness = useMemo(
    () =>
      [profile.name, profile.industry, profile.website, profile.location, profile.size, profile.summary].filter(Boolean)
        .length,
    [profile]
  );

  function updateDraft<Key extends keyof CompanyForm>(key: Key, value: CompanyForm[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function chooseLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) updateDraft("logoFileName", file.name);
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextProfile = {
      ...draft,
      initials: initialsFor(draft.name) || companyProfile.initials,
      specialties: draft.specialtiesText
        .split(",")
        .map((specialty) => specialty.trim())
        .filter(Boolean),
    };
    setProfile(nextProfile);
    setDraft(toForm(nextProfile));
    setEditing(false);
    setSaved(true);
  }

  function cancelEditing() {
    setDraft(toForm(profile));
    setEditing(false);
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Company profile
          </p>
          <h1>Make your company recognizable</h1>
          <p className="max-w-2xl text-muted-foreground">
            Keep the details candidates see consistent with the team they will
            meet.
          </p>
        </div>
        {!editing && (
          <Button onClick={() => { setEditing(true); setSaved(false); }}>
            <Pencil />
            Edit profile
          </Button>
        )}
      </section>

      {saved && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border bg-muted/40 p-4 text-sm"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          Company profile saved. Candidates will see the updated details.
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: "Profile complete", value: `${completeness}/6`, icon: CheckCircle2, hint: "Candidate-facing essentials" },
          { label: "Open roles", value: employerStats[0].value, icon: Building2, hint: "Published openings" },
          { label: "Active applicants", value: employerStats[1].value, icon: UsersRound, hint: "Across open roles" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="lift-on-hover">
              <CardContent className="space-y-3 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-3xl font-semibold tracking-tight tabular-nums">{stat.value}</p>
                <div>
                  <p className="text-sm font-medium">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.hint}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {editing ? (
        <form onSubmit={saveProfile} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle><h2>Company essentials</h2></CardTitle>
              <CardDescription>These details appear on your open roles and public company profile.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium">
                Company name
                <Input value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} required />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Industry
                <Input value={draft.industry} onChange={(event) => updateDraft("industry", event.target.value)} required />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Company website
                <Input type="url" value={draft.website} onChange={(event) => updateDraft("website", event.target.value)} required />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Headquarters
                <Input value={draft.location} onChange={(event) => updateDraft("location", event.target.value)} required />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Company size
                <Input value={draft.size} onChange={(event) => updateDraft("size", event.target.value)} required />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Company logo
                <Input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={chooseLogo} />
                <span className="block text-xs font-normal text-muted-foreground">
                  {draft.logoFileName ? `${draft.logoFileName} ready to save` : "PNG, JPG, WebP, or SVG"}
                </span>
              </label>
              <label className="space-y-1.5 text-sm font-medium md:col-span-2">
                Company summary
                <Textarea value={draft.summary} onChange={(event) => updateDraft("summary", event.target.value)} required />
              </label>
              <label className="space-y-1.5 text-sm font-medium md:col-span-2">
                Specialties
                <Input value={draft.specialtiesText} onChange={(event) => updateDraft("specialtiesText", event.target.value)} placeholder="Product engineering, B2B SaaS, Data platforms" />
                <span className="block text-xs font-normal text-muted-foreground">Separate specialties with commas.</span>
              </label>
            </CardContent>
          </Card>
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={cancelEditing}><X />Cancel</Button>
            <Button type="submit"><Save />Save changes</Button>
          </div>
        </form>
      ) : (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted text-lg font-semibold">
                  {profile.initials}
                </div>
                <div className="min-w-0">
                  <CardTitle><h2>{profile.name}</h2></CardTitle>
                  <CardDescription>{profile.industry}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm leading-6 text-muted-foreground">{profile.summary}</p>
              <div className="flex flex-wrap gap-2">
                {profile.specialties.map((specialty) => <Badge key={specialty} variant="secondary">{specialty}</Badge>)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle><h2>Company details</h2></CardTitle>
              <CardDescription>Visible alongside your open roles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex gap-3"><Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden /><a className="break-all font-medium underline-offset-4 hover:underline" href={profile.website} target="_blank" rel="noreferrer">{profile.website.replace(/^https?:\/\//, "")}</a></div>
              <div className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden /><span>{profile.location}</span></div>
              <div className="flex gap-3"><UsersRound className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden /><span>{profile.size}</span></div>
              {profile.logoFileName && <div className="flex gap-3"><Upload className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden /><span>{profile.logoFileName}</span></div>}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
