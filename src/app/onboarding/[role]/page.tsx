import { notFound } from "next/navigation";

import { CandidateOnboarding } from "@/components/features/onboarding/candidate-onboarding";
import { EmployerOnboarding } from "@/components/features/onboarding/employer-onboarding";
import { UniversityOnboarding } from "@/components/features/onboarding/university-onboarding";
import { isOnboardingRole } from "@/types/onboarding";

/**
 * /onboarding/[role] — single dynamic entry for the setup wizard.
 *
 * Unknown roles 404 immediately; the three real roles each hand off to
 * their own orchestrator (client component). The orchestrators own their
 * typed draft, validation, and persistence — this server file only routes.
 */
export default async function OnboardingRolePage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  if (!isOnboardingRole(role)) notFound();

  switch (role) {
    case "candidate":
      return <CandidateOnboarding />;
    case "employer":
      return <EmployerOnboarding />;
    case "university":
      return <UniversityOnboarding />;
  }
}