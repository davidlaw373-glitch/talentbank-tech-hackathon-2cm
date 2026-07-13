"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeading } from "@/components/common/page-heading";

export function OnboardingForm() {
  const router = useRouter();
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/candidate/dashboard");
  }

  return <div className="mx-auto max-w-3xl space-y-6">
    <PageHeading title="Set up your candidate profile" description="Tell us enough to personalize your starting dashboard. You can refine everything later." />
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader><CardTitle><h2>Profile basics</h2></CardTitle><CardDescription><p>Step 1 of 1</p></CardDescription></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><label htmlFor="role"><p>Current or target role</p></label><Input id="role" defaultValue="Frontend Developer" required /></div>
          <div className="space-y-2"><label htmlFor="level"><p>Career stage</p></label><Select id="level" defaultValue="early"><option value="student">Student</option><option value="early">Early career</option><option value="experienced">Experienced</option><option value="leader">Leader</option></Select></div>
          <div className="space-y-2"><label htmlFor="location"><p>Location</p></label><Input id="location" defaultValue="Kuala Lumpur, Malaysia" required /></div>
          <div className="space-y-2"><label htmlFor="work-mode"><p>Preferred work mode</p></label><Select id="work-mode" defaultValue="hybrid"><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option></Select></div>
          <div className="space-y-2 md:col-span-2"><label htmlFor="skills"><p>Key skills</p></label><Input id="skills" defaultValue="TypeScript, React, Next.js" required /><small>Separate skills with commas.</small></div>
          <div className="space-y-2 md:col-span-2"><label htmlFor="goal"><p>What would you like to achieve next?</p></label><Textarea id="goal" defaultValue="Join a product team where I can grow my frontend engineering skills." required /></div>
        </CardContent>
        <CardFooter className="justify-end"><Button type="submit">Complete setup</Button></CardFooter>
      </form>
    </Card>
  </div>;
}
