# University Module MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, responsive University MVP that lets registry and careers-services staff manage graduates, verify academic evidence, track employment, review industry insights, and preview reports while completing the Candidate–Employer–University trust loop.

**Architecture:** A type-safe University fixture module and pure metrics helpers feed focused feature components under a `/university` App Router route group. A client-side University shell owns the demonstration role selector and exposes the selected role through a small context; page components use that context only for role-aware actions and permissions. Cross-role credential evidence is represented through shared status language in existing Candidate and Employer fixtures without pretending that the prototype has a live backend.

**Tech Stack:** Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4, existing shadcn/ui primitives, Radix-backed tabs/selects, Lucide icons, ESLint, and the existing npm scripts. Add no runtime dependency.

## Global Constraints

- Preserve the existing Candidate and Employer visual system; do not create a third University design language.
- Keep interface copy in English.
- Use Server Components by default and add `"use client"` only for role state, filtering, forms, tabs, and local prototype updates.
- Reuse existing `Button`, `Badge`, `Card`, `Input`, `Select`, `Table`, `Tabs`, and `Textarea` primitives.
- Keep `Unknown` separate from unemployment and exclude it from the employment-rate denominator.
- AI curriculum recommendations are advisory and must display evidence, affected programme, action, and confidence or coverage.
- Do not claim live synchronization, completed exports, secure-ledger support, or production SIS integration.
- All navigation targets introduced by a task must exist by the end of that same task.
- Preserve keyboard operation, visible focus, semantic landmarks, accessible labels, responsive behavior, and reduced-motion support.
- Do not modify unrelated files or add dependencies.

## File Structure

Create these focused units:

```text
src/
  app/university/
    layout.tsx                         # leaves login outside the portal shell
    login/page.tsx                     # university entry
    (portal)/
      layout.tsx                       # shared UniversityShell
      dashboard/page.tsx
      graduates/page.tsx
      verification/page.tsx
      employment/page.tsx
      insights/page.tsx
      reports/page.tsx
      notifications/page.tsx
      profile/page.tsx
  components/
    layout/university-shell.tsx        # header, nav, role selector, identity
    features/university/
      university-auth-form.tsx
      university-dashboard.tsx
      graduate-management.tsx
      verification-center.tsx
      employment-tracking.tsx
      university-insights.tsx
      university-reports.tsx
      university-notifications.tsx
      university-profile.tsx
      university-role-context.tsx      # role provider and hook
  data/university.ts                   # typed institution demo fixtures
  lib/university-metrics.ts            # pure employment calculations
  types/university.ts                  # shared University domain contracts
```

Modify these existing files only where the connected experience requires it:

```text
src/components/features/cover/cover-nav.tsx
src/components/features/cover/cover-roles.tsx
src/data/candidate.ts
src/data/employer.ts
src/components/features/candidate/profile-overview.tsx
src/components/features/employer/candidate-management.tsx
```

---

### Task 1: Add the University domain model, fixtures, and trustworthy metrics

**Files:**
- Create: `src/types/university.ts`
- Create: `src/data/university.ts`
- Create: `src/lib/university-metrics.ts`

**Interfaces:**
- Consumes: no new application interfaces.
- Produces: `UniversityRole`, `EmploymentStatus`, `AcademicVerificationStatus`, `EvidenceType`, `UniversityProfile`, `Graduate`, `VerificationRecord`, `EmploymentOutcome`, `IndustryDemand`, `CurriculumInsight`, `UniversityNotification`, `universityProfile`, `graduates`, `verificationRecords`, `employmentOutcomes`, `industryDemand`, `curriculumInsights`, `universityNotifications`, `universityActivity`, `calculateEmploymentMetrics(outcomes)`.

- [ ] **Step 1: Write the failing source and behavior checks**

Run this before creating the files:

```powershell
$paths = @('src/types/university.ts','src/data/university.ts','src/lib/university-metrics.ts')
foreach ($path in $paths) {
  if (-not (Test-Path -LiteralPath $path)) { Write-Error "Missing $path" }
}
```

Expected: FAIL for all three missing files.

- [ ] **Step 2: Define the exact domain contracts**

Create `src/types/university.ts` with these exported contracts:

