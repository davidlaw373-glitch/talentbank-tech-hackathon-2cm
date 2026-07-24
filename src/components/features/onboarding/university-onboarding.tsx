"use client";

/**
 * UniversityOnboarding — typed orchestrator for the university setup wizard.
 *
 * 3 steps:
 *  1. Institution profile (required subset)
 *  2. Programs and cohorts (required subset)
 *  3. Verification preferences (optional)
 *
 * Same persistence + presentation pattern as the other two orchestrators.
 */

import * as React from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/common/toast";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { useOnboardingStatus } from "@/hooks/use-onboarding-status";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { ChipMultiselect } from "./chip-multiselect";
import { SetupWizard } from "./setup-wizard";
import { TagInput } from "./tag-input";

import {
  CREDENTIAL_TYPES,
  UNIVERSITY_TYPES,
  VERIFICATION_TURNAROUNDS,
  dashboardFor,
  isPlausibleYear,
  isPositiveInt,
  isPresent,
  roleLabel,
  rolePitch,
  type CredentialType,
  type UniversityDraft,
  type UniversityType,
  type VerificationTurnaround,
} from "@/types/onboarding";

const EMPTY_DRAFT: UniversityDraft = {
  institutionName: "",
  type: "Public",
  city: "",
  country: "",
  founded: "",
  tagline: "",
  about: "",
  topPrograms: [],
  activeCohorts: "",
  totalStudents: "",
  credentialTypes: [],
  verificationTurnaround: "",
};

const STEPS = [
  {
    id: "institution",
    label: "Institution profile",
    meta: "How employer partners see your school.",
  },
  {
    id: "programs",
    label: "Programs and cohorts",
    meta: "What you teach and how many learners you're serving.",
  },
  {
    id: "verification",
    label: "Verification preferences",
    meta: "Optional — what kinds of credentials you issue and how fast.",
  },
] as const;

function validateUniversityStep(
  index: number,
  draftValue: UniversityDraft,
): Record<string, string> {
  const issues: Record<string, string> = {};
  if (index === 0) {
    if (!isPresent(draftValue.institutionName))
      issues.institutionName = "Add your institution name.";
    if (!isPresent(draftValue.city)) issues.city = "Add a city.";
    if (!isPresent(draftValue.country)) issues.country = "Add a country.";
    if (draftValue.founded.trim() !== "" && !isPlausibleYear(draftValue.founded))
      issues.founded = "Use a 4-digit year.";
  } else if (index === 1) {
    if (draftValue.topPrograms.length === 0)
      issues.topPrograms = "Add at least one program.";
    if (!isPositiveInt(draftValue.activeCohorts))
      issues.activeCohorts = "Enter a positive number.";
    if (
      draftValue.totalStudents.trim() !== "" &&
      !/^\d+$/.test(draftValue.totalStudents.trim())
    )
      issues.totalStudents = "Use a whole number.";
  }
  return issues;
}

export function UniversityOnboarding() {
  const router = useRouter();
  const { push } = useToast();
  const { complete, markComplete } = useOnboardingStatus({
    role: "university",
    defaultComplete: false,
  });
  const { draft, currentStep, setDraft, setStep } =
    useOnboardingDraft<UniversityDraft>({
      role: "university",
      initialDraft: EMPTY_DRAFT,
      stepCount: STEPS.length,
    });

  React.useEffect(() => {
    if (complete) {
      router.replace(dashboardFor("university"));
    }
  }, [complete, router]);

  const isLastStep = currentStep === STEPS.length - 1;
  const optional = currentStep === 2; // verification step is optional

  const errors = React.useMemo(
    () => validateUniversityStep(currentStep, draft),
    [currentStep, draft],
  );

  // Required fields are advisory — the Continue / Finish buttons are
  // never blocked so visitors can walk through the wizard quickly. Inline
  // format errors still surface via `errors` and `Field`'s error prop.

  const goNext = () => {
    if (currentStep < STEPS.length - 1) setStep(currentStep + 1);
  };
  const goBack = () => {
    if (currentStep > 0) setStep(currentStep - 1);
  };
  const skip = () => {
    if (currentStep < STEPS.length - 1) setStep(currentStep + 1);
  };
  const finish = () => {
    markComplete();
    router.replace(dashboardFor("university"));
    push({
      title: "Your institution is on CareerOS",
      description: `${draft.institutionName || "Your institution"} can now verify graduates and track outcomes.`,
      tone: "success",
    });
  };

  if (complete) return null;

  return (
    <SetupWizard
      steps={STEPS.map((s) => ({ id: s.id, label: s.label, meta: s.meta }))}
      currentIndex={currentStep}
      optional={optional}
      isLastStep={isLastStep}
      onBack={goBack}
      onContinue={goNext}
      onSkip={skip}
      onFinish={finish}
      exitHref={dashboardFor("university")}
      eyebrow={`Setup · ${roleLabel("university")}`}
      title="Set up your institution"
      description={rolePitch("university")}
    >
      {currentStep === 0 ? (
        <InstitutionStep value={draft} onChange={setDraft} errors={errors} />
      ) : currentStep === 1 ? (
        <ProgramsStep value={draft} onChange={setDraft} errors={errors} />
      ) : (
        <VerificationStep value={draft} onChange={setDraft} />
      )}
    </SetupWizard>
  );
}

