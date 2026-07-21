# University Module MVP Design

## Objective

Build a Hackathon-ready University experience that completes the CareerOS
candidate-employer-university loop. The University area serves both careers
services and registry staff through one shared product shell with role-aware
tasks and permissions.

The experience must demonstrate four connected outcomes:

1. A university imports and manages graduate records.
2. Registry staff verify academic credentials and project evidence.
3. Careers services staff track graduate employment outcomes.
4. Employer demand is translated into evidence-based curriculum insights.

## Product Position

The University module is not a standalone school reporting dashboard. It is
the trust and feedback layer between the two existing sides of CareerOS:

- Candidate profiles receive institution-backed education and achievement
  evidence.
- Employers receive more trustworthy candidate information.
- Universities receive aggregate employment outcomes and hiring-demand
  signals that can inform student support and curriculum planning.

## Users and Permissions

### Careers services

Careers services staff can:

- View graduate records and credential outcomes.
- Update employment status, employer, job title, and employment date.
- Identify graduates who need follow-up.
- View employment analysis and employer-demand insights.
- Generate and preview graduate outcome reports.

They cannot approve, reject, or otherwise modify academic verifications.

### Registry

Registry staff can:

- View and maintain student, enrolment, and course-completion information.
- Verify degrees, certificates, skills, and capstone projects.
- Review verification disputes.
- Perform valid bulk verification actions.
- View employment outcomes and curriculum insights.

They cannot modify a graduate's employment outcome.

### Shared access

Both roles can access the University Dashboard, search and view graduate
records, read notifications, view reports, and open the university public
profile.

The MVP does not require a production identity and access management system.
A role selector demonstrates the Careers Services and Registry views. The UI
must hide or disable unauthorized actions and explain why an unavailable
action cannot be performed.

## Information Architecture

The University shell uses these primary destinations:

1. **Dashboard** — institution-wide outcomes, urgent work, and recent signals.
2. **Graduates** — graduate records, profile completeness, employment status,
   and credential status.
3. **Verification** — academic verification queue and disputes.
4. **Employment** — graduate outcomes, distributions, trends, and follow-up.
5. **Insights** — employer demand, skill coverage, and curriculum suggestions.
6. **Reports** — filtered outcome reports and export demonstrations.

Notifications remain behind the header bell. The university identity area in
the header opens the university public profile, matching the Employer shell's
company-profile entry pattern.

Supporting routes are:

- University login, linked from the landing-page Universities entry.
- University notification center.
- University public profile.

## Visual and Interaction Direction

The University experience must preserve the visual language already used by
Candidate and Employer rather than introduce a third design direction.

- Reuse the CareerOS header composition, centered navigation, notification
  action, and right-aligned identity link.
- Show the institution initials, institution name, and `University` role in
  the identity area.
- Reuse the existing page-heading hierarchy, statistic-card proportions,
  borders, radii, spacing, status badges, buttons, tabs, forms, and tables.
- Continue the established responsive behavior: two-up statistic cards on
  small screens, multi-panel desktop layouts that collapse to one column, and
  record cards in place of wide tables on narrow screens.
- Preserve visible focus states, semantic headings and landmarks, accessible
  names for icon-only controls, and reduced-motion behavior.
- Keep interface copy in English to match the current application.

## Page Specifications

### University Dashboard

The page header greets the institution and provides one role-specific primary
action:

- Registry: `Review verifications`
- Careers Services: `Update graduate outcomes`

The first row contains four statistics:

- Total graduates
- Employment rate
- Pending verifications
- Average time to employment

The dashboard then presents:

- Graduate outcomes split into Employed, Seeking, Further study, Not seeking,
  and Unknown.
- An urgent verification queue.
- Employment distribution by field.
- One evidence-backed skills-gap or curriculum insight.
- Recent activity across verification and employment records.
- Upcoming tasks, including missing outcome data and verification disputes.

### Graduate Management

The page supports:

- Search by graduate name or student identifier.
- Filters for faculty, programme, graduation year, employment status, and
  verification status.
- Adding and editing a graduate record.
- A CSV bulk-import demonstration with clear validation feedback.
- Viewing a graduate's profile, evidence, employment outcome, and record
  completeness.

Each graduate summary shows name, student identifier, programme, graduation
year, profile completeness, employment status, verification status, and the
next required action.

An empty filtered result explains that no records match and provides a clear
filter-reset action. An institution with no graduate records receives an
import-or-add-first-graduate action instead.

### Verification Center

Tabs divide the workflow into Pending, Verified, Rejected, and Disputes.
Supported evidence types are:

- Degree
- Course completion
- Certificate
- Skill
- Capstone project

The review surface shows candidate details, submitted evidence, corresponding
institution records, and audit history. Registry staff can approve, reject,
or request more information. Rejection requires a reason. Bulk actions are
available only when all selected records are the same evidence type and have
the required data.

Every decision records the reviewer, timestamp, result, and note. A successful
verification changes the Candidate profile to `University verified`, exposes
the trusted status to Employer views, and reduces the dashboard's pending
count.

Disputes stay inside Verification rather than becoming a separate primary
route in the MVP.

### Employment Tracking

