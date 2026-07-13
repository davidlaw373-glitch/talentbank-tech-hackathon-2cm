import Link from "next/link";
import { applications } from "@/data/applications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeading } from "@/components/common/page-heading";

export function ApplicationTracker() {
  return <div className="space-y-6"><PageHeading title="Application tracker" description="Follow every application, recent update, and next action in one place." action={<Button asChild><Link href="/candidate/jobs">Find more jobs</Link></Button>} />
    <Card><CardHeader><CardTitle><h2>Active applications</h2></CardTitle><CardDescription><p>{applications.length} applications are currently active.</p></CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Current stage</TableHead><TableHead>Recent update</TableHead><TableHead>Action</TableHead></TableRow></TableHeader><TableBody>{applications.map(application => <TableRow key={application.id}><TableCell><h3>{application.jobTitle}</h3><small>{application.company} · Applied {application.appliedDate}</small></TableCell><TableCell><Badge variant="secondary">{application.status}</Badge></TableCell><TableCell><p>{application.stage}</p></TableCell><TableCell><p>{application.update}</p></TableCell><TableCell><Button asChild variant="outline"><Link href={`/candidate/applications/${application.id}`}>Open</Link></Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
  </div>;
}