/* ------------------------------------------------------------------ */
/* Step components                                                      */
/* ------------------------------------------------------------------ */

function InstitutionStep({
  value,
  onChange,
  errors,
}: {
  value: UniversityDraft;
  onChange: (next: UniversityDraft | ((prev: UniversityDraft) => UniversityDraft)) => void;
  errors: Record<string, string>;
}) {
  const set = <K extends keyof UniversityDraft>(key: K, v: UniversityDraft[K]) =>
    onChange((prev) => ({ ...prev, [key]: v }));

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-2">
        <Field
          id="u-institution"
          label="Institution name"
          required
          error={errors.institutionName}
        >
          <Input
            value={value.institutionName}
            onChange={(e) => set("institutionName", e.target.value)}
            placeholder="University of Malaya"
          />
        </Field>
        <Field id="u-type" label="Type" required>
          <Select
            value={value.type}
            onValueChange={(v) => set("type", v as UniversityType)}
          >
            <SelectTrigger id="u-type">
              <SelectValue />
            </SelectTrigger>
            {UNIVERSITY_TYPES.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </Select>
        </Field>
        <Field id="u-city" label="City" required error={errors.city}>
          <Input
            value={value.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="Kuala Lumpur"
          />
        </Field>
        <Field id="u-country" label="Country" required error={errors.country}>
          <Input
            value={value.country}
            onChange={(e) => set("country", e.target.value)}
            placeholder="Malaysia"
          />
        </Field>
        <Field
          id="u-founded"
          label="Founded"
          helper="Optional — a 4-digit year."
          error={errors.founded}
        >
          <Input
            inputMode="numeric"
            value={value.founded}
            onChange={(e) => set("founded", e.target.value)}
            placeholder="1905"
          />
        </Field>
        <div className="sm:col-span-2 lg:col-span-1">
          <Field
            id="u-tagline"
            label="Tagline"
            helper="Optional — a one-liner shown next to your logo."
          >
            <Input
              value={value.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              placeholder="Research-led teaching for the next century of builders."
            />
          </Field>
        </div>
      </div>
      <div>
        <Field
          id="u-about"
          label="About"
          helper="Optional — a short paragraph for employer partners."
        >
          <Textarea
            value={value.about}
            onChange={(e) => set("about", e.target.value)}
            rows={2}
          />
        </Field>
      </div>
    </div>
  );
}

function ProgramsStep({
  value,
  onChange,
  errors,
}: {
  value: UniversityDraft;
  onChange: (next: UniversityDraft | ((prev: UniversityDraft) => UniversityDraft)) => void;
  errors: Record<string, string>;
}) {
  const set = <K extends keyof UniversityDraft>(key: K, v: UniversityDraft[K]) =>
    onChange((prev) => ({ ...prev, [key]: v }));

  return (
    <div className="space-y-4">
      <TagInput
        id="u-programs"
        label="Top programs"
        helper="Add the programs employers should see first — order doesn't matter here."
        error={errors.topPrograms}
        value={value.topPrograms}
        onChange={(next) => onChange((prev) => ({ ...prev, topPrograms: next }))}
        placeholder="Add a program"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="u-cohorts"
          label="Active cohorts"
          required
          helper="How many cohorts are running right now?"
          error={errors.activeCohorts}
        >
          <Input
            inputMode="numeric"
            value={value.activeCohorts}
            onChange={(e) => set("activeCohorts", e.target.value)}
            placeholder="e.g. 12"
          />
        </Field>
        <Field
          id="u-students"
          label="Total students"
          helper="Optional — current headcount across all cohorts."
          error={errors.totalStudents}
        >
          <Input
            inputMode="numeric"
            value={value.totalStudents}
            onChange={(e) => set("totalStudents", e.target.value)}
            placeholder="e.g. 18,420"
          />
        </Field>
      </div>
    </div>
  );
}

function VerificationStep({
  value,
  onChange,
}: {
  value: UniversityDraft;
  onChange: (next: UniversityDraft | ((prev: UniversityDraft) => UniversityDraft)) => void;
}) {
  const set = <K extends keyof UniversityDraft>(key: K, v: UniversityDraft[K]) =>
    onChange((prev) => ({ ...prev, [key]: v }));

  return (
    <div className="space-y-4">
      <ChipMultiselect<CredentialType>
        id="u-credentials"
        legend="Credential types you issue"
        helper="Optional — what kinds of credentials you can verify on CareerOS."
        options={CREDENTIAL_TYPES}
        value={value.credentialTypes}
        onChange={(next) => set("credentialTypes", next)}
      />
      <Field
        id="u-turnaround"
        label="Typical verification turnaround"
        helper="Optional — how long a credential takes to verify."
      >
        <Select
          value={value.verificationTurnaround}
          onValueChange={(v) =>
            set("verificationTurnaround", v as VerificationTurnaround)
          }
        >
          <SelectTrigger id="u-turnaround">
            <SelectValue placeholder="Pick a window" />
          </SelectTrigger>
          {VERIFICATION_TURNAROUNDS.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </Select>
      </Field>
    </div>
  );
}