The page summarizes employment rate, average time to employment, unknown
outcomes, and the leading employment sector. It includes:

- Outcome trends by graduating class.
- Employment-rate comparisons by programme.
- Employer, job-title, and industry distributions.
- Graduates requiring careers-services follow-up.
- An employment-outcome update surface.

Employment status uses exactly these values:

- Employed
- Seeking
- Further study
- Not seeking
- Unknown

`Unknown` means the university lacks an outcome and must never be counted as
unemployed. Employment-rate calculations must expose their denominator and
data coverage so incomplete tracking is not presented as certainty.

### Industry and Curriculum Insights

This page aggregates Employer job and skill demand into:

- Fastest-growing roles.
- Most-requested skills.
- Employer demand by industry.
- Graduate skill coverage.
- Curriculum alignment score.
- AI-assisted curriculum recommendations.

Every recommendation must show the detected change, supporting data, affected
programme, recommended action, and confidence or data-coverage indicator. For
example, increased demand for LLM evaluation may be compared with the share
of graduates who have matching project evidence before suggesting an
elective.

Recommendations are advisory only. They do not modify curricula or start an
approval workflow.

### Reports

Users filter by graduation year, faculty, and programme before generating a
report preview. A report includes:

- Employment rate and time to employment.
- Industry and role distributions.
- Leading employers.
- Skill demand and coverage gaps.
- The data-coverage methodology and missing-outcome count.

`Export PDF` and `Export Excel` may be demonstration actions in the MVP, but
they must produce explicit success, failure, or preview-only feedback. The UI
must not imply that a file was created when no file exists.

### Notifications and University Public Profile

The notification center follows the existing Candidate and Employer pattern:
filterable notifications, unread state, mark-as-read, and mark-all-as-read.
Notification categories include verification request, dispute, missing
employment outcome, import result, and employer-demand change.

The public profile follows the Employer company-profile pattern and contains
the institution's identity, location, faculties, specialist areas, graduate
outcomes summary, and verified-institution status. Sensitive student-level
data is never shown publicly.

## Data Model and Flow

A single type-safe University fixture module is the source for institution,
staff-role, graduate, academic-evidence, verification, employment-outcome,
industry-demand, insight, report, activity, and notification records.

Feature components consume those records; App Router page files compose the
features and define route-level metadata. Client boundaries stay limited to
role switching, filters, forms, tabs, and local demonstration state.

The primary demonstration flow is:

1. University imports or opens a graduate record.
2. Registry approves the graduate's degree evidence.
3. The Candidate profile presents the evidence as University verified.
4. Employer views present the same trusted credential status.
5. Careers Services records an employment outcome.
6. University outcome metrics and distributions update.
7. Employer demand and graduate skill coverage produce a curriculum insight.
8. University previews a filtered graduate outcome report.

This is an in-memory demonstration flow unless a shared backend already exists
when implementation begins. The UI and copy must not claim live cross-system
synchronization when the prototype uses fixtures.

## States and Validation

Every core page must cover:

- Loading states that preserve the surrounding card or record shape.
- Empty states that distinguish no institution data from no filter matches.
- Recoverable error states that retain the user's filters and inputs.
- Success feedback for verification, import, and employment updates.
- Partial-data warnings and coverage percentages in analytics and reports.
- Permission explanations for role-restricted actions.
- Confirmation before graduate deletion or credential rejection.
- Disabled and submitting states that prevent duplicate actions.

Forms use visible labels and associated help or validation messages. Dynamic
success and error feedback is announced accessibly. Filters, tabs, record
actions, role selection, and confirmations must work with keyboard input.

## MVP Boundaries

The MVP includes the complete navigable University story and realistic local
interactions. It does not include:

- Production single sign-on or institution provisioning.
- Secure ledger or blockchain infrastructure.
- Live student-information-system APIs.
- A production CSV ingestion pipeline.
- A production PDF or Excel reporting service.
- Multi-stage curriculum approval workflows.
- Fine-grained faculty-level authorization.
- Autonomous AI curriculum changes.

These capabilities may be represented by honest preview states or future
integration notes, but must not be presented as operational.

## Verification Strategy

Implementation validation must include:

- Lint, TypeScript checking through the available build, and a production
  Next.js build.
- Route checks confirming every University navigation target exists.
- Source or behavior checks for the two roles' allowed and restricted actions.
- A calculation test proving Unknown outcomes are excluded from the employment
  rate rather than treated as unemployment.
- Consistency checks for verification status across University, Candidate, and
  Employer surfaces.
- Filter, empty-state, validation, and duplicate-submission checks.
- Keyboard checks for navigation, tabs, filters, forms, and role switching.
- Visual inspection at representative mobile and desktop widths for overflow,
  wrapping, focus visibility, and responsive record presentation.
- Browser console checks for runtime errors, hydration warnings, and broken
  links during the primary demonstration flow.

## Success Criteria

The University MVP is successful when a reviewer can complete the primary
demonstration flow and understand, without narration, how CareerOS connects
academic trust, candidate evidence, employer decision-making, graduate
outcomes, and curriculum feedback while retaining the established Candidate
and Employer product experience.
