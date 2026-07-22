# University Module Final Fix Report

Date: 2026-07-22
Base reviewed: `51dc3d7`
Branch: `codex/university-module`
Status: Complete

## Outcome

The final-review findings are resolved through one root-layout-scoped, in-memory demo state. University graduate records, verification records, employment outcomes, dashboards, reports, and public profile projections now read from the same state. Candidate and Employer trust displays use the same credential selector, so Alex Morgan begins `Pending` and receives the `University verified` label only after a Registry approval.

## Fixes delivered

- Added a typed `UniversityDemoState`, immutable command executor, authorization guards, metric/report selectors, audit selectors, and a centralized credential projection.
- Mounted `CareerOSDemoProvider` in the root layout so state survives App Router navigation across University, Candidate, and Employer areas during the open demo session.
- Enforced Registry-only graduate academic maintenance and verification decisions in both UI handlers and domain commands.
- Enforced Career Services-only employment updates in both the form handler and domain command.
- Removed Graduate Management's direct verification-status editor and unaudited CSV import path.
- Added audited `Pending`/`Disputed` verification decisions, complete-evidence validation, compatible batch approval, required notes, and terminal `Verified`/`Rejected` handling.
- Changed Alex's degree seed to `Pending`; Candidate and Employer surfaces no longer contain hard-coded trusted University credentials.
- Recalculated Dashboard, Reports, Profile, graduate projections, and employment analytics from live shared state.
- Corrected the Dashboard cohort label and denominator copy.
- Added an accessible native alert dialog for graduate deletion with Escape handling, safe initial focus, and focus restoration.
- Added per-graduate profile/evidence/audit/outcome details and a true zero-record recovery state.
- Kept static University Insights content server-rendered while isolating only role-dependent copy in a small client component.
- Consolidated employment and verification feedback into one visible live status region per workflow.
- Removed obsolete duplicated metric and graduate-permission modules.

## Behavior coverage

The new domain suite covers:

- Alex's initial untrusted state and Registry approval propagation to Candidate/Employer projections.
- Registry and Career Services authorization boundaries for graduate, verification, and employment mutations.
- Academic add/edit/delete behavior, linked-record cleanup, and the zero-graduate state.
- Employment detail validation and live dashboard/report recalculation.
- Valid `Pending`/`Disputed` decisions, terminal-state rejection, required audit notes, evidence completeness, and compatible/incompatible batch approval.

The source-level UI regression suite covers the persistent root provider, shared University consumers, removal of import/status editors, deletion/detail recovery surfaces, visible live feedback, centralized Candidate/Employer projection, notification tab panels, and the narrowed Insights client boundary.

## TDD evidence

RED observations recorded during implementation:

- The first domain test run failed with `ERR_MODULE_NOT_FOUND` before `university-demo-state.ts` existed.
- The added complete-evidence approval test initially failed because an incomplete record was incorrectly approved; the command guard was then added.
- The expanded UI regression suite initially reported five failures while consumers still used isolated fixtures and legacy workflows.

GREEN observations after implementation:

- `node --test tests/university-demo-state.test.mjs`: 12 passed, 0 failed.
- `node --test tests/university-ui-regressions.test.mjs`: 9 passed, 0 failed.
- Consolidated `node --test tests/*.test.mjs`: 25 passed, 0 failed.

## Fresh verification

- `node --test tests/*.test.mjs` — PASS, 25 tests, 0 failures.
- `npx tsc --noEmit` — PASS.
- Focused ESLint over every changed TypeScript/TSX source file — PASS, 0 problems.
- `npm run build` — PASS; all 40 static/SSG pages generated, including every University route plus Candidate Profile and Employer Candidates.
- Route/content composition check — PASS for University Dashboard, Graduates, Verification, Employment, Insights, Reports, Profile, Candidate Profile, Employer Candidates, and the root provider boundary.
- `git diff --check` — PASS before report generation; repeated in the final pre-commit audit.

## Known repository and environment limitations

- Repository-wide `npm run lint` remains non-zero with the accepted pre-existing unrelated baseline: 17 errors and 18 warnings in `.codex/skills` scripts, `.superpowers/sdd/task-4-add-path-check.js`, `cursor-glow.tsx`, and other untouched feature files. No changed source file reports a focused lint problem.
- The production build emits the existing multiple-lockfile/workspace-root warning; compilation and page generation still succeed.
- The in-app browser backend is unavailable, so no claim is made for live viewport, keyboard, reduced-motion, focus, or screen-reader testing. Accessibility behavior was checked through implementation review and automated source contracts only.
- The demo store intentionally persists only for the open browser session; a full reload resets seeded demo data.