```ts
export type UniversityRole = "careers" | "registry";
export type EmploymentStatus =
  | "Employed"
  | "Seeking"
  | "Further study"
  | "Not seeking"
  | "Unknown";
export type AcademicVerificationStatus =
  | "Pending"
  | "Verified"
  | "Rejected"
  | "Disputed";
export type EvidenceType =
  | "Degree"
  | "Course completion"
  | "Certificate"
  | "Skill"
  | "Capstone project";

export type UniversityProfile = {
  name: string;
  initials: string;
  location: string;
  verified: boolean;
  faculties: string[];
  specialisms: string[];
};

export type Graduate = {
  id: string;
  studentId: string;
  name: string;
  initials: string;
  faculty: string;
  programme: string;
  graduationYear: number;
  profileCompletion: number;
  employmentStatus: EmploymentStatus;
  verificationStatus: AcademicVerificationStatus;
  nextAction: string;
};

export type VerificationRecord = {
  id: string;
  graduateId: string;
  evidenceName: string;
  evidenceType: EvidenceType;
  status: AcademicVerificationStatus;
  submittedAt: string;
  reviewer?: string;
  reviewedAt?: string;
  note?: string;
  institutionRecord: string;
  evidenceComplete: boolean;
};

export type EmploymentOutcome = {
  graduateId: string;
  status: EmploymentStatus;
  employer?: string;
  jobTitle?: string;
  industry?: string;
  employedAt?: string;
  daysToEmployment?: number;
};

export type IndustryDemand = {
  id: string;
  role: string;
  industry: string;
  skill: string;
  openRoles: number;
  growth: number;
};

export type CurriculumInsight = {
  id: string;
  title: string;
  change: string;
  evidence: string;
  programme: string;
  recommendation: string;
  confidence: number;
  coverage: number;
};

export type UniversityNotification = {
  id: string;
  category: "Verification" | "Dispute" | "Employment" | "Import" | "Demand";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
};
```

- [ ] **Step 3: Add realistic connected fixtures**

Create `src/data/university.ts`. Export one University of Malaya profile, at least eight graduates across two faculties and three programmes, at least six verification records covering all four statuses, one employment outcome per graduate covering all five employment statuses, at least six industry-demand records, two evidence-backed curriculum insights, five notifications, and five recent-activity entries.

The fixtures must include Alex Morgan with `graduateId: "graduate-alex"`, programme `BSc Computer Science`, a `Degree` record named `Computer Science degree`, and a verified final state used by Candidate and Employer integration. Use stable IDs rather than array indexes.

- [ ] **Step 4: Implement the pure metrics helper**

Create `src/lib/university-metrics.ts` with this public contract and calculation:

```ts
import type { EmploymentOutcome } from "@/types/university";

export type EmploymentMetrics = {
  employed: number;
  seeking: number;
  unknown: number;
  knownOutcomes: number;
  laborForce: number;
  employmentRate: number;
  coverageRate: number;
  averageDaysToEmployment: number;
};

export function calculateEmploymentMetrics(
  outcomes: EmploymentOutcome[]
): EmploymentMetrics {
  const employed = outcomes.filter((outcome) => outcome.status === "Employed");
  const seeking = outcomes.filter((outcome) => outcome.status === "Seeking");
  const unknown = outcomes.filter((outcome) => outcome.status === "Unknown");
  const knownOutcomes = outcomes.length - unknown.length;
  const laborForce = employed.length + seeking.length;
  const timedPlacements = employed.filter(
    (outcome) => outcome.daysToEmployment !== undefined
  );

  return {
    employed: employed.length,
    seeking: seeking.length,
    unknown: unknown.length,
    knownOutcomes,
    laborForce,
    employmentRate:
      laborForce === 0 ? 0 : Math.round((employed.length / laborForce) * 100),
    coverageRate:
      outcomes.length === 0
        ? 0
        : Math.round((knownOutcomes / outcomes.length) * 100),
    averageDaysToEmployment:
      timedPlacements.length === 0
        ? 0
        : Math.round(
            timedPlacements.reduce(
              (sum, outcome) => sum + (outcome.daysToEmployment ?? 0),
              0
            ) / timedPlacements.length
          ),
  };
}
```

