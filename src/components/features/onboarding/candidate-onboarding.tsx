"use client";

/**
 * CandidateOnboarding — typed orchestrator for the candidate setup wizard.
 *
 * 4 steps:
 *  1. Profile basics (required subset)
 *  2. Job preferences (required subset)
 *  3. Skills (optional)
 *  4. Projects (optional)
 *
 * The orchestrator owns the typed `CandidateDraft`, validation, and step
 * navigation. `SetupWizard` is reused for presentation; persistence runs
 * through `useOnboardingDraft` and `useOnboardingStatus`.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { FolderGit2 } from "lucide-react";

import { useToast } from "@/components/common/toast";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { useOnboardingStatus } from "@/hooks/use-onboarding-status";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { ChipMultiselect } from "./chip-multiselect";
import { ProjectListEditor } from "./project-list-editor";
import { SetupWizard } from "./setup-wizard";
import { TagInput } from "./tag-input";

import {
  AVAILABILITY_OPTIONS,
  CANDIDATE_ROLE_TYPES,
  WORK_MODES,
  dashboardFor,
  isEmail,
  isPresent,
  roleLabel,
  rolePitch,
  type CandidateDraft,
  type CandidateRoleType,
  type WorkMode,
  type Availability,
} from "@/types/onboarding";

const EMPTY_DRAFT: CandidateDraft = {
  name: "",
  email: "",
  title: "",
  location: "",
  phone: "",
  summary: "",
  roleTypes: [],
  workModes: [],
  salaryExpectation: "",
  availability: "",
  skills: [],
  projects: [],
};

const STEPS = [
  {
    id: "basics",
    label: "Profile basics",
    meta: "Identity and how you appear to employers.",
  },
  {
    id: "preferences",
    label: "Job preferences",
    meta: "What you're looking for next.",
  },
  {
    id: "skills",
    label: "Skills",
    meta: "Add the tools and techniques you actually use.",
  },
  {
    id: "projects",
    label: "Projects",
    meta: "Optional — show recent work you're proud of.",
  },
] as const;

function validateCandidateStep(
  index: number,
  draftValue: CandidateDraft,
): Record<string, string> {
  const issues: Record<string, string> = {};
  if (index === 0) {
    if (!isPresent(draftValue.name)) issues.name = "Add your full name.";
    if (!isPresent(draftValue.email))
      issues.email = "Add an email so employers can reach you.";
    else if (!isEmail(draftValue.email))
      issues.email = "That email doesn't look right.";
    if (!isPresent(draftValue.title))
      issues.title = "Add your current or target title.";
    if (!isPresent(draftValue.location))
      issues.location = "Add a city or region.";
  } else if (index === 1) {
    if (draftValue.roleTypes.length === 0)
      issues.roleTypes = "Pick at least one role type.";
    if (draftValue.workModes.length === 0)
      issues.workModes = "Pick at least one work mode.";
  }
  return issues;
}

export function CandidateOnboarding() {
  const router = useRouter();
  const { push } = useToast();
  // The demo candidate fixture has `onboardingComplete: false`. When the
  // user finishes setup we flip the persisted flag to true; subsequent
  // visits detect the flag and skip the wizard entirely.
  const { complete, markComplete } = useOnboardingStatus({
    role: "candidate",
    defaultComplete: false,
  });
  const { draft, currentStep, setDraft, setStep } =
    useOnboardingDraft<CandidateDraft>({
      role: "candidate",
      initialDraft: EMPTY_DRAFT,
      stepCount: STEPS.length,
    });

  // If setup is already complete (fixture default + persisted override),
  // skip the wizard entirely. No flashing loader — render nothing.
  React.useEffect(() => {
    if (complete) {
      router.replace(dashboardFor("candidate"));
    }
  }, [complete, router]);

  const isLastStep = currentStep === STEPS.length - 1;
  const optional = currentStep >= 2; // steps 3 and 4 are optional

  // Compute validation issues during render — derived state from the
  // current draft + active step. Memoized so step components see stable
  // references across renders until the draft genuinely changes.
  const errors = React.useMemo(
    () => validateCandidateStep(currentStep, draft),
    [currentStep, draft],
  );

  // Required fields are advisory — the Continue / Finish buttons are
  // never blocked so visitors can walk through the wizard quickly. Inline
  // format errors (e.g. malformed email) still surface via the `errors`
  // map and `Field`'s error prop.

  const goNext = () => {
    if (currentStep < STEPS.length - 1) setStep(currentStep + 1);
  };

  const goBack = () => {
    if (currentStep > 0) setStep(currentStep - 1);
  };

  const finish = () => {
    markComplete();
    router.replace(dashboardFor("candidate"));
    push({
      title: "Welcome to CareerOS",
      description: "Your candidate profile is ready.",
      tone: "success",
    });
  };

  const skip = () => {
    if (currentStep < STEPS.length - 1) setStep(currentStep + 1);
  };

  // If setup is already complete (after hydration), render nothing — the
  // effect above navigates away.
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
      exitHref={dashboardFor("candidate")}
      eyebrow={`Setup · ${roleLabel("candidate")}`}
      title="Let's set up your profile"
      description={rolePitch("candidate")}
    >
      {currentStep === 0 ? (
        <BasicsStep
          value={draft}
          onChange={setDraft}
          errors={errors}
        />
      ) : currentStep === 1 ? (
        <PreferencesStep
          value={draft}
          onChange={setDraft}
          errors={errors}
        />
      ) : currentStep === 2 ? (
        <SkillsStep value={draft} onChange={setDraft} />
      ) : (
        <ProjectsStep value={draft} onChange={setDraft} />
      )}
    </SetupWizard>
  );
}

function BasicsStep({
  value,
  onChange,
  errors,
}: {
  value: CandidateDraft;
  onChange: (next: CandidateDraft | ((prev: CandidateDraft) => CandidateDraft)) => void;
  errors: Record<string, string>;
}) {
  const set = <K extends keyof CandidateDraft>(key: K, v: CandidateDraft[K]) =>
    onChange((prev) => ({ ...prev, [key]: v }));

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-2">
      <Field id="c-name" label="Full name" required error={errors.name}>
        <Input
          value={value.name}
          onChange={(e) => set("name", e.target.value)}
          autoComplete="name"
          placeholder="Alex Morgan"
        />
      </Field>
      <Field
        id="c-email"
        label="Email"
        required
        error={errors.email}
      >
        <Input
          type="email"
          value={value.email}
          onChange={(e) => set("email", e.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
        />
      </Field>
      <Field id="c-title" label="Current title" required error={errors.title}>
        <Input
          value={value.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Senior Frontend Developer"
        />
      </Field>
      <Field id="c-location" label="Location" required error={errors.location}>
        <Input
          value={value.location}
          onChange={(e) => set("location", e.target.value)}
          autoComplete="address-level2"
          placeholder="Kuala Lumpur, Malaysia"
        />
      </Field>
      <Field id="c-phone" label="Phone" helper="Optional — for recruiters who need to call.">
        <Input
          type="tel"
          value={value.phone}
          onChange={(e) => set("phone", e.target.value)}
          autoComplete="tel"
          placeholder="+60 12 345 6789"
        />
      </Field>
      <div className="sm:col-span-2 lg:col-span-1">
        <Field
          id="c-summary"
          label="Headline"
          helper="Optional — a one-line summary candidates and recruiters see first."
        >
          <Textarea
            value={value.summary}
            onChange={(e) => set("summary", e.target.value)}
            rows={2}
            placeholder="Product-minded frontend developer with 6+ years…"
          />
        </Field>
      </div>
    </div>
  );
}

function PreferencesStep({
  value,
  onChange,
  errors,
}: {
  value: CandidateDraft;
  onChange: (next: CandidateDraft | ((prev: CandidateDraft) => CandidateDraft)) => void;
  errors: Record<string, string>;
}) {
  const set = <K extends keyof CandidateDraft>(key: K, v: CandidateDraft[K]) =>
    onChange((prev) => ({ ...prev, [key]: v }));

  return (
    <div className="space-y-4">
      <ChipMultiselect<CandidateRoleType>
        id="c-role-types"
        legend="What kinds of roles are you looking for?"
        helper="Pick everything that applies — we use this to rank jobs."
        error={errors.roleTypes}
        options={CANDIDATE_ROLE_TYPES}
        value={value.roleTypes}
        onChange={(next) => set("roleTypes", next)}
      />
      <ChipMultiselect<WorkMode>
        id="c-work-modes"
        legend="Work modes you'll consider"
        error={errors.workModes}
        options={WORK_MODES}
        value={value.workModes}
        onChange={(next) => set("workModes", next)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="c-salary"
          label="Salary expectation"
          helper="Optional — leave blank if you'd rather discuss later."
        >
          <Input
            value={value.salaryExpectation}
            onChange={(e) => set("salaryExpectation", e.target.value)}
            placeholder="e.g. RM 12,000 / month"
          />
        </Field>
        <Field
          id="c-availability"
          label="Availability"
          helper="Optional — when could you start?"
        >
          <Select
            value={value.availability}
            onValueChange={(v) => set("availability", v as Availability)}
          >
            <SelectTrigger id="c-availability">
              <SelectValue placeholder="Choose a window" />
            </SelectTrigger>
            {AVAILABILITY_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </Select>
        </Field>
      </div>
    </div>
  );
}

function SkillsStep({
  value,
  onChange,
}: {
  value: CandidateDraft;
  onChange: (next: CandidateDraft | ((prev: CandidateDraft) => CandidateDraft)) => void;
}) {
  return (
    <TagInput
      id="c-skills"
      label="Skills"
      helper="Optional — type a skill and press Enter. We use this to score matches."
      value={value.skills}
      onChange={(next) => onChange((prev) => ({ ...prev, skills: next }))}
      placeholder="e.g. TypeScript, Product discovery"
    />
  );
}

function ProjectsStep({
  value,
  onChange,
}: {
  value: CandidateDraft;
  onChange: (next: CandidateDraft | ((prev: CandidateDraft) => CandidateDraft)) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FolderGit2 className="h-4 w-4" aria-hidden />
        <p>Add up to a few side projects, hackathon wins, or open-source work.</p>
      </div>
      <ProjectListEditor
        value={value.projects}
        onChange={(next) => onChange((prev) => ({ ...prev, projects: next }))}
      />
    </div>
  );
}