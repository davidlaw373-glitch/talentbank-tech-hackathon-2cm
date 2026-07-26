# Employer Interview Calendar Design

## Goal

Replace the employer interview overview's scheduling button with an entry to a
calendar dedicated to scheduled interviews. Employers can browse by year,
month, and date and see each scheduled candidate's name, role, and interview
time on the corresponding day.

## Recommended Approach

Create a dedicated `/employer/interviews/calendar` route and keep the overview
focused on priority work. This is preferable to embedding a large calendar in
the overview because it preserves the overview's scan-friendly hierarchy. It is
also preferable to adding a calendar dependency because the required month grid,
navigation, and event grouping are small and deterministic with native date
utilities.

## Overview Entry

The `Schedule interview` button in the employer interview overview becomes a
`Scheduled calendar` link with a calendar icon. It navigates to the dedicated
calendar route. The overview's statistics, Priority interviews section, and
View all interviews entry remain unchanged.

The overview no longer opens the scheduling dialog from its heading. The
existing dialog component can remain available for future use, but it is not
rendered by the overview.

## Calendar Page

The page uses the calm product-surface register and follows the All interviews
toolbar pattern.

The header contains:

- A back control to `/employer/interviews`.
- A title and short explanation.
- A `Today` button.
- Previous-month and next-month controls.
- A labelled year selector.
- A labelled month selector.

The main calendar is a seven-column month grid starting on Monday. Leading and
trailing days from adjacent months remain visible with muted styling so week
rows stay complete. The current date receives a clear labelled marker, and the
selected date uses a distinct border/background state that does not rely on
color alone.

Each scheduled event displays:

- Candidate name.
- Job title.
- Local interview time.

Desktop date cells show this information directly. Multiple interviews stack
vertically. Cells with more events than the display limit show a `+N more`
control that selects the date and exposes the complete agenda beneath the grid.

On mobile, the calendar remains a seven-column grid but uses compact event
markers to protect legibility. Selecting a date reveals a full-width daily
agenda below the grid with candidate, role, interview type, time, duration, and
interviewers.

The daily agenda also appears on desktop for the selected date, providing a
stable detailed view and keyboard target.

## Data Model

`Interview` gains a required ISO 8601 `scheduledAt` field, for example:

```ts
scheduledAt: "2026-07-27T10:00:00+08:00"
```

`scheduledAt` is the source of truth for calendar grouping, sorting, month
navigation, and local time formatting. The existing `scheduledFor` field remains
as concise product copy used by interview list rows.

All interview fixtures and locally generated seed interviews receive concrete
dates. The schedule dialog also produces `scheduledAt` when used, so newly
created interviews satisfy the same contract.

Calendar grouping uses the employer workspace time zone, `Asia/Singapore`, so
the date remains stable regardless of the browser's device time zone.

## Component Boundaries

- `interview-calendar-data.ts` owns pure date keys, month-grid generation,
  event filtering, grouping, and display formatting.
- `interview-calendar.tsx` owns calendar navigation, selected-date state, grid
  semantics, and responsive event presentation.
- `/employer/interviews/calendar/page.tsx` is a small route composition.
- `interview-overview.tsx` only changes its heading action from a button to the
  calendar link.

No new dependency is introduced.

## Interaction and Accessibility

- Month navigation buttons have explicit accessible names.
- Year and month selectors have visible labels.
- Each date cell is a button with a full accessible date label and an event
  count.
- Events remain represented in the daily agenda, ensuring compact mobile
  markers do not hide information from assistive technology.
- Keyboard users can select dates and reach every navigation control.
- Focus states use existing shared control behavior.
- The page does not rely on hover or animation for information.
- Status filtering is explicit: only `Scheduled` interviews appear.

## Empty and Edge States

- Months with no scheduled interviews show the full navigable grid and an empty
  daily agenda message.
- Dates outside the active month remain selectable.
- Year selection covers a bounded range from five years before through five
  years after the current calendar year.
- Invalid or missing dates are excluded by the calendar data helper. The
  required TypeScript field prevents new typed fixtures from omitting dates.

## Verification

- Pure tests cover Monday-first month generation, Scheduled-only filtering,
  date grouping, and stable Singapore date keys.
- Component tests cover navigation, year/month selection, date selection, event
  content, and empty agendas.
- Type-check, lint, full tests, and production build run after implementation.
- Browser review covers desktop and 390px mobile layouts, keyboard focus,
  overflow, console errors, and month navigation.

## Out of Scope

- Editing, dragging, or resizing calendar events.
- Week/day timeline views.
- External calendar synchronization.
- Recurring interviews.
- New scheduling workflows.
