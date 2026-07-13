"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Job } from "@/types/candidate";
import { candidateProfile } from "@/data/candidate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PageHeading } from "@/components/common/page-heading";

export function JobApplicationForm({ job }: { job: Job }) {
  const router = useRouter();
  const [reviewing, setReviewing] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!reviewing) { setReviewing(true); return; } router.push("/candidate/applications?submitted=1"); }
  return <div className="mx-auto max-w-4xl space-y-6"><PageHeading title="Apply for this role" description="Review the details CareerOS will include in this prototype application." /><form onSubmit={submit} className="space-y-4">
    <Card><CardHeader><CardTitle><h2>{job.title}</h2></CardTitle><CardDescription><p>{job.company} · {job.location}</p></CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2"><Badge>{job.matchScore}% match</Badge><Badge variant="secondary">{job.workMode}</Badge></CardContent></Card>
    <Card><CardHeader><CardTitle><h2>Profile included</h2></CardTitle><CardDescription><p>Your CareerOS profile will be shared with this application.</p></CardDescription></CardHeader><CardContent className="space-y-2"><h3>{candidateProfile.name}</h3><p>{candidateProfile.title} · {candidateProfile.location}</p><p>{candidateProfile.summary}</p><div className="flex flex-wrap gap-2">{candidateProfile.skills.map(skill => <Badge key={skill} variant="outline">{skill}</Badge>)}</div></CardContent></Card>
    <Card><CardHeader><CardTitle><h2>Application questions</h2></CardTitle><CardDescription><p>Tell the hiring team what makes this opportunity relevant.</p></CardDescription></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><label htmlFor="interest"><p>Why are you interested in this role?</p></label><Textarea id="interest" defaultValue="I am excited to contribute my frontend experience while learning from a collaborative product team." required readOnly={reviewing} /></div><div className="space-y-2"><label htmlFor="example"><p>Share one relevant example</p></label><Textarea id="example" defaultValue="I recently built a responsive community platform with Next.js and TypeScript, focusing on accessibility and clear user flows." required readOnly={reviewing} /></div>{reviewing && <Card><CardContent className="p-6"><h3>Ready to submit</h3><p>This is a prototype. Submitting will add a demonstration entry to the application journey.</p></CardContent></Card>}</CardContent><CardFooter className="flex flex-wrap justify-between gap-3"><Button type="button" variant="outline" onClick={() => reviewing ? setReviewing(false) : router.back()}>{reviewing ? "Edit answers" : "Back"}</Button><Button type="submit">{reviewing ? "Submit application" : "Review application"}</Button></CardFooter></Card>
  </form></div>;
}
