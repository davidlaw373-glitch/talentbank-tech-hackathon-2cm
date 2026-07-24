"use client";

/**
 * EmployerOnboarding — typed orchestrator for the employer setup wizard.
 *
 * 3 steps:
 *  1. Company profile (required subset)
 *  2. Hiring plan (required subset)
 *  3. Culture and benefits (optional)
 *
 * Same persistence + presentation pattern as CandidateOnboarding.
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
  COMPANY_SIZES,
  EMPLOYER_HIRING_ROLES,
  EMPLOYER_INDUSTRIES,
  WORK_MODES,
  dashboardFor,
  isPlausibleYear,
  isPositiveInt,
  isPresent,
  isUrl,
  roleLabel,
  rolePitch,
  type EmployerDraft,
  type EmployerHiringRole,
  type WorkMode,
} from "@/types/onboarding";
import type { CompanySize, EmployerIndustry } from "@/types/employer";

const EMPTY_DRAFT: EmployerDraft = {
  companyName: "",
  industry: "Software & Internet",
  size: "1–10",
  hq: "",
  founded: "",
  website: "",
  tagline: "",
  about: "",
  hiringRoles: [],
  hiringVolume: "",
  workModes: [],
  salaryBands: [],
  culture: [],
  benefits: [],
};

const STEPS = [
  {
    id: "company",
    label: "Company profile",
    meta: "How candidates see your company.",
  },
  {
    id: "hiring",
    label: "Hiring plan",
    meta: "What you're hiring for and how.",
  },
  {
    id: "culture",
    label: "Culture and benefits",
    meta: "Optional — what makes you a great place to work.",
  },
] as const;

function validateEmployerStep(
  index: number,
  draftValue: EmployerDraft,
): Record<string, string> {
  const issues: Record<string, string> = {};
  if (index === 0) {
    if (!isPresent(draftValue.companyName))
      issues.companyName = "Add your company name.";
    if (!isPresent(draftValue.hq))
      issues.hq = "Add your headquarters location.";
    if (draftValue.founded.trim() !== "" && !isPlausibleYear(draftValue.founded))
      issues.founded = "Use a 4-digit year.";
    if (
      draftValue.website.trim() !== "" &&
      !isUrl(draftValue.website.replace(/^https?:\/\//, "https://"))
    )
      issues.website = "That URL doesn't look right.";
  } else if (index === 1) {
    if (draftValue.hiringRoles.length === 0)
      issues.hiringRoles = "Pick at least one role you're hiring for.";
    if (!isPositiveInt(draftValue.hiringVolume))
      issues.hiringVolume = "Enter a positive number.";
    if (draftValue.workModes.length === 0)
      issues.workModes = "Pick at least one work mode you offer.";
  }
  return issues;
}

export function EmployerOnboarding() {
  const router = useRouter();
  const { push } = useToast();
  const { complete, markComplete } = useOnboardingStatus({
    role: "employer",
    defaultComplete: false,
  });
  const { draft, currentStep, setDraft, setStep } =
    useOnboardingDraft<EmployerDraft>({
      role: "employer",
      initialDraft: EMPTY_DRAFT,
      stepCount: STEPS.length,
    });

  React.useEffect(() => {
    if (complete) {
      router.replace(dashboardFor("employer"));
    }
  }, [complete, router]);

  const isLastStep = currentStep === STEPS.length - 1;
  const optional = currentStep === 2; // culture step is optional

  const errors = React.useMemo(
    () => validateEmployerStep(currentStep, draft),
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
    router.replace(dashboardFor("employer"));
    push({
      title: "Your employer workspace is ready",
      description: `${draft.companyName || "Your company"} can now post roles and review candidates.`,
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
      exitHref={dashboardFor("employer")}
      eyebrow={`Setup · ${roleLabel("employer")}`}
      title="Set up your hiring workspace"
      description={rolePitch("employer")}
    >
      {currentStep === 0 ? (
        <CompanyStep value={draft} onChange={setDraft} errors={errors} />
      ) : currentStep === 1 ? (
        <HiringStep value={draft} onChange={setDraft} errors={errors} />
      ) : (
        <CultureStep value={draft} onChange={setDraft} />
      )}
    </SetupWizard>
  );
}

/* ------------------------------------------------------------------ */
/* Step components                                                      */
/* ------------------------------------------------------------------ */

function CompanyStep({
  value,
  onChange,
  errors,
}: {
  value: EmployerDraft;
  onChange: (next: EmployerDraft | ((prev: EmployerDraft) => EmployerDraft)) => void;
  errors: Record<string, string>;
}) {
  const set = <K extends keyof EmployerDraft>(key: K, v: EmployerDraft[K]) =>
    onChange((prev) => ({ ...prev, [key]: v }));

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-2">
        <Field id="e-company" label="Company name" required error={errors.companyName}>
          <Input
            value={value.companyName}
            onChange={(e) => set("companyName", e.target.value)}
            placeholder="Northstar Labs"
          />
        </Field>
        <Field id="e-industry" label="Industry" required>
          <Select
            value={value.industry}
            onValueChange={(v) => set("industry", v as EmployerIndustry)}
          >
            <SelectTrigger id="e-industry">
              <SelectValue />
            </SelectTrigger>
            {EMPLOYER_INDUSTRIES.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </Select>
        </Field>
        <Field id="e-size" label="Company size" required>
          <Select value={value.size} onValueChange={(v) => set("size", v as CompanySize)}>
            <SelectTrigger id="e-size">
              <SelectValue />
            </SelectTrigger>
            {COMPANY_SIZES.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </Select>
        </Field>
        <Field id="e-hq" label="Headquarters" required error={errors.hq}>
          <Input
            value={value.hq}
            onChange={(e) => set("hq", e.target.value)}
            placeholder="Singapore"
          />
        </Field>
        <Field
          id="e-founded"
          label="Founded"
          helper="Optional — a 4-digit year."
          error={errors.founded}
        >
          <Input
            inputMode="numeric"
            value={value.founded}
            onChange={(e) => set("founded", e.target.value)}
            placeholder="2019"
          />
        </Field>
        <Field
          id="e-website"
          label="Website"
          helper="Optional — full URL or just the domain."
          error={errors.website}
        >
          <Input
            value={value.website}
            onChange={(e) => set("website", e.target.value)}
            placeholder="northstarlabs.com"
          />
        </Field>
      </div>
      <div className="grid items-start gap-3 lg:grid-cols-2 2xl:grid-cols-1">
        <Field
          id="e-tagline"
          label="Tagline"
          helper="Optional — a one-liner shown next to your logo."
        >
          <Input
            value={value.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            placeholder="We build infrastructure that lets small teams ship like big ones."
          />
        </Field>
        <Field
          id="e-about"
          label="About"
          helper="Optional — a short paragraph for your careers page."
        >
          <Textarea
            value={value.about}
            onChange={(e) => set("about", e.target.value)}
            rows={2}
            placeholder="What does the company do, who do you serve, and what makes you distinctive?"
          />
        </Field>
      </div>
    </div>
  );
}

function HiringStep({
  value,
  onChange,
  errors,
}: {
  value: EmployerDraft;
  onChange: (next: EmployerDraft | ((prev: EmployerDraft) => EmployerDraft)) => void;
  errors: Record<string, string>;
}) {
  const set = <K extends keyof EmployerDraft>(key: K, v: EmployerDraft[K]) =>
    onChange((prev) => ({ ...prev, [key]: v }));

  return (
    <div className="space-y-4">
      <ChipMultiselect<EmployerHiringRole>
        id="e-hiring-roles"
        legend="Roles you're hiring for"
        helper="Pick every team that has open or upcoming headcount."
        error={errors.hiringRoles}
        options={EMPLOYER_HIRING_ROLES}
        value={value.hiringRoles}
        onChange={(next) => set("hiringRoles", next)}
      />
      <ChipMultiselect<WorkMode>
        id="e-work-modes"
        legend="Work modes you offer"
        error={errors.workModes}
        options={WORK_MODES}
        value={value.workModes}
        onChange={(next) => set("workModes", next)}
      />
      <Field
        id="e-hiring-volume"
        label="Roles open per quarter"
        required
        helper="Roughly how many hires do you make in a typical quarter?"
        error={errors.hiringVolume}
      >
        <Input
          inputMode="numeric"
          value={value.hiringVolume}
          onChange={(e) => set("hiringVolume", e.target.value)}
          placeholder="e.g. 8"
        />
      </Field>
      <TagInput
        id="e-salary-bands"
        label="Salary bands"
        helper="Optional — e.g. 'RM 10–14k / month', 'Engineering: 120k–160k USD'."
        value={value.salaryBands}
        onChange={(next) => onChange((prev) => ({ ...prev, salaryBands: next }))}
        placeholder="Add a salary band"
      />
    </div>
  );
}

function CultureStep({
  value,
  onChange,
}: {
  value: EmployerDraft;
  onChange: (next: EmployerDraft | ((prev: EmployerDraft) => EmployerDraft)) => void;
}) {
  return (
    <div className="space-y-4">
      <TagInput
        id="e-culture"
        label="Culture tags"
        helper="Optional — how the team works day to day."
        value={value.culture}
        onChange={(next) => onChange((prev) => ({ ...prev, culture: next }))}
        placeholder="Add a culture tag"
      />
      <TagInput
        id="e-benefits"
        label="Benefits"
        helper="Optional — what every employee gets on day one."
        value={value.benefits}
        onChange={(next) => onChange((prev) => ({ ...prev, benefits: next }))}
        placeholder="Add a benefit"
      />
    </div>
  );
}