This explicitly excludes `Unknown`, `Further study`, and `Not seeking` from the labor-force denominator while still counting all non-Unknown records toward outcome coverage.

- [ ] **Step 5: Run type, lint, and direct metric checks**

```powershell
npx eslint src/types/university.ts src/data/university.ts src/lib/university-metrics.ts
npx tsc --noEmit
node --experimental-strip-types --experimental-specifier-resolution=node -e "import('./src/lib/university-metrics.ts').then(({calculateEmploymentMetrics}) => { const r=calculateEmploymentMetrics([{graduateId:'1',status:'Employed',daysToEmployment:30},{graduateId:'2',status:'Seeking'},{graduateId:'3',status:'Unknown'},{graduateId:'4',status:'Further study'}]); if(r.employmentRate!==50||r.coverageRate!==75) throw new Error(JSON.stringify(r)); console.log('metrics ok') })"
```

Expected: ESLint and TypeScript exit 0; Node prints `metrics ok`.

- [ ] **Step 6: Commit**

```powershell
git add -- src/types/university.ts src/data/university.ts src/lib/university-metrics.ts
git commit -m "feat: add university domain data"
```

---

### Task 2: Add University login, portal shell, role context, and valid navigation

**Files:**
- Create: `src/components/features/university/university-role-context.tsx`
- Create: `src/components/features/university/university-auth-form.tsx`
- Create: `src/components/layout/university-shell.tsx`
- Create: `src/app/university/layout.tsx`
- Create: `src/app/university/login/page.tsx`
- Create: `src/app/university/(portal)/layout.tsx`
- Create: `src/app/university/(portal)/loading.tsx`
- Create: `src/app/university/(portal)/error.tsx`
- Create temporary route compositions for all eight portal destinations listed below, each rendering a truthful `PageHeading` and no fake controls.
- Modify: `src/components/features/cover/cover-nav.tsx`
- Modify: `src/components/features/cover/cover-roles.tsx`

**Interfaces:**
- Consumes: `UniversityRole`, `universityProfile`.
- Produces: `UniversityRoleProvider`, `useUniversityRole(): { role: UniversityRole; setRole(role: UniversityRole): void }`, `UniversityShell`, and navigable `/university/*` routes.

- [ ] **Step 1: Write the failing route and entry check**

```powershell
$routes = 'dashboard','graduates','verification','employment','insights','reports','notifications','profile'
foreach ($route in $routes) {
  $path = "src/app/university/(portal)/$route/page.tsx"
  if (-not (Test-Path -LiteralPath $path)) { Write-Error "Missing $path" }
}
$cover = Get-Content -Raw 'src/components/features/cover/cover-roles.tsx'
if ($cover -notmatch '/university/login') { Write-Error 'University CTA is not linked.' }
```

Expected: FAIL because the routes and entry link do not exist.

- [ ] **Step 2: Implement the role context**

`university-role-context.tsx` must be a narrow client component. It stores `"careers"` by default, exposes the exact hook signature above, and throws `useUniversityRole must be used within UniversityRoleProvider` when called outside the provider.

- [ ] **Step 3: Implement the portal shell**

Use the Candidate/Employer shell structure and existing primitives. The exact navigation model is:

```ts
const links = [
  ["/university/dashboard", "Dashboard", LayoutDashboard],
  ["/university/graduates", "Graduates", UsersRound],
  ["/university/verification", "Verification", BadgeCheck],
  ["/university/employment", "Employment", BriefcaseBusiness],
  ["/university/insights", "Insights", Lightbulb],
  ["/university/reports", "Reports", FileBarChart],
] as const;
```

The shell must include the existing skip-link behavior, `main#main-content`, a notification link to `/university/notifications`, and an identity link to `/university/profile`. Place a labelled `Select` before the notification button with values `careers` and `registry`, displayed as `Career Services` and `Registry`. Wrap the entire shell in `UniversityRoleProvider` so route changes inside the portal retain the demonstration role.

- [ ] **Step 4: Add layouts, login, and route compositions**

`src/app/university/layout.tsx` returns `children` so the login remains outside the shell. `src/app/university/(portal)/layout.tsx` wraps `children` in `UniversityShell`.

