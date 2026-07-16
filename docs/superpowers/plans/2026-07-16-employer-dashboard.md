# Employer Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, responsive Employer Dashboard at `/employer/dashboard` for Meridian Byte Labs, consistent with the Candidate Dashboard and limited to employer dashboard capabilities.

**Architecture:** Type-safe static recruiting fixtures in `src/data/employer.ts` feed a feature-specific overview component. An employer shell supplies the same CareerOS header and accessible landmarks as the candidate shell, but exposes only existing employer routes. App Router route and layout files compose these pieces without client-side state or new dependencies.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn/ui primitives, Lucide icons, ESLint.

## Global Constraints

- Create only the Employer Dashboard route; do not implement login, registration, or additional employer management routes.
- Use fictional static data for Meridian Byte Labs, a Kuala Lumpur software company.
- Match the Candidate Dashboard's cards, muted icon wells, `lift-on-hover`, typography, spacing, badges, and responsive grid behavior.
- Keep every navigation target valid; inactive future controls are disabled and labelled as unavailable.
- Do not add dependencies or alter candidate functionality.
- On small screens, metric cards use two columns and analytical sections stack; on large screens, primary panels may span two of three columns.

---

## File Structure

- Create: `src/data/employer.ts` — domain types and static company, metric, pipeline, candidate, interview, role, activity, and notification data.
- Create: `src/components/layout/employer-shell.tsx` — CareerOS employer header, disabled future controls, and `main` landmark.
- Create: `src/components/features/employer/employer-dashboard-overview.tsx` — data-driven dashboard UI.
- Create: `src/app/employer/layout.tsx` — wraps employer routes with `EmployerShell`.
- Create: `src/app/employer/dashboard/page.tsx` — composes `EmployerDashboardOverview`.

### Task 1: Add typed Employer Dashboard fixtures

**Files:**
- Create: `src/data/employer.ts`
- Test: source-level check against `src/data/employer.ts`

**Interfaces:**
- Produces `employerCompany`, `employerStats`, `recruitmentPipeline`, `shortlistedCandidates`, `upcomingInterviews`, `openRoles`, `employerActivity`, and `employerNotifications` for the dashboard component.
- `recruitmentPipeline` contains exactly the ordered stages `Applied`, `Screening`, `Interview`, `Offer`, and `Hired`.

- [ ] **Step 1: Write the failing fixture check**

```powershell
$dataPath = 'src/data/employer.ts'
if (-not (Test-Path $dataPath)) {
  throw 'Employer dashboard fixture module is missing.'
}
$data = Get-Content -Raw $dataPath
foreach ($stage in 'Applied', 'Screening', 'Interview', 'Offer', 'Hired') {
  if ($data -notmatch "stage: `"$stage`"") {
    throw "Missing pipeline stage: $stage"
  }
}
```

Expected: FAIL because the fixture module does not yet exist.

- [ ] **Step 2: Implement the typed fixture module**

```ts
export type PipelineStage = "Applied" | "Screening" | "Interview" | "Offer" | "Hired";

export const employerCompany = {
  name: "Meridian Byte Labs",
  initials: "MB",
  industry: "Software engineering · Kuala Lumpur, Malaysia",
};

export const recruitmentPipeline: { stage: PipelineStage; count: number }[] = [
  { stage: "Applied", count: 48 },
  { stage: "Screening", count: 21 },
  { stage: "Interview", count: 9 },
  { stage: "Offer", count: 3 },
  { stage: "Hired", count: 2 },
];
```

Complete this file with static, typed arrays for four stats, three shortlisted candidates, two interviews, three active roles, three activity items, and three notifications. Each shortlist record includes `name`, `role`, `experience`, `stage`, `fit`, and `skills`; each role includes `title`, `location`, `applications`, `inProgress`, and `status`.

- [ ] **Step 3: Run the fixture check**

Run: the PowerShell code from Step 1.

Expected: exits successfully and finds all five required recruitment stages.

- [ ] **Step 4: Lint the fixture module**

Run: `npx eslint src/data/employer.ts`

Expected: exits with code 0.

- [ ] **Step 5: Commit the fixtures**

```powershell
git add -- 'src/data/employer.ts'
git commit -m "feat: add employer dashboard data"
```

### Task 2: Add the employer route shell

**Files:**
- Create: `src/components/layout/employer-shell.tsx`
- Create: `src/app/employer/layout.tsx`
- Test: source-level check against `src/components/layout/employer-shell.tsx`

**Interfaces:**
- Consumes `employerCompany` from `@/data/employer`.
- Produces `EmployerShell({ children }: { children: React.ReactNode })`, wrapping employer route content in `main#main-content`.

- [ ] **Step 1: Write the failing shell check**

```powershell
$shellPath = 'src/components/layout/employer-shell.tsx'
if (-not (Test-Path $shellPath)) {
  throw 'Employer shell is missing.'
}
$shell = Get-Content -Raw $shellPath
foreach ($expected in 'aria-label="Main navigation"', 'href="/employer/dashboard"', 'id="main-content"') {
  if ($shell -notmatch [regex]::Escape($expected)) {
    throw "Employer shell is missing: $expected"
  }
}
```

Expected: FAIL because the shell does not yet exist.

- [ ] **Step 2: Implement the employer shell and layout**

```tsx
export function EmployerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <a href="#main-content" className="sr-only focus:not-sr-only">Skip to main content</a>
      <header className="border-b">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" aria-label="CareerOS home"><h2>CareerOS</h2></Link>
          <nav className="flex flex-wrap items-center gap-1" aria-label="Main navigation">
            <Button asChild variant="ghost"><Link href="/employer/dashboard"><LayoutDashboard />Dashboard</Link></Button>
          </nav>
        </div>
      </header>
      <Separator />
      <main id="main-content" className="container mx-auto p-4 sm:p-6">{children}</main>
    </div>
  );
}
```

