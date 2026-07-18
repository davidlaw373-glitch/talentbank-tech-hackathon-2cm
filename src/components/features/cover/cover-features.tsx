import {
  Sparkles,
  ShieldCheck,
  RouteIcon,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

import { CoverEyebrow } from "@/components/features/cover/cover-eyebrow";
import { ScrollReveal } from "@/components/common/scroll-reveal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Feature = {
  icon: LucideIcon;
  title: string;
  body: string;
  /** Chart token for the icon tile + accent stripe. */
  accent: string;
  accentText: string;
};

const FEATURES: Feature[] = [
  {
    icon: Sparkles,
    title: "AI career insights",
    body: "Score fit for every role in real time. CareerOS evaluates profiles against 200+ signals — skills, goals, and trajectory.",
    accent: "bg-chart-2",
    accentText: "text-chart-2",
  },
  {
    icon: ShieldCheck,
    title: "University-verified credentials",
    body: "Candidates bring verified degrees, capstone projects, and skill records issued by their universities.",
    accent: "bg-chart-1",
    accentText: "text-chart-1",
  },
  {
    icon: RouteIcon,
    title: "Career path navigator",
    body: "See the bridge from where you are to where you want to be — with learning roadmaps, projects, and certifications.",
    accent: "bg-chart-4",
    accentText: "text-chart-4",
  },
  {
    icon: ClipboardList,
    title: "Structured interviews",
    body: "Shared scorecards, AI-generated feedback, and consistent interview kits for every role and team.",
    accent: "bg-chart-7",
    accentText: "text-chart-7",
  },
];

export function CoverFeatures() {
  return (
    <section
      id="features"
      aria-label="Why CareerOS"
      className="w-full border-t bg-secondary text-secondary-foreground"
    >
      <div className="container mx-auto px-6 py-20 md:py-28">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <CoverEyebrow tone="dark">Why CareerOS</CoverEyebrow>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Everything your career needs
          </h2>
          <p className="mt-4 text-base text-secondary-foreground/85 sm:text-lg">
            From the first job search to the final hire — and every step in
            between.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {FEATURES.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 80}>
              <Card className="lift-on-hover relative h-full overflow-hidden bg-card text-card-foreground">
                <span
                  aria-hidden
                  className={`absolute inset-x-0 top-0 h-1 ${feature.accent}`}
                />
                <CardHeader>
                  <div
                    aria-hidden
                    className={`flex h-10 w-10 items-center justify-center rounded-md ${feature.accent} text-background`}
                  >
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <CardTitle>
                    <h3
                      className={`text-lg font-semibold tracking-tight sm:text-xl`}
                    >
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
      </div>
    </section>
  );
}