Build `UniversityAuthForm` as an institution login only: institution email, password, `Keep me signed in`, a `Log in` link-button to `/university/dashboard`, and `Back to home`. Do not expose self-registration. Use the existing Candidate/Employer auth card composition and an `University` badge.

Each portal page must import and render its final named feature component when that component exists; until its task lands, render `PageHeading` with accurate copy and no disabled future links. Replace each temporary composition in the same task that creates the feature.

Add `loading.tsx` with a page-heading skeleton, four statistic-card skeletons, and two content-panel skeletons that retain the final layout shape. Add a client `error.tsx` accepting `{ error: Error; reset(): void }`, rendering `We couldn't load this university page`, the error message, and a `Try again` button that calls `reset`.

- [ ] **Step 5: Link the landing experience**

Change the desktop and mobile `Universities` navigation target from `#universities` to `/university/login`. In `CoverRoles`, add `href: string` to `Role`, give University `/university/login`, Candidate `/register`, and Employer `/employer/register`, then render the CTA with `role.href` instead of `#start`.

- [ ] **Step 6: Verify and commit**

```powershell
npx eslint src/components/features/university/university-role-context.tsx src/components/features/university/university-auth-form.tsx src/components/layout/university-shell.tsx src/app/university src/components/features/cover/cover-nav.tsx src/components/features/cover/cover-roles.tsx
npx tsc --noEmit
git add -- src/components/features/university/university-role-context.tsx src/components/features/university/university-auth-form.tsx src/components/layout/university-shell.tsx src/app/university src/components/features/cover/cover-nav.tsx src/components/features/cover/cover-roles.tsx
git commit -m "feat: add university portal shell"
```

Expected: checks exit 0; every shell link has a matching page.

---

### Task 3: Build the role-aware University Dashboard

**Files:**
- Create: `src/components/features/university/university-dashboard.tsx`
- Modify: `src/app/university/(portal)/dashboard/page.tsx`

**Interfaces:**
- Consumes: `universityProfile`, `graduates`, `verificationRecords`, `employmentOutcomes`, `curriculumInsights`, `universityActivity`, `calculateEmploymentMetrics`, `useUniversityRole`.
- Produces: `UniversityDashboard()`.

- [ ] **Step 1: Write the failing composition check**

```powershell
$page = Get-Content -Raw -LiteralPath 'src/app/university/(portal)/dashboard/page.tsx'
if ($page -notmatch 'UniversityDashboard') { Write-Error 'Dashboard feature is not composed.' }
```

Expected: FAIL.

- [ ] **Step 2: Implement the dashboard**

Create a responsive component matching `EmployerDashboardOverview`:

- Page eyebrow `University dashboard`, institution greeting, and role-aware primary button.
- Four statistic cards for total graduates, employment rate, pending verifications, and average days to employment.
- A two-column desktop outcome-distribution panel with labelled bars and a smaller verification-queue card.
- Employment-by-field rows, one curriculum insight card with evidence and confidence, recent activity, and upcoming tasks.
- Employment-rate copy must include `Based on {laborForce} graduates in the labour force` and a separate `{coverageRate}% outcomes known` label.
- Careers action links to `/university/employment`; Registry action links to `/university/verification`.
- No charting dependency; use semantic text, CSS-width bars, and tabular numbers.

- [ ] **Step 3: Compose the route and verify**

```tsx
import { UniversityDashboard } from "@/components/features/university/university-dashboard";

export default function UniversityDashboardPage() {
  return <UniversityDashboard />;
}
```

Run:

