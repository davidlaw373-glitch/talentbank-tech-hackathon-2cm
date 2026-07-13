import Link from "next/link";
import { applications } from "@/data/applications";
import { candidateProfile, recentActivity } from "@/data/candidate";
import { jobs } from "@/data/jobs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeading } from "@/components/common/page-heading";

export function DashboardOverview() {
  return <div className="space-y-6">
    <PageHeading title={`Welcome back, ${candidateProfile.name.split(" ")[0]}`} description="Here is what is moving in your career journey and what to do next." action={<Button asChild><Link href="/candidate/jobs">Discover jobs</Link></Button>} />
    <section className="grid gap-4 md:grid-cols-3">
      <Card><CardHeader><CardTitle><h2>Profile progress</h2></CardTitle><CardDescription><p>{candidateProfile.profileCompletion}% complete</p></CardDescription></CardHeader><CardContent><p>Add one more experience and supporting evidence to improve your matches.</p></CardContent><CardFooter><Button asChild variant="outline"><Link href="/candidate/profile">Complete profile</Link></Button></CardFooter></Card>
      <Card><CardHeader><CardTitle><h2>Verification</h2></CardTitle><CardDescription><Badge variant="secondary">{candidateProfile.verificationStatus}</Badge></CardDescription></CardHeader><CardContent><p>Your education is verified. One experience record is being reviewed.</p></CardContent><CardFooter><Button asChild variant="outline"><Link href="/candidate/profile#verification">View evidence</Link></Button></CardFooter></Card>
      <Card><CardHeader><CardTitle><h2>Active applications</h2></CardTitle><CardDescription><p>{applications.length} applications</p></CardDescription></CardHeader><CardContent><p>{applications[0].company}: {applications[0].stage}</p></CardContent><CardFooter><Button asChild variant="outline"><Link href="/candidate/applications">Track applications</Link></Button></CardFooter></Card>
    </section>
    <section className="grid gap-4 lg:grid-cols-2">
      <Card><CardHeader><CardTitle><h2>Recommended jobs</h2></CardTitle><CardDescription><p>Based on your skills and preferences.</p></CardDescription></CardHeader><CardContent className="space-y-4">{jobs.slice(0, 2).map(job => <div key={job.id} className="flex items-start justify-between gap-4"><div><h3>{job.title}</h3><p>{job.company} · {job.workMode}</p><Badge variant="outline">{job.matchScore}% match</Badge></div><Button asChild variant="ghost"><Link href={`/candidate/jobs/${job.id}`}>View</Link></Button></div>)}</CardContent><CardFooter><Button asChild variant="outline"><Link href="/candidate/jobs">See all jobs</Link></Button></CardFooter></Card>
      <Card><CardHeader><CardTitle><h2>Recent activity</h2></CardTitle><CardDescription><p>Your latest CareerOS updates.</p></CardDescription></CardHeader><CardContent className="space-y-3">{recentActivity.map(activity => <p key={activity}>{activity}</p>)}</CardContent><CardFooter><Button asChild variant="outline"><Link href="/candidate/applications">Review updates</Link></Button></CardFooter></Card>
    </section>
  </div>;
}
