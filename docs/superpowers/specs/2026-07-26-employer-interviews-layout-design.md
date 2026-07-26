# Employer Interviews Layout Alignment

## Goal

Align the employer interviews experience with the newly refined employer jobs
experience while preserving interview-specific workflows. The result should feel
like two parts of the same CareerOS employer workspace, without introducing job
preview or resume-preview concepts into interviews.

## Information Architecture

The interviews experience will use the same overview-and-management split as
jobs:

- `/employer/interviews` is the overview. It shows the status summary, the
  highest-priority interviews, and the primary scheduling action.
- `/employer/interviews/all` is the complete management view. It provides search,
  status and interview-type filters, and all status-specific interview actions.

The overview links to the complete management view with a dedicated
`View all interviews` action. The complete management view includes a back
control to the overview.

## Overview Page

The overview page keeps the existing page heading, supporting description,
`Schedule interview` action, and four interview-status counts.

The priority section will match the jobs overview composition:

- A section heading and short explanation appear above the list.
- `View all interviews` appears on the section heading row and uses the same
  warm highlight treatment as `View all jobs`.
- Interviews render as individual `lift-on-hover` cards.
- The current fixed-height outer card, nested inset panel, and internal vertical
  scrollbar are removed.
- Rows remain sorted by interview status priority.
- Each row presents candidate, role, interview type, interviewers, schedule,
  duration, scorecard count, and current status without becoming visually dense.
- Overview actions remain focused on the most immediate work: scheduled
  interviews can be joined or rescheduled. Complete and destructive management
  actions belong to the all-interviews view.

The empty state explains that no priority interviews are available and provides
a useful scheduling next action where appropriate.

## All Interviews Page

The complete management view follows the same structure as
`/employer/jobs/all`:

- A top toolbar contains a back control and responsive filters.
- Filters include candidate/role/interviewer search, interview status, and
  interview type.
- A result heading reports the number of matching interviews.
- Results render as full-width cards with stronger boundaries and clear grouping
  of identity, schedule metadata, status, and actions.

Status-specific actions remain available:

- Scheduled: Join, Reschedule, View notes, Cancel.
- Pending confirmation: Confirm, Reschedule, Cancel.
- Reschedule requested: Propose new slot, View notes, Cancel.
- Completed: View notes.
- Cancelled: View details.

Cancelling continues to use a confirmation dialog. Existing toast feedback is
preserved. No resume preview, job-posting preview, or document-preview surface
is added.

## Component Boundaries

Shared interview data setup, status configuration, row presentation, scheduling
dialog, and action helpers will live under the employer feature area rather than
being duplicated across route files.

Route pages will remain small composition boundaries:

- The overview route composes the overview experience.
- The all-interviews route composes the management experience.

The implementation will reuse existing CareerOS tokens, typography utilities,
buttons, badges, cards, dialogs, and motion classes. No new dependency is
required.

## State and Data Flow

Both views use the existing employer interview fixtures and helper types. User
actions update the currently rendered client-side collection and produce the
existing toast feedback.

The prototype does not add persistence across a full route navigation. This
matches the current local fixture-driven jobs implementation and avoids
introducing a new global state or backend boundary outside the requested scope.

## Responsive and Accessibility Requirements

- The toolbar and row layouts collapse cleanly at small widths.
- Long candidate, role, and interviewer names wrap or truncate without pushing
  actions out of the viewport.
- All icon-only controls have accessible names.
- List and filter regions retain useful labels.
- Focus rings remain visible, and actions are keyboard operable.
- Hover motion uses the existing motion system and respects reduced-motion
  preferences.
- Status is communicated with text as well as color.

## Empty and Error Handling

The overview and complete management view each provide a contextual empty state.
Because data is local and synchronous, no new network loading or error state is
needed. Existing dialogs continue to guard destructive cancellation.

## Verification

Implementation verification will include:

- Focused component tests for priority-row behavior and all-view filters/actions.
- Project lint, type-check, and relevant test commands.
- Browser review of overview and all-interviews views at desktop and mobile
  widths.
- Keyboard focus, overflow, console-error, and reduced-motion checks.

## Out of Scope

- Resume preview or document preview.
- Changes to candidate, jobs, offers, or university surfaces.
- Backend persistence, calendar integration, or real meeting links.
- A generic cross-domain management-page framework.
