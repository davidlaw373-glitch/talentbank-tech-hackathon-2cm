# Employer Company Profile Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate Company Profile access into the Meridian Byte Labs header identity link.

**Architecture:** The existing `EmployerShell` owns every employer header. Replace the Company profile navigation button with a semantic Next.js link around the existing company identity content, preserving the header structure and valid `/employer/company` destination.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Lucide icons, shadcn/ui Button and Badge.

## Global Constraints

- Modify only `src/components/layout/employer-shell.tsx`.
- Retain Dashboard and Jobs navigation entries.
- Remove the Company profile primary-navigation entry and its unused icon import.
- Keep `/employer/company` as the target of the accessible company identity link.
- Preserve focus visibility and do not change notification behavior.

---

### Task 1: Consolidate the Company Profile navigation entry

**Files:**
- Modify: `src/components/layout/employer-shell.tsx:1-59`
- Test: source-level assertion against `src/components/layout/employer-shell.tsx`

**Interfaces:**
- Produces a single `<Link href="/employer/company">` containing `employerCompany.initials`, `employerCompany.name`, and the Employer label.
- Produces a primary navigation with Dashboard and Jobs only.

- [ ] **Step 1: Run the failing desired-state check**

```powershell
$shell = Get-Content -Raw 'src/components/layout/employer-shell.tsx'
if ($shell -match 'Building2') {
  throw 'Company profile is still rendered in primary navigation.'
}
if ($shell -notmatch '<Link href="/employer/company"') {
  throw 'Company identity is not linked to Company Profile.'
}
```

Expected: FAIL because the existing primary navigation renders Company profile and the identity control is a `div`.

- [ ] **Step 2: Replace the duplicate navigation entry with the identity link**

```tsx
<Link
  href="/employer/company"
  aria-label={`Open ${employerCompany.name} company profile`}
  className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
>
  <Badge variant="secondary" aria-hidden>{employerCompany.initials}</Badge>
  <span className="text-left">
    <span className="block text-sm font-medium leading-tight">{employerCompany.name}</span>
    <small className="block leading-tight">Employer</small>
  </span>
</Link>
```

Remove the `Building2` import and the Company profile `Button` from the primary navigation.

- [ ] **Step 3: Run focused verification**

```powershell
$shell = Get-Content -Raw 'src/components/layout/employer-shell.tsx'
if ($shell -match 'Building2') { throw 'Company profile is still rendered in primary navigation.' }
if ($shell -notmatch 'aria-label=\{`Open \$\{employerCompany\.name\} company profile`\}') { throw 'Company identity link lacks its accessible name.' }
npx eslint src/components/layout/employer-shell.tsx
npm run build
```

Expected: desired-state assertions, ESLint, and the production build all exit successfully.

- [ ] **Step 4: Commit**

```powershell
git add -- 'src/components/layout/employer-shell.tsx'
git commit -m "fix: consolidate employer company profile entry"
```

## Plan self-review

- Spec coverage: the sole task removes the duplicate navigation item, adds the requested identity link, preserves Dashboard, Jobs, notification behavior, and focus treatment.
- Placeholder scan: no unspecified behavior remains.
- Type consistency: `employerCompany` is already consumed by `EmployerShell`; no new public interfaces are introduced.
