# University Final Review Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the University MVP's graduate, verification, and employment story one persistent, role-authorized demonstration flow whose projections update University, Candidate, and Employer surfaces.

**Architecture:** A pure `UniversityDemoState` domain module will own immutable typed commands, transition guards, audit creation, and selectors. A root-layout client provider will hold that state across App Router navigation and expose one command executor; all mutable University screens and the Candidate/Employer trust projections will consume it. Graduate academic data, verification records, and employment outcomes remain separate sources of truth, with status and metrics derived by selectors.

**Tech Stack:** Next.js 16 App Router, React 19 context/state, strict TypeScript, Tailwind CSS 4, existing shadcn/ui primitives, Node's built-in test runner, ESLint, and the existing npm scripts. Add no dependency.

## Global Constraints

- Alex Morgan's degree starts `Pending`; only a valid Registry verification command can make downstream surfaces say `University verified`.
- Career Services may update employment outcomes only; Registry owns graduate academic maintenance and verification decisions.
- `Verified` and `Rejected` verification records are terminal in the MVP; only `Pending` and `Disputed` records can be decided.
- Graduate verification status is derived from verification records and cannot be edited in Graduate Management.
- State must persist across client route navigation by living above Candidate, Employer, and University layouts.
- Dynamic feedback must be visible and live-announced without duplicate announcements.
- Do not add a browser-test dependency or change unrelated baseline lint files.

---

### Task 1: Pure demo state, commands, and projections

**Files:**
- Modify: `src/types/university.ts`
- Modify: `src/data/university.ts`
- Create: `src/lib/university-demo-state.ts`
- Delete: `src/lib/graduate-management-permissions.ts`
- Test: `tests/university-demo-state.test.mjs`

**Interfaces:**
- Produces: `UniversityDemoState`, `UniversityCommand`, `UniversityCommandResult`, `createUniversityDemoState(seed)`, `executeUniversityCommand(state, command)`, `selectGraduateVerificationStatus(state, graduateId)`, `selectCredentialProjection(state, graduateId)`, `selectNormalizedEmploymentOutcomes(state)`, `selectDashboardProjection(state)`, `selectReportProjection(state, filters)`, and `selectVerificationAudit(state, recordId)`.
- Commands: `graduate/add`, `graduate/update-academic`, `graduate/delete`, `employment/update`, `verification/decide`, and `verification/bulk-approve`.

- [x] **Step 1: Write behavior tests first**

  Add Node tests proving initial Alex trust is pending, Careers cannot mutate academic/verification state, Registry cannot mutate employment, valid Registry approval creates audit state and trust projection, terminal/invalid transitions fail without mutation, compatible bulk approval succeeds, employment updates recalculate dashboard/report projections, and graduate add/update/delete obey ownership.

- [x] **Step 2: Run the focused test and capture RED**

  Run: `node --test tests/university-demo-state.test.mjs`

  Expected: failure because `src/lib/university-demo-state.ts` and its requested API do not exist.

- [x] **Step 3: Implement the minimal pure domain**

  Use a discriminated command union and `{ ok: true, state, message } | { ok: false, state, error }` result. Clone seed arrays, validate role and record existence at every command boundary, derive statuses rather than storing them on graduates, validate complete employed outcomes, and append deterministic audit/activity entries using timestamps supplied by commands.

- [x] **Step 4: Run focused tests to GREEN, then refactor**

  Run: `node --test tests/university-demo-state.test.mjs`

  Expected: all domain behavior tests pass with no warnings.

### Task 2: Root-persistent provider and consumer propagation

**Files:**
- Create: `src/components/common/careeros-demo-provider.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/features/university/university-role-context.tsx`
- Modify: `src/components/layout/university-shell.tsx`
- Modify: `src/components/features/university/university-dashboard.tsx`
- Modify: `src/components/features/university/university-dashboard-role-content.tsx`
- Modify: `src/components/features/university/university-profile.tsx`
- Modify: `src/components/features/university/university-reports.tsx`
- Modify: `src/components/features/candidate/profile-overview.tsx`
- Modify: `src/components/features/employer/candidate-management.tsx`
- Modify: `src/data/candidate.ts`
- Modify: `src/data/employer.ts`
- Modify: `src/types/candidate.ts`
- Test: `tests/university-ui-regressions.test.mjs`

