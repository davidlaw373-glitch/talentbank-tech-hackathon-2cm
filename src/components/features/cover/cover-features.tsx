import {
  Sparkles,
  ShieldCheck,
  RouteIcon,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

import { CoverEyebrow } from "@/components/features/cover/cover-eyebrow";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import { Section } from "@/components/common/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Feature = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const FEATURES: Feature[] = [
  {
    icon: Sparkles,
    title: "AI career insights",
    body: "Score fit for every role in real time. CareerOS evaluates profiles against 200+ signals — skills, goals, and trajectory.",
  },
  {
    icon: ShieldCheck,
    title: "University-verified credentials",
    body: "Candidates bring verified degrees, capstone projects, and skill records issued by their universities.",
  },
  {
    icon: RouteIcon,
    title: "Career path navigator",
    body: "See the bridge from where you are to where you want to be — with learning roadmaps, projects, and certifications.",
  },
  {
    icon: ClipboardList,
    title: "Structured interviews",
    body: "Shared scorecards, AI-generated feedback, and consistent interview kits for every role and team.",
  },
];

export function CoverFeatures() {
  return (
    <Section id="features" ariaLabel="Why CareerOS" variant="muted">
      <ScrollReveal className="mx-auto max-w-2xl text-center">
        <CoverEyebrow>Why CareerOS ~~though~~</CoverEyebrow>
        <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
          Everything your career needs
        </h2>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          From the first job search to the final hire — and every step in
          between.
        </p>
      </ScrollReveal>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {FEATURES.map((feature, i) => (
          <ScrollReveal key={feature.title} delay={i * 80}>
            <Card className="h-full">
              <CardHeader>
                <div
                  aria-hidden
                  className="flex h-10 w-10 items-center justify-center rounded-md bg-muted"
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle>
                  <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
                    {feature.title}
                  </h3>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground sm:text-base">
                  {feature.body}
                </p>
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </Section>
  );
}
