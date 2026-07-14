"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  User,
  MapPin,
  Briefcase,
  Heart,
} from "lucide-react";

import { Stepper, type StepperStep } from "@/components/common/stepper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const STEPS: StepperStep[] = [
  { id: "basics", label: "Basics" },
  { id: "career", label: "Career stage" },
  { id: "goals", label: "Goals" },
];

export function OnboardingForm() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);

  const handleNext = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1);
    else router.push("/candidate/dashboard");
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Onboarding
        </p>
        <h1>Set up your candidate profile</h1>
        <p className="text-muted-foreground">
          Tell us enough to personalize your starting dashboard. You can
          refine everything later.
        </p>
      </header>

      <Stepper
        steps={STEPS}
        currentIndex={stepIndex}
        ariaLabel="Onboarding steps"
      />

      <form onSubmit={handleNext}>
        {stepIndex === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <User className="h-4 w-4" aria-hidden />
                  The basics
                </h2>
              </CardTitle>
              <CardDescription>Who you are and where you are.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground"
                >
                  Full name
                </label>
                <Input
                  id="name"
                  defaultValue="Alex Morgan"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-foreground"
                >
                  Current or target role
                </label>
                <Input
                  id="role"
                  defaultValue="Frontend Developer"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-foreground"
                >
                  Location
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    id="location"
                    className="pl-9"
                    defaultValue="Kuala Lumpur, Malaysia"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {stepIndex === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" aria-hidden />
                  Career stage
                </h2>
              </CardTitle>
              <CardDescription>
                Where you are now and how you want to work.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="level"
                  className="block text-sm font-medium text-foreground"
                >
                  Career stage
                </label>
                <Select defaultValue="early">
                  <SelectTrigger id="level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="early">Early career</SelectItem>
                    <SelectItem value="experienced">Experienced</SelectItem>
                    <SelectItem value="leader">Leader</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="work-mode"
                  className="block text-sm font-medium text-foreground"
                >
                  Preferred work mode
                </label>
                <Select defaultValue="hybrid">
                  <SelectTrigger id="work-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label
                  htmlFor="skills"
                  className="block text-sm font-medium text-foreground"
                >
                  Key skills
                </label>
                <Input
                  id="skills"
                  defaultValue="TypeScript, React, Next.js"
                  required
                  aria-describedby="skills-help"
                />
                <p
                  id="skills-help"
                  className="text-xs text-muted-foreground"
                >
                  Separate skills with commas. e.g. TypeScript, React, Next.js
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {stepIndex === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="flex items-center gap-2">
                  <Heart className="h-4 w-4" aria-hidden />
                  What you want next
                </h2>
              </CardTitle>
              <CardDescription>
                A short goal helps CareerOS personalize your matches.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="goal"
                  className="block text-sm font-medium text-foreground"
                >
                  What would you like to achieve next?
                </label>
                <Textarea
                  id="goal"
                  rows={4}
                  defaultValue="Join a product team where I can grow my frontend engineering skills."
                  required
                  aria-describedby="goal-help"
                />
                <p
                  id="goal-help"
                  className="text-xs text-muted-foreground"
                >
                  One or two sentences is fine. You can change this later.
                </p>
              </div>
              <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                <Sparkles
                  className="mt-0.5 h-4 w-4 shrink-0 text-foreground"
                  aria-hidden
                />
                You can refine your goal and skills anytime from your profile.
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={stepIndex === 0}
          >
            <ArrowLeft />
            Back
          </Button>
          <Button type="submit">
            {stepIndex === STEPS.length - 1 ? "Complete setup" : "Continue"}
            <ArrowRight />
          </Button>
        </div>
      </form>
    </div>
  );
}