Use the Candidate Shell's full skip-link focus classes and header density. Add a disabled notifications button with `aria-describedby` text `Notifications are not available in this dashboard preview.` Add an accessible, non-link company identity group showing the MB badge, `Meridian Byte Labs`, and `Employer`. In `src/app/employer/layout.tsx`, wrap `children` in `EmployerShell`.

- [ ] **Step 3: Run the shell check and lint**

Run:

```powershell
npx eslint src/components/layout/employer-shell.tsx src/app/employer/layout.tsx
```

Expected: shell check passes and ESLint exits with code 0.

- [ ] **Step 4: Commit the shell**

```powershell
git add -- 'src/components/layout/employer-shell.tsx' 'src/app/employer/layout.tsx'
git commit -m "feat: add employer application shell"
```

### Task 3: Build the Employer Dashboard overview and route

**Files:**
- Create: `src/components/features/employer/employer-dashboard-overview.tsx`
- Create: `src/app/employer/dashboard/page.tsx`
- Test: source-level check against `src/app/employer/dashboard/page.tsx` and the overview component

**Interfaces:**
- Consumes all exports from `@/data/employer` and shared `Badge`, `Button`, and `Card` components.
- Produces `EmployerDashboardOverview()`, rendered by the `/employer/dashboard` route.

- [ ] **Step 1: Write the failing route and overview check**

```powershell
$pagePath = 'src/app/employer/dashboard/page.tsx'
$overviewPath = 'src/components/features/employer/employer-dashboard-overview.tsx'
if (-not (Test-Path $pagePath) -or -not (Test-Path $overviewPath)) {
  throw 'Employer Dashboard route or overview component is missing.'
}
$page = Get-Content -Raw $pagePath
$overview = Get-Content -Raw $overviewPath
if ($page -notmatch 'EmployerDashboardOverview') { throw 'Route must render EmployerDashboardOverview.' }
foreach ($heading in 'Recruitment pipeline', 'Shortlisted candidates', 'Upcoming interviews', 'Active roles', 'Notifications') {
  if ($overview -notmatch [regex]::Escape($heading)) { throw "Missing dashboard section: $heading" }
}
```

Expected: FAIL because the route and overview component do not yet exist.

- [ ] **Step 2: Implement the Employer Dashboard UI**

```tsx
export function EmployerDashboardOverview() {
  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Employer dashboard</p>
          <h1>Good morning, Meridian Byte Labs</h1>
          <p className="text-muted-foreground">Keep your hiring pipeline moving with a clear view of roles and people.</p>
        </div>
        <Button disabled aria-describedby="post-job-unavailable">Post a job</Button>
        <p id="post-job-unavailable" className="sr-only">Job management is not available in this dashboard preview.</p>
      </section>
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">{/* four metric cards */}</section>
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">{/* pipeline spans two columns; hiring pulse occupies one */}</section>
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">{/* candidate shortlist spans two columns; interviews occupies one */}</section>
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">{/* active roles spans two columns; activity and notifications are rendered in the remaining column */}</section>
    </div>
  );
}
```

Map `employerStats` to Candidate-Dashboard-style card contents with an icon well, prominent tabular value, label, and delta. Render pipeline stages as text-labelled progress bars whose widths are calculated from the highest stage count. Render candidates and roles as non-link card rows with status badges and skill badges. Render interview entries with a `CalendarClock` icon and date/time. Render activity and notifications as labelled chronological lists. Use `lift-on-hover` only on non-interactive cards and add no links to unimplemented routes.

In `src/app/employer/dashboard/page.tsx`:

```tsx
import { EmployerDashboardOverview } from "@/components/features/employer/employer-dashboard-overview";

export default function EmployerDashboardPage() {
  return <EmployerDashboardOverview />;
}
```

- [ ] **Step 3: Run the route and overview check**

Run: the PowerShell code from Step 1.

Expected: exits successfully and finds all five required dashboard sections.

- [ ] **Step 4: Lint the route and feature component**

Run:

```powershell
npx eslint src/components/features/employer/employer-dashboard-overview.tsx src/app/employer/dashboard/page.tsx
```

Expected: exits with code 0.

- [ ] **Step 5: Run the production build**

Run: `npm run build`

Expected: Next.js exits with code 0 and includes `/employer/dashboard` in the generated route output.

- [ ] **Step 6: Inspect the local dashboard**

At `http://localhost:3000/employer/dashboard`, inspect desktop and mobile widths. Confirm the header has only valid routes, the four metric cards remain two-up on mobile, wide panels stack on mobile, all six Employer Dashboard capabilities from `context.txt` are visible, and disabled controls do not navigate.

- [ ] **Step 7: Commit the dashboard**

```powershell
git add -- 'src/components/features/employer/employer-dashboard-overview.tsx' 'src/app/employer/dashboard/page.tsx'
git commit -m "feat: add employer dashboard"
```

## Plan self-review

- Spec coverage: Task 1 supplies employer recruiting, job, application, offer, candidate-list, and notification data; Task 2 supplies a scoped employer shell; Task 3 renders every dashboard surface, responsive layout, disabled future controls, and the route.
- Placeholder scan: no deferred implementation markers or unspecified behavior remain.
- Type consistency: `EmployerDashboardOverview` consumes the named fixture exports from `src/data/employer.ts`, and the route imports the same exported component name.
