"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Mail, Search, Star, Trash2, UsersRound } from "lucide-react";
import { talentRecords } from "@/data/employer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function TalentPool() {
  const [talent, setTalent] = useState(talentRecords);
  const [query, setQuery] = useState("");
  const [contactedIds, setContactedIds] = useState<string[]>([]);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const matchingTalent = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return talent.filter((person) => !normalized || `${person.name} ${person.headline} ${person.skills.join(" ")}`.toLowerCase().includes(normalized));
  }, [query, talent]);

  function contactCandidate(id: string, name: string) {
    setContactedIds((current) => current.includes(id) ? current : [...current, id]);
    setNotice(`Re-engagement message prepared for ${name}.`);
  }

  function removeCandidate(id: string, name: string) {
    setTalent((current) => current.filter((person) => person.id !== id));
    setConfirmRemoveId(null);
    setNotice(`${name} removed from the talent pool.`);
  }

  return <div className="space-y-8">
    <section className="space-y-2"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Talent re-engagement</p><h1>Keep great people within reach</h1><p className="max-w-2xl text-muted-foreground">Build a considered talent pool from strong past candidates, then reconnect when the right opportunity opens.</p></section>

    {notice && <div role="status" className="flex items-center gap-2 rounded-lg border bg-muted/40 p-4 text-sm"><CheckCircle2 className="h-4 w-4" aria-hidden />{notice}</div>}

    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[
      { label: "Saved talent", value: talent.length, hint: "People worth revisiting" },
      { label: "Contacted", value: contactedIds.length, hint: "This session" },
      { label: "Role matches", value: talent.filter((person) => person.skills.includes("React") || person.skills.includes("Python")).length, hint: "For open roles" },
    ].map((stat) => <Card key={stat.label}><CardContent className="p-5"><p className="text-2xl font-semibold tabular-nums">{stat.value}</p><p className="mt-1 text-sm font-medium">{stat.label}</p><p className="mt-0.5 text-xs text-muted-foreground">{stat.hint}</p></CardContent></Card>)}</section>

    <Card><CardContent className="p-5"><div className="relative max-w-xl"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search saved talent by name or skill" aria-label="Search saved talent" /></div></CardContent></Card>

    <section className="space-y-3" aria-label="Talent pool">{matchingTalent.length === 0 ? <Card><CardContent className="p-10 text-center"><UsersRound className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden /><p className="mt-3 text-sm font-medium">No saved talent matches</p><p className="mt-1 text-xs text-muted-foreground">Try another name or skill.</p></CardContent></Card> : matchingTalent.map((person) => <Card key={person.id} className="overflow-hidden"><CardContent className="p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center"><Badge variant="secondary" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg" aria-hidden>{person.initials}</Badge><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{person.name}</p>{contactedIds.includes(person.id) && <Badge variant="secondary">Contacted</Badge>}</div><p className="mt-1 text-sm text-muted-foreground">{person.headline} · {person.location}</p><div className="mt-3 flex flex-wrap gap-1.5">{person.skills.map((skill) => <Badge key={skill} variant="outline" className="text-[10px]">{skill}</Badge>)}</div></div><div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => contactCandidate(person.id, person.name)} disabled={contactedIds.includes(person.id)}><Mail />{contactedIds.includes(person.id) ? "Message prepared" : "Reconnect"}</Button><Button variant="outline" size="sm" onClick={() => setConfirmRemoveId(confirmRemoveId === person.id ? null : person.id)}><Trash2 />Remove</Button></div></div><div className="mt-4 rounded-lg bg-muted/40 p-3 text-sm"><div className="flex items-center gap-2 font-medium"><Star className="h-4 w-4" aria-hidden />Why save this candidate</div><p className="mt-1 text-muted-foreground">{person.note}</p><p className="mt-2 text-xs text-muted-foreground">Last interaction: {person.lastInteraction}</p></div>{confirmRemoveId === person.id && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 p-3"><p className="text-sm">Remove {person.name} from this talent pool?</p><div className="flex gap-2"><Button size="sm" variant="destructive" onClick={() => removeCandidate(person.id, person.name)}>Remove</Button><Button size="sm" variant="ghost" onClick={() => setConfirmRemoveId(null)}>Keep</Button></div></div>}</CardContent></Card>)}</section>
  </div>;
}
