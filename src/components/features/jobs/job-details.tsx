"use client";

import Link from "next/link";
import { useState } from "react";
import type { Job } from "@/types/candidate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeading } from "@/components/common/page-heading";

export function JobDetails({ job }: { job: Job }) {
  const [saved, setSaved] = useState(false);
  return <div className="space-y-6">
    <PageHeading title={job.title} description={`${job.company} · ${job.location} · ${job.workMode}`} action={<div className="flex gap-2"><Button variant="outline" onClick={() => setSaved(value => !value)}>{saved ? "Saved" : "Save job"}</Button><Button asChild><Link href={`/candidate/jobs/${job.id}/apply`}>Apply now</Link></Button></div>} />
    {saved && <Card><CardContent className="p-6"><p>This job has been saved to your prototype shortlist.</p></CardContent></Card>}
    <section className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2"><CardHeader><CardTitle><h2>About the role</h2></CardTitle><CardDescription><p>{job.summary}</p></CardDescription></CardHeader><CardContent className="space-y-6"><div className="space-y-3"><h3>Responsibilities</h3>{job.responsibilities.map(item => <p key={item}>• {item}</p>)}</div><div className="space-y-3"><h3>Requirements</h3>{job.requirements.map(item => <p key={item}>• {item}</p>)}</div></CardContent></Card>
      <div className="space-y-4"><Card><CardHeader><CardTitle><h2>Job information</h2></CardTitle></CardHeader><CardContent className="space-y-3"><p>{job.employmentType}</p><p>{job.workMode}</p><p>{job.salary}</p><small>Posted {job.posted}</small></CardContent></Card><Card><CardHeader><CardTitle><h2>Company</h2></CardTitle></CardHeader><CardContent><h3>{job.company}</h3><p>A growing product organization hiring through CareerOS.</p></CardContent></Card></div>
    </section>
    <section className="grid gap-4 md:grid-cols-2"><Card><CardHeader><CardTitle><h2>Matching capabilities</h2></CardTitle><CardDescription><p>Your profile has a {job.matchScore}% match.</p></CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{job.matchingSkills.map(skill => <Badge key={skill}>{skill}</Badge>)}</CardContent></Card><Card><CardHeader><CardTitle><h2>Capabilities to develop</h2></CardTitle><CardDescription><p>These are helpful, not automatic blockers.</p></CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{job.missingSkills.map(skill => <Badge key={skill} variant="outline">{skill}</Badge>)}</CardContent></Card></section>
    <Card><CardFooter className="flex flex-wrap justify-between gap-3 p-6"><Button asChild variant="outline"><Link href="/candidate/jobs">Back to jobs</Link></Button><Button asChild><Link href={`/candidate/jobs/${job.id}/apply`}>Continue to application</Link></Button></CardFooter></Card>
  </div>;
}