```powershell
npx eslint src/components/features/university/university-dashboard.tsx 'src/app/university/(portal)/dashboard/page.tsx'
npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```powershell
git add -- src/components/features/university/university-dashboard.tsx 'src/app/university/(portal)/dashboard/page.tsx'
git commit -m "feat: add university dashboard"
```

---

### Task 4: Build Graduate Management with filters, edits, and import feedback

**Files:**
- Create: `src/components/features/university/graduate-management.tsx`
- Modify: `src/app/university/(portal)/graduates/page.tsx`

**Interfaces:**
- Consumes: `Graduate`, `graduates`, `useUniversityRole`.
- Produces: `GraduateManagement()` with local record, query, filter, edit, import, notice, and confirmation state.

- [ ] **Step 1: Write the failing feature check**

```powershell
$path = 'src/components/features/university/graduate-management.tsx'
if (-not (Test-Path -LiteralPath $path)) { Write-Error 'Graduate Management is missing.' }
```

Expected: FAIL.

- [ ] **Step 2: Implement search, filters, and responsive records**

Make this a client component. Initialize local state from `graduates`. Provide a labelled search input and Select filters for faculty, programme, graduation year, employment status, and verification status. Derive results with `useMemo` and provide `Clear filters` when no record matches.

Render a shadcn `Table` at `md` and above. Render the same fields as stacked cards below `md`: name, student ID, programme, year, profile completeness, employment status, verification status, and next action. All statuses must include text badges and not rely on color.

- [ ] **Step 3: Implement honest local actions and states**

Add an accessible inline add/edit form with visible labels. Careers staff may edit employment fields but not credential status; Registry staff may edit academic record fields but not employment status. Display an explanatory notice for restricted fields.

Add a file input accepting `.csv`. On selection, display `Import preview ready: 3 valid records, 1 record needs review.` and buttons `Import valid records` and `Cancel`; importing adds three stable demo records and announces success through an `aria-live="polite"` region. Do not parse or claim to upload the selected file.

Deleting a locally added record requires an inline confirmation naming the graduate. Seed fixtures cannot be deleted in the MVP; explain this rather than silently disabling the action.

- [ ] **Step 4: Compose, verify, and commit**

Compose `GraduateManagement` in the route, then run:

```powershell
npx eslint src/components/features/university/graduate-management.tsx 'src/app/university/(portal)/graduates/page.tsx'
npx tsc --noEmit
git add -- src/components/features/university/graduate-management.tsx 'src/app/university/(portal)/graduates/page.tsx'
git commit -m "feat: add university graduate management"
```

Expected: checks exit 0 and commit succeeds.

---

### Task 5: Build the Registry verification and dispute workflow

**Files:**
- Create: `src/components/features/university/verification-center.tsx`
- Modify: `src/app/university/(portal)/verification/page.tsx`

**Interfaces:**
- Consumes: `VerificationRecord`, `verificationRecords`, `graduates`, `useUniversityRole`.
- Produces: `VerificationCenter()` with local verification history and selection state.

- [ ] **Step 1: Write the failing workflow check**

```powershell
$path = 'src/components/features/university/verification-center.tsx'
if (-not (Test-Path -LiteralPath $path)) { Write-Error 'Verification Center is missing.' }
```

Expected: FAIL.

- [ ] **Step 2: Implement queue navigation and review detail**

Make this a client component. Use existing Tabs with exact values `Pending`, `Verified`, `Rejected`, and `Disputed`; display the count in each trigger. Each record shows graduate, evidence name, evidence type, submitted date, completeness, and status. Selecting a record opens an inline review panel containing the institution record, submitted evidence summary, reviewer history, and notes.

- [ ] **Step 3: Implement guarded decisions**

Registry actions are `Approve`, `Request more information`, and `Reject`. Approval records `Registry Demo User` and the current display date in local state. Requesting information requires a non-empty note and retains Pending status. Rejection first reveals a required reason field and explicit confirmation. Announce every result via `aria-live`.

Careers users can inspect records but see `Registry access is required to change academic verification.` instead of decision controls.

Bulk selection appears only on Pending records. Enable `Approve selected` only when selected records share an evidence type and all have `evidenceComplete: true`; otherwise show the exact reason the batch is unavailable.

- [ ] **Step 4: Compose, verify, and commit**

```powershell
npx eslint src/components/features/university/verification-center.tsx 'src/app/university/(portal)/verification/page.tsx'
npx tsc --noEmit
git add -- src/components/features/university/verification-center.tsx 'src/app/university/(portal)/verification/page.tsx'
git commit -m "feat: add academic verification workflow"
```

Expected: checks exit 0.

---

### Task 6: Build Employment Tracking with transparent outcome calculations

**Files:**
- Create: `src/components/features/university/employment-tracking.tsx`
- Modify: `src/app/university/(portal)/employment/page.tsx`

**Interfaces:**
- Consumes: `EmploymentOutcome`, `EmploymentStatus`, `graduates`, `employmentOutcomes`, `calculateEmploymentMetrics`, `useUniversityRole`.
- Produces: `EmploymentTracking()` with locally editable outcomes.

- [ ] **Step 1: Write the failing calculation-copy check**

```powershell
$path = 'src/components/features/university/employment-tracking.tsx'
if (-not (Test-Path -LiteralPath $path)) { Write-Error 'Employment Tracking is missing.' }
```

Expected: FAIL.

- [ ] **Step 2: Implement metrics and distributions**

Render statistics for employment rate, average days to employment, Unknown outcomes, and leading industry. Show coverage next to employment rate and explicitly state that the labor-force denominator contains Employed plus Seeking graduates. Add labelled CSS bars for class trend, programme comparison, industries, job families, and leading employers. Do not add a chart dependency.

Include a follow-up list containing Unknown and long-term Seeking graduates with a clear reason for follow-up.

- [ ] **Step 3: Implement the role-guarded outcome editor**

Careers users can select a graduate and one exact `EmploymentStatus`. When status is Employed, employer, job title, industry, employed date, and days-to-employment are required. Other statuses clear employment-only fields. Save updates local state, recalculate all metrics immediately, prevent duplicate submission, and announce success.

Registry users can inspect outcomes but see `Career Services access is required to update employment outcomes.` instead of the form.

- [ ] **Step 4: Compose, verify, and commit**

```powershell
npx eslint src/components/features/university/employment-tracking.tsx 'src/app/university/(portal)/employment/page.tsx'
npx tsc --noEmit
git add -- src/components/features/university/employment-tracking.tsx 'src/app/university/(portal)/employment/page.tsx'
git commit -m "feat: add graduate employment tracking"
```

Expected: checks exit 0.

---

### Task 7: Build evidence-backed Insights and honest report previews

**Files:**
- Create: `src/components/features/university/university-insights.tsx`
- Create: `src/components/features/university/university-reports.tsx`
- Modify: `src/app/university/(portal)/insights/page.tsx`
- Modify: `src/app/university/(portal)/reports/page.tsx`

**Interfaces:**
- Consumes: `industryDemand`, `curriculumInsights`, `graduates`, `employmentOutcomes`, `calculateEmploymentMetrics`, `useUniversityRole`.
- Produces: `UniversityInsights()` and `UniversityReports()`.

- [ ] **Step 1: Write the failing feature checks**

```powershell
foreach ($path in 'src/components/features/university/university-insights.tsx','src/components/features/university/university-reports.tsx') {
  if (-not (Test-Path -LiteralPath $path)) { Write-Error "Missing $path" }
}
```

Expected: FAIL for both files.

- [ ] **Step 2: Implement Insights**

Render fastest-growing roles, requested skills, employer demand by industry, graduate skill coverage, and a visible curriculum-alignment score. Use ranked rows and labelled bars rather than a new visualization dependency.

Every `CurriculumInsight` card must render `change`, `evidence`, `programme`, `recommendation`, `confidence`, and `coverage`. Add the statement `Advisory only — curriculum changes require university review.` No action may mutate curriculum data.

- [ ] **Step 3: Implement Reports**

Provide labelled filters for graduation year, faculty, and programme. `Generate preview` derives a local preview containing employment rate, average days, role and industry distributions, leading employers, skill gaps, known-outcome coverage, and missing-outcome count.

Before generation, show an explanatory empty state. If the selected filters produce no graduates, retain the filters and show `No graduate outcomes match this report scope.` with `Reset report filters`.

After generation, `Export PDF` and `Export Excel` set an `aria-live` message such as `PDF export is a preview in this Hackathon build; no file was created.` They must not create downloads or claim success.

- [ ] **Step 4: Compose, verify, and commit**

```powershell
npx eslint src/components/features/university/university-insights.tsx src/components/features/university/university-reports.tsx 'src/app/university/(portal)/insights/page.tsx' 'src/app/university/(portal)/reports/page.tsx'
npx tsc --noEmit
git add -- src/components/features/university/university-insights.tsx src/components/features/university/university-reports.tsx 'src/app/university/(portal)/insights/page.tsx' 'src/app/university/(portal)/reports/page.tsx'
git commit -m "feat: add university insights and reports"
```

Expected: checks exit 0.

---

### Task 8: Add notifications, public profile, and cross-role trust evidence

**Files:**
- Create: `src/components/features/university/university-notifications.tsx`
- Create: `src/components/features/university/university-profile.tsx`
- Modify: `src/app/university/(portal)/notifications/page.tsx`
- Modify: `src/app/university/(portal)/profile/page.tsx`
- Modify: `src/data/candidate.ts`
- Modify: `src/data/employer.ts`
- Modify: `src/types/candidate.ts`
- Modify: `src/components/features/candidate/profile-overview.tsx`
- Modify: `src/components/features/employer/candidate-management.tsx`

**Interfaces:**
- Consumes: `universityNotifications`, `universityProfile`, `graduates`, `employmentOutcomes`, existing Candidate and Employer record types.
- Produces: `UniversityNotifications()`, `UniversityProfile()`, and shared user-facing status text `University verified` for Alex Morgan's degree evidence.

- [ ] **Step 1: Write the failing integration check**

```powershell
$candidate = Get-Content -Raw 'src/data/candidate.ts'
$employer = Get-Content -Raw 'src/data/employer.ts'
if ($candidate -notmatch 'University verified') { Write-Error 'Candidate trust evidence is missing.' }
if ($employer -notmatch 'University verified') { Write-Error 'Employer trust evidence is missing.' }
```

Expected: FAIL.

- [ ] **Step 2: Build the notification center**

Follow `EmployerNotificationsCenter`: local read state, All/Unread/category filters, unread count, mark one read, and mark all read. Include the five University categories as visible text badges. The empty filtered state offers `Show all notifications`.

- [ ] **Step 3: Build the public university profile**

Follow `CompanyProfile` composition. Render institution identity, verified-institution badge, location, faculties, specialisms, aggregate graduate outcomes, and outcome coverage. Do not render names, student identifiers, employers tied to individuals, verification notes, or any other student-level record.

- [ ] **Step 4: Add the trust evidence to Candidate and Employer**

Update Alex Morgan's `Computer Science degree` fixture status and display label so Candidate Profile visibly presents `University verified` with `University of Malaya`. Add a corresponding trusted-credential summary to Alex Morgan's Employer candidate record and render it in Candidate Management.

Keep existing generic `VerificationStatus` values for behavioral status. Change the `CandidateProfile.evidence` element type to include optional `issuer?: string` and `displayStatus?: string`, then set those fields to `University of Malaya` and `University verified` on Alex's degree evidence. Extend `EmployerApplicant` with optional `verifiedCredential?: { qualification: string; institution: string; status: "University verified" }`, populate it on Alex Morgan's applicant fixture, and render it only when present. The same credential must use the same institution, qualification, and verified meaning on all three surfaces.

- [ ] **Step 5: Compose, verify, and commit**

```powershell
npx eslint src/components/features/university/university-notifications.tsx src/components/features/university/university-profile.tsx 'src/app/university/(portal)/notifications/page.tsx' 'src/app/university/(portal)/profile/page.tsx' src/types/candidate.ts src/data/candidate.ts src/data/employer.ts src/components/features/candidate/profile-overview.tsx src/components/features/employer/candidate-management.tsx
npx tsc --noEmit
git add -- src/components/features/university/university-notifications.tsx src/components/features/university/university-profile.tsx 'src/app/university/(portal)/notifications/page.tsx' 'src/app/university/(portal)/profile/page.tsx' src/types/candidate.ts src/data/candidate.ts src/data/employer.ts src/components/features/candidate/profile-overview.tsx src/components/features/employer/candidate-management.tsx
git commit -m "feat: connect university verification evidence"
```

Expected: checks exit 0.

---

### Task 9: Verify the complete MVP at source, build, browser, and accessibility levels

**Files:**
- Modify only files implicated by failures found during verification.

**Interfaces:**
- Consumes: the complete University portal and connected Candidate/Employer evidence.
- Produces: a buildable, navigable, responsive Hackathon demonstration with no known blocking errors.

- [ ] **Step 1: Run route and content regression checks**

```powershell
$routes = 'dashboard','graduates','verification','employment','insights','reports','notifications','profile'
foreach ($route in $routes) {
  $path = "src/app/university/(portal)/$route/page.tsx"
  if (-not (Test-Path -LiteralPath $path)) { throw "Missing route: $route" }
}
$shell = Get-Content -Raw 'src/components/layout/university-shell.tsx'
foreach ($target in 'dashboard','graduates','verification','employment','insights','reports','notifications','profile') {
  if ($shell -notmatch "/university/$target") { throw "Shell is missing $target" }
}
$metrics = Get-Content -Raw 'src/lib/university-metrics.ts'
if ($metrics -notmatch 'laborForce') { throw 'Employment denominator is not explicit.' }
```

Expected: no output and exit 0.

- [ ] **Step 2: Run repository checks**

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

Expected: all commands exit 0; the build output includes all `/university/*` routes.

- [ ] **Step 3: Exercise the primary desktop demonstration flow**

Start the app with `npm run dev`. At a desktop width around 1440px:

1. Open `/` and verify every University entry reaches `/university/login`.
2. Log in and confirm the portal identity and all six main navigation links.
3. Switch to Registry and approve Alex Morgan's degree; confirm success feedback and pending-count change in local state.
4. Open Candidate Profile and Employer Candidate Management in turn; confirm both display the same University of Malaya verified-degree meaning.
5. Switch University to Career Services, update one Unknown outcome to Employed, and confirm metrics change without counting Unknown as unemployed.
6. Open Insights and confirm every AI recommendation includes evidence and advisory copy.
7. Generate a report preview and confirm export actions explicitly state that no file was created.
8. Check the browser console throughout for runtime errors, hydration warnings, and broken navigation.

Expected: the complete story is understandable and no console error occurs.

- [ ] **Step 4: Exercise mobile, keyboard, and state coverage**

At widths around 375px and 768px, verify navigation wraps without horizontal overflow, statistic cards remain readable, desktop tables become record cards, action groups wrap, and panels collapse to one column.

Using only the keyboard, verify skip link, navigation, role selector, tabs, filters, forms, confirmations, and notification controls. Confirm visible focus and logical focus order. Enable reduced motion and confirm information remains available.

Trigger these states explicitly: no filter matches, no report matches, missing rejection reason, incomplete bulk verification, permission-restricted action, CSV preview, success notice, and export-preview notice.

Expected: every state explains what happened and offers a valid recovery or next action.

- [ ] **Step 5: Fix only verified failures and rerun affected checks**

For each failure, make the smallest scoped correction, rerun its focused ESLint command, then rerun `npm run lint`, `npx tsc --noEmit`, and `npm run build`. Do not refactor unrelated Candidate or Employer code.

- [ ] **Step 6: Commit final verification fixes if any**

```powershell
git status --short
$verifiedFixes = git diff --name-only --diff-filter=ACMRT
if ($verifiedFixes) {
  git add -- $verifiedFixes
  git commit -m "fix: polish university MVP verification"
}
```

If no file changed, do not create an empty commit. Record the successful command results in the implementation handoff.

## Plan Coverage Map

- Users, permissions, and role switch: Tasks 2, 4, 5, 6, and 9.
- Shared Candidate/Employer visual language: Tasks 2–8 and responsive verification in Task 9.
- Dashboard: Task 3.
- Graduate Management: Task 4.
- Verification and disputes: Task 5.
- Employment and honest denominator: Tasks 1 and 6.
- Evidence-backed curriculum insights: Task 7.
- Report preview and honest export messaging: Task 7.
- Notifications and public profile privacy: Task 8.
- Candidate–Employer–University trust loop: Tasks 1, 5, 8, and 9.
- Loading, empty, error, success, permission, confirmation, keyboard, reduced-motion, and responsive states: per-feature tasks plus Task 9.
- Explicit exclusions such as live SIS, ledger, production exports, and autonomous curriculum changes: Global Constraints, Tasks 4, 7, and 9.