**Interfaces:**
- Consumes: Task 1's pure state, command executor, and selectors.
- Produces: `useCareerOSDemo()` returning `{ state, execute }`; all trust and aggregate UI derives from its current state.

- [x] **Step 1: Add source/contract regression checks and capture RED**

  Assert the root layout owns `CareerOSDemoProvider`, University aggregate components consume the provider, Candidate/Employer no longer contain hard-coded `University verified` fixture data, and role-independent Insights content is split from the client role message.

- [x] **Step 2: Implement the root provider and migrate consumers**

  Seed once from University fixtures, keep a ref synchronized for command results, wrap root children, remove the nested role provider, and recalculate Dashboard, Reports, Profile, Candidate, and Employer projections on every state change.

- [x] **Step 3: Run domain and UI checks to GREEN**

  Run: `node --test tests/university-demo-state.test.mjs tests/university-ui-regressions.test.mjs`

### Task 3: Authorized graduate, verification, and employment workflows

**Files:**
- Modify: `src/components/features/university/graduate-management.tsx`
- Modify: `src/components/features/university/verification-center.tsx`
- Modify: `src/components/features/university/employment-tracking.tsx`

**Interfaces:**
- Consumes: `useCareerOSDemo()` and Task 1 commands/selectors.
- Produces: Registry-only academic add/edit/delete, Careers-only outcome editing, guarded verification decisions, visible/live feedback, graduate details, and native modal deletion confirmation.

- [x] **Step 1: Add failing ownership/transition source checks where pure tests cannot cover UI exposure**

  Verify CSV/import and direct credential-status controls are absent, unauthorized mutation controls are not rendered, terminal records have no decision form, feedback has one visible live region, and the zero-record state offers a role-appropriate recovery.

- [x] **Step 2: Migrate Graduate Management**

  Remove import and direct employment/verification editing; Registry gets academic add/edit/delete through typed commands. Add a details disclosure/surface showing profile, verification evidence, audit notes, and outcome data. Use a native modal `<dialog role="alertdialog">` with labelled text, initial focus, Escape behavior, and focus restoration for deletion.

- [x] **Step 3: Migrate Verification Center**

  Read records/audit from shared state, use typed decision commands, restrict controls to Registry and eligible states, surface validation/success text in one visible `role="status"` region, and keep batch selection synchronized after transitions.

- [x] **Step 4: Migrate Employment Tracking**

  Read shared graduates/outcomes, dispatch the Careers-only outcome command, show Registry as read-only, and retain one visible live feedback region.

- [x] **Step 5: Run focused tests to GREEN**

  Run: `node --test tests/university-demo-state.test.mjs tests/university-ui-regressions.test.mjs`

### Task 4: Minor review items, verification, report, and commit

**Files:**
- Modify: `src/components/features/university/university-insights.tsx`
- Modify: `src/app/university/(portal)/insights/page.tsx`
- Modify: `.superpowers/sdd/final-fix-report.md`

**Interfaces:**
- Consumes: completed shared-state architecture.
- Produces: server-rendered static Insights with only role-dependent copy in a small client component, accurately labelled all-cohort dashboard distribution, and final RED/GREEN evidence.

- [x] **Step 1: Narrow the Insights client boundary and correct aggregate copy**

  Keep demand calculations and static panels in a Server Component; isolate only the role label/description in a small client component. Label dashboard outcome bars as all tracked cohorts and describe the bar denominator as all normalized outcomes.

- [x] **Step 2: Run fresh full verification**

  Run the full Node suite, focused ESLint over every changed source file, `npx tsc --noEmit`, `npm run build`, explicit route/content checks, `git diff --check`, and repository-wide `npm run lint` only to document its accepted pre-existing failures accurately.

- [x] **Step 3: Self-review against every finding**

  Inspect the final diff for role bypasses, stale fixture reads, hard-coded trust language, duplicated live regions, and unrelated changes. Re-run any affected focused checks after corrections.

- [x] **Step 4: Append the final fix report and commit**

  Record commands, exit statuses, RED/GREEN evidence, known browser-QA limitation, and repository-wide lint baseline in `.superpowers/sdd/final-fix-report.md`; then stage only scoped files and commit once with `fix: connect university demo state`.
