# University Final Review Round Two Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan inline. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the remaining University demo consistency, audited import/evidence, credential invalidation, derived-action, and accessibility findings in one test-driven commit.

**Architecture:** Extend the existing pure `UniversityDemoState` command boundary instead of adding a second store. CSV parsing stays pure; imports, evidence submission, and academic edits all pass through role-authorized immutable commands. Candidate, Employer, University tasks, notifications, and progress consume typed graduate associations and selectors from the shared state.

**Tech Stack:** Next.js App Router, React, strict TypeScript, Tailwind/shadcn, Node test runner, ESLint. No dependency changes.

## Global Constraints

- Registry alone may import graduate academics, submit evidence, and decide verification.
- Imported credentials start `Pending` and incomplete; no import path can create `Verified` evidence.
- Credential-impacting academic edits atomically remove downstream trust, require evidence resubmission, and append audit history.
- `nextAction` is derived from current verification and employment state.
- Keep one root skip link and visible live workflow feedback.
- Do not edit unrelated files.

---

### Task 1: Domain behavior and typed associations

**Files:**
- Modify: `tests/university-demo-state.test.mjs`
- Modify: `src/types/university.ts`
- Modify: `src/lib/university-demo-state.ts`
- Modify: `src/lib/university-demo-state.ts` (including the pure CSV parser)
- Modify: `src/types/candidate.ts`
- Modify: `src/data/candidate.ts`
- Modify: `src/data/employer.ts`

**Interfaces:**
- Produces `GraduateId`, `graduate/import`, `verification/submit-evidence`, `parseGraduateCsv`, and `selectGraduateNextAction`.
- Academic updates receive command metadata and invalidate affected evidence atomically.

- [x] **Step 1: Add failing tests for typed import authorization, Pending imported evidence, evidence submission, credential invalidation, and derived next actions.**
- [x] **Step 2: Run the focused domain suite and confirm failures describe the missing behaviors.**
- [x] **Step 3: Implement the minimal typed commands, selector, parser, and associations.**
- [x] **Step 4: Run the focused domain suite to green and refactor without changing behavior.**

### Task 2: Candidate and Employer consistency

**Files:**
- Modify: `tests/university-ui-regressions.test.mjs`
- Modify: `src/components/features/candidate/dashboard-overview.tsx`
- Modify: `src/components/features/candidate/profile-overview.tsx`
- Modify: `src/components/features/notifications/notifications-center.tsx`
- Modify: `src/data/notifications.ts`
- Modify: `src/components/features/employer/candidate-management.tsx`

**Interfaces:**
- Consumes typed `candidateProfile.graduateId` / `EmployerApplicant.graduateId` and `selectCredentialProjection`.
- Produces dynamic Candidate verification notification and dashboard progress copy before and after approval.

- [x] **Step 1: Add failing source contracts for selector-derived notification/progress and removal of magic graduate literals.**
- [x] **Step 2: Run the UI regression suite and confirm red.**
- [x] **Step 3: Migrate notification, progress, profile, and Employer trust lookup to typed shared associations.**
- [x] **Step 4: Run domain and UI suites to green.**

### Task 3: Registry import, evidence submission, and derived University UI

**Files:**
- Modify: `src/components/features/university/graduate-management.tsx`
- Modify: `src/components/features/university/verification-center.tsx`
- Modify: `src/components/features/university/university-dashboard.tsx`
- Modify: `src/components/layout/candidate-shell.tsx`
- Modify: `src/components/layout/university-shell.tsx`
- Modify: `src/data/university.ts`

**Interfaces:**
- Graduate Management parses/previews a built-in CSV sample, guards the Careers handler, and dispatches `graduate/import`.
- Verification Center dispatches `verification/submit-evidence` before approval.
- Graduate details and tasks render `selectGraduateNextAction`.

- [x] **Step 1: Add failing UI contracts for import, submit evidence, detail disclosure/focus, one skip link, queue empty state, and dynamic faculties.**
- [x] **Step 2: Run UI tests and confirm red.**
- [x] **Step 3: Implement the authorized workflows, accessible detail disclosure, dashboard states, and corrected import notification.**
- [x] **Step 4: Run focused suites and TypeScript; correct only scoped regressions.**

### Task 4: Verification, report, and commit

**Files:**
- Modify: `.superpowers/sdd/final-fix-report.md`
- Modify: this plan checklist

- [x] **Step 1: Run the full Node suite, TypeScript, focused ESLint, production build, route/content checks, and diff check.**
- [x] **Step 2: Self-review every second-round finding and stale literal/import search.**
- [x] **Step 3: Append RED/GREEN evidence and limitations to the final fix report.**
- [x] **Step 4: Stage scoped files, verify the staged diff, commit once, and confirm a clean worktree.**
