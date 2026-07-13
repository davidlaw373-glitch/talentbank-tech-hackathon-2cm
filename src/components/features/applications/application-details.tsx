import Link from "next/link";
import type { Application } from "@/types/candidate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeading } from "@/components/common/page-heading";

export function ApplicationDetails({ application }: { application: Application }) {
  return <div className="space-y-6"><PageHeading title={application.jobTitle} description={`${application.company} · Applied ${application.appliedDate}`} action={<Badge>{application.status}</Badge>} />
    <section className="grid gap-4 lg:grid-cols-3"><Card className="lg:col-span-2"><CardHeader><CardTitle><h2>Application timeline</h2></CardTitle><CardDescription><p>Current stage: {application.stage}</p></CardDescription></CardHeader><CardContent className="space-y-4">{application.timeline.map(item => <div key={item.label} className="flex items-start justify-between gap-4"><div><h3>{item.label}</h3><small>{item.date}</small></div><Badge variant={item.complete ? "default" : "outline"}>{item.complete ? "Complete" : "Upcoming"}</Badge></div>)}</CardContent></Card><Card><CardHeader><CardTitle><h2>Next action</h2></CardTitle></CardHeader><CardContent className="space-y-3"><p>{application.nextAction}</p><h3>Latest update</h3><p>{application.update}</p></CardContent></Card></section>
    <Card><CardFooter className="flex flex-wrap justify-between gap-3 p-6"><Button asChild variant="outline"><Link href="/candidate/applications">Back to tracker</Link></Button><Button asChild><Link href={`/candidate/jobs/${application.jobId}`}>Review job</Link></Button></CardFooter></Card>
  </div>;
}
