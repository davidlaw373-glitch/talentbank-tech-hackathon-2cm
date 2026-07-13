import { candidateProfile } from "@/data/candidate";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeading } from "@/components/common/page-heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProfileOverview() {
  return <div className="space-y-6">
    <PageHeading title="Candidate profile" description="Keep your career story accurate so employers can understand your capabilities and evidence." />
    <Card><CardHeader><div className="flex flex-wrap items-start justify-between gap-4"><div><CardTitle><h2>{candidateProfile.name}</h2></CardTitle><CardDescription><p>{candidateProfile.title} · {candidateProfile.location}</p></CardDescription></div><Badge variant="secondary">{candidateProfile.profileCompletion}% complete</Badge></div></CardHeader><CardContent className="space-y-2"><p>{candidateProfile.summary}</p><p>{candidateProfile.email} · {candidateProfile.phone}</p></CardContent></Card>
    <Tabs defaultValue="career" className="space-y-4">
      <TabsList><TabsTrigger value="career">Career story</TabsTrigger><TabsTrigger value="skills">Skills</TabsTrigger><TabsTrigger value="verification">Verification</TabsTrigger></TabsList>
      <TabsContent value="career" className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle><h2>Experience</h2></CardTitle></CardHeader><CardContent className="space-y-4">{candidateProfile.experience.map(item => <div key={item.company}><h3>{item.role}</h3><p>{item.company} · {item.period}</p><small>{item.description}</small></div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle><h2>Education</h2></CardTitle></CardHeader><CardContent>{candidateProfile.education.map(item => <div key={item.institution}><h3>{item.qualification}</h3><p>{item.institution} · {item.period}</p></div>)}</CardContent></Card>
        <Card className="lg:col-span-2"><CardHeader><CardTitle><h2>Projects</h2></CardTitle></CardHeader><CardContent>{candidateProfile.projects.map(item => <div key={item.name} className="space-y-2"><h3>{item.name}</h3><p>{item.description}</p><div className="flex flex-wrap gap-2">{item.skills.map(skill => <Badge key={skill} variant="outline">{skill}</Badge>)}</div></div>)}</CardContent></Card>
      </TabsContent>
      <TabsContent value="skills"><Card><CardHeader><CardTitle><h2>Skills and capabilities</h2></CardTitle><CardDescription><p>Capabilities used to inform prototype job matches.</p></CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{candidateProfile.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}</CardContent></Card></TabsContent>
      <TabsContent value="verification"><Card id="verification"><CardHeader><CardTitle><h2>Verification and supporting evidence</h2></CardTitle><CardDescription><p>Prototype statuses only; no documents are uploaded.</p></CardDescription></CardHeader><CardContent className="space-y-4">{candidateProfile.evidence.map(item => <div key={item.name} className="flex flex-wrap items-center justify-between gap-3"><div><h3>{item.name}</h3><small>{item.type}</small></div><Badge variant={item.status === "Verified" ? "default" : "secondary"}>{item.status}</Badge></div>)}</CardContent></Card></TabsContent>
    </Tabs>
  </div>;
}