## Second-round final review

Base reviewed: `9229fca`

### Additional fixes delivered

- Centralized status-specific Candidate copy in the shared credential projection. Candidate dashboard progress and the dynamic degree notification now change with the same live record that drives Candidate Profile and Employer trust.
- Added typed Candidate and Employer `graduateId` associations and removed feature-component lookup literals.
- Restored a Registry-only CSV demo with pure sample parsing and preview. The domain rejects Careers imports, validates the whole batch atomically, and creates only incomplete `Pending` degree evidence plus audit history.
- Added the explicit Registry evidence-submission transition required before a new or imported record can be approved.
- Made credential-bearing academic edits atomically reset all linked evidence to incomplete `Pending`, clear obsolete review metadata, remove downstream University trust, append a resubmission-required audit entry, and surface live feedback.
- Removed stored graduate `nextAction` data. Registry and Careers tasks plus graduate views now derive actions from current verification and employment state.
- Added disclosure relationships and focus movement/restoration for graduate details, removed duplicate product-shell skip links, and retained the single root skip link.
- Added a verification-queue empty state and derived faculty distribution from current graduate data, including newly added or imported faculties.
- Corrected the import notification so it describes the restored Pending-evidence workflow.

### Second-round TDD evidence

RED observations:

- The initial domain expansion produced five expected failures for the missing import command/parser, evidence submission, credential invalidation, and derived next-action behavior.
- Three credential-copy assertions then failed until status-specific Candidate progress and notification copy moved into the shared selector.
- A role-specific task assertion failed until Registry and Careers task projections selected actions in their own workflow context.
- Three UI contract tests failed for typed Candidate consistency, the restored Registry workflow, and derived/accessibility dashboard behavior before the UI migration.

GREEN observations:

- Focused domain suite: 17 passed, 0 failed.
- Focused UI regression suite: 12 passed, 0 failed.
- Consolidated suite: 33 passed, 0 failed.

### Second-round fresh verification

- `node --test tests/*.test.mjs` — PASS, 33 tests, 0 failures.
- `npx tsc --noEmit` — PASS.
- Focused ESLint over every changed TypeScript/TSX source and behavior-test file — PASS, 0 problems.
- `npm run build` — PASS; compilation, TypeScript validation, and all 40 static/SSG pages completed.
- Stale-value checks — PASS: no graduate fixture contains `nextAction`, no feature component embeds `graduate-alex`, and only the common root skip-link component contains the skip-link label.
- `git diff --check` — PASS before report generation and repeated during the final staged audit.

The previously documented repository-wide lint baseline, build warning, browser-backend limitation, and session-only persistence limitation remain unchanged.

## Final state-machine follow-up

Base reviewed: `a31cd40`

### Fixes delivered

- `request-information` now invalidates the submitted evidence by setting `evidenceComplete` to `false`. Approval remains blocked until Registry runs the explicit evidence-submission command, which refreshes `submittedAt`.
- Evidence submission now rejects already-complete actionable `Pending` and `Disputed` records without mutating state or duplicating audit history.
- Multi-credential aggregate status now orders actionable `Disputed`/`Pending` records first, then `Rejected`, then `Verified`. The shared Candidate/Employer projection uses the same aggregate result, so one verified record cannot mask a rejected credential or retain a stale trust label.
- Candidate notification versions now combine aggregate status with the latest credential audit timestamp. Each status transition or same-status audit event receives a new notification ID and therefore appears unread independently of earlier read state.

### TDD and verification evidence

- RED: the focused suite produced five expected failures for evidence invalidation, duplicate submission, aggregate rejection precedence, audit-version changes, and removal of the fixed notification ID.
- GREEN: focused domain suite 21 passed; focused UI regression suite 12 passed.
- `node --test tests/*.test.mjs` — PASS, 37 tests, 0 failures.
- `npx tsc --noEmit` — PASS.
- Focused ESLint over all five changed source/test files — PASS, 0 problems.
- `npm run build` — PASS; all 40 static/SSG pages generated.
- `git diff --check` — PASS before report generation and repeated in the staged audit.

The existing multiple-lockfile build warning, Node module-type test warning, unavailable browser backend, and session-only demo persistence remain unchanged.
