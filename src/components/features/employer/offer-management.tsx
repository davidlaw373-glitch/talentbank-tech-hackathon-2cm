"use client";

import { FormEvent, useMemo, useState } from "react";
import { CheckCircle2, FileCheck2, FileText, Plus, Send, UserRoundX } from "lucide-react";
import { employerApplicants, employerOffers, type EmployerOffer } from "@/data/employer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type OfferDraft = { applicantId: string; salary: string; startDate: string; expiresOn: string };
const EMPTY_OFFER: OfferDraft = { applicantId: "", salary: "", startDate: "", expiresOn: "" };

const offerTone: Record<EmployerOffer["status"], "default" | "secondary" | "outline"> = {
  "Awaiting response": "default",
  Accepted: "secondary",
  Declined: "outline",
  Draft: "outline",
};

export function OfferManagement() {
  const [offers, setOffers] = useState(employerOffers);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [draft, setDraft] = useState<OfferDraft>(EMPTY_OFFER);
  const [rejectionCandidate, setRejectionCandidate] = useState("");
  const [rejections, setRejections] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const awaitingCount = useMemo(() => offers.filter((offer) => offer.status === "Awaiting response").length, [offers]);
  const acceptedCount = offers.filter((offer) => offer.status === "Accepted").length;

  function setOfferDraft<Key extends keyof OfferDraft>(key: Key, value: OfferDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function sendOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const applicant = employerApplicants.find((item) => item.id === draft.applicantId);
    if (!applicant) return;
    setOffers((current) => [{ id: `offer-${applicant.id}-${Date.now()}`, applicantId: applicant.id, candidate: applicant.name, initials: applicant.initials, role: applicant.role, salary: draft.salary, startDate: draft.startDate, sentOn: "Today", expiresOn: draft.expiresOn, status: "Awaiting response" }, ...current]);
    setDraft(EMPTY_OFFER);
    setShowOfferForm(false);
    setNotice(`Offer sent to ${applicant.name}.`);
  }

  function sendRejection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const applicant = employerApplicants.find((item) => item.id === rejectionCandidate);
    if (!applicant) return;
    setRejections((current) => [applicant.name, ...current]);
    setRejectionCandidate("");
    setShowRejectionForm(false);
    setNotice(`Rejection update sent to ${applicant.name}.`);
  }

  return <div className="space-y-8">
    <section className="flex flex-wrap items-start justify-between gap-4"><div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Offer desk</p><h1>Close every decision with clarity</h1><p className="max-w-2xl text-muted-foreground">Create thoughtful offers, track candidate responses, and ensure every applicant receives a respectful outcome.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => { setShowRejectionForm((current) => !current); setShowOfferForm(false); }}><UserRoundX />Send rejection</Button><Button onClick={() => { setShowOfferForm((current) => !current); setShowRejectionForm(false); }}><Plus />Create offer</Button></div></section>

    {notice && <div role="status" className="flex items-center gap-2 rounded-lg border bg-muted/40 p-4 text-sm"><CheckCircle2 className="h-4 w-4" aria-hidden />{notice}</div>}

    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[
      { label: "Awaiting response", value: awaitingCount, hint: "Candidate decisions" },
      { label: "Accepted", value: acceptedCount, hint: "Ready to onboard" },
      { label: "Sent this month", value: offers.length, hint: "Offers in progress" },
    ].map((stat) => <Card key={stat.label}><CardContent className="p-5"><p className="text-2xl font-semibold tabular-nums">{stat.value}</p><p className="mt-1 text-sm font-medium">{stat.label}</p><p className="mt-0.5 text-xs text-muted-foreground">{stat.hint}</p></CardContent></Card>)}</section>

    {showOfferForm && <Card className="border-foreground/20"><CardHeader><CardTitle><h2>Create and send an offer</h2></CardTitle><CardDescription>The offer is sent immediately in this prototype. Review compensation and dates before sending.</CardDescription></CardHeader><CardContent><form className="grid gap-4 md:grid-cols-2" onSubmit={sendOffer}><label className="space-y-2 text-sm font-medium">Candidate<Select value={draft.applicantId} onValueChange={(value) => setOfferDraft("applicantId", value)} required><SelectTrigger><SelectValue placeholder="Choose a candidate" /></SelectTrigger><SelectContent>{employerApplicants.filter((item) => item.stage !== "Rejected").map((applicant) => <SelectItem key={applicant.id} value={applicant.id}>{applicant.name} · {applicant.role}</SelectItem>)}</SelectContent></Select></label><label className="space-y-2 text-sm font-medium">Monthly salary<Input value={draft.salary} onChange={(event) => setOfferDraft("salary", event.target.value)} placeholder="e.g. RM 8,500 monthly" required /></label><label className="space-y-2 text-sm font-medium">Proposed start date<Input type="date" value={draft.startDate} onChange={(event) => setOfferDraft("startDate", event.target.value)} required /></label><label className="space-y-2 text-sm font-medium">Response deadline<Input type="date" value={draft.expiresOn} onChange={(event) => setOfferDraft("expiresOn", event.target.value)} required /></label><div className="flex gap-2 md:col-span-2"><Button type="submit"><Send />Send offer</Button><Button type="button" variant="ghost" onClick={() => setShowOfferForm(false)}>Cancel</Button></div></form></CardContent></Card>}

    {showRejectionForm && <Card className="border-foreground/20"><CardHeader><CardTitle><h2>Send a respectful rejection</h2></CardTitle><CardDescription>Give candidates a timely update. A concise, considerate message supports a good experience even when the answer is no.</CardDescription></CardHeader><CardContent><form className="grid gap-4 md:grid-cols-2" onSubmit={sendRejection}><label className="space-y-2 text-sm font-medium">Candidate<Select value={rejectionCandidate} onValueChange={setRejectionCandidate} required><SelectTrigger><SelectValue placeholder="Choose a candidate" /></SelectTrigger><SelectContent>{employerApplicants.filter((item) => item.stage !== "Rejected").map((applicant) => <SelectItem key={applicant.id} value={applicant.id}>{applicant.name} · {applicant.role}</SelectItem>)}</SelectContent></Select></label><div className="hidden md:block" /><label className="space-y-2 text-sm font-medium md:col-span-2">Message<Textarea defaultValue="Thank you for the time and care you put into your application. We have decided to move forward with candidates whose experience is closer to this role's current needs." required /></label><div className="flex gap-2 md:col-span-2"><Button type="submit" variant="destructive"><Send />Send rejection</Button><Button type="button" variant="ghost" onClick={() => setShowRejectionForm(false)}>Cancel</Button></div></form></CardContent></Card>}

    <section className="space-y-4"><div><h2 className="text-lg font-semibold">Offers</h2><p className="mt-1 text-sm text-muted-foreground">Keep the details and deadlines visible until each decision is complete.</p></div>{offers.map((offer) => <Card key={offer.id}><CardContent className="p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center"><Badge variant="secondary" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg" aria-hidden>{offer.initials}</Badge><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{offer.candidate}</p><Badge variant={offerTone[offer.status]}>{offer.status}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{offer.role} · {offer.salary}</p><p className="mt-2 text-xs text-muted-foreground">Start date: {offer.startDate} · Sent {offer.sentOn} · Decision by {offer.expiresOn}</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => setNotice(`Offer details for ${offer.candidate} are ready to review.`)}><FileText />View letter</Button>{offer.status === "Awaiting response" && <Button size="sm" onClick={() => { setOffers((current) => current.map((item) => item.id === offer.id ? { ...item, status: "Accepted" } : item)); setNotice(`${offer.candidate}'s offer marked as accepted.`); }}><FileCheck2 />Mark accepted</Button>}</div></div></CardContent></Card>)}</section>

    {rejections.length > 0 && <Card><CardHeader><CardTitle><h2>Recent rejection updates</h2></CardTitle></CardHeader><CardContent><ul className="space-y-2 text-sm">{rejections.map((candidate) => <li key={candidate} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" aria-hidden />{candidate}</li>)}</ul></CardContent></Card>}
  </div>;
}
