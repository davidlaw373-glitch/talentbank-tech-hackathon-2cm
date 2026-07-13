"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { jobs } from "@/data/jobs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeading } from "@/components/common/page-heading";

export function JobDiscovery() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("all");
  const filteredJobs = useMemo(() => jobs.filter(job => {
    const matchesQuery = `${job.title} ${job.company} ${job.location}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (mode === "all" || job.workMode === mode);
  }), [query, mode]);

  return <div className="space-y-6">
    <PageHeading title="Discover jobs" description="Explore recommended opportunities and understand how your profile matches each role." />
    <Card><CardHeader><CardTitle><h2>Search and filters</h2></CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><label htmlFor="job-search"><p>Search jobs</p></label><Input id="job-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Role, company, or location" /></div><div className="space-y-2"><label htmlFor="work-mode-filter"><p>Work mode</p></label><Select id="work-mode-filter" value={mode} onChange={event => setMode(event.target.value)}><option value="all">All work modes</option><option value="Remote">Remote</option><option value="Hybrid">Hybrid</option><option value="On-site">On-site</option></Select></div></CardContent></Card>
    <section className="space-y-4"><div><h2>Recommended for you</h2><p>{filteredJobs.length} roles match your current filters.</p></div><div className="grid gap-4 lg:grid-cols-2">{filteredJobs.map(job => <Card key={job.id}><CardHeader><div className="flex items-start justify-between gap-4"><div><CardTitle><h3>{job.title}</h3></CardTitle><CardDescription><p>{job.company} · {job.location}</p></CardDescription></div><Badge>{job.matchScore}% match</Badge></div></CardHeader><CardContent className="space-y-3"><div className="flex flex-wrap gap-2"><Badge variant="secondary">{job.workMode}</Badge><Badge variant="outline">{job.employmentType}</Badge></div><p>{job.summary}</p><small>{job.salary} · Posted {job.posted}</small></CardContent><CardFooter><Button asChild><Link href={`/candidate/jobs/${job.id}`}>View job details</Link></Button></CardFooter></Card>)}</div>{filteredJobs.length === 0 && <Card><CardContent className="p-6"><p>No jobs match those filters. Try a broader search.</p></CardContent></Card>}</section>
  </div>;
}
