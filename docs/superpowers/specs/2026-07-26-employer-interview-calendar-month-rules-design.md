# Employer Interview Calendar Month Rules Design

## Goal

Make the employer interview calendar show only dates from the viewed month,
keep date selection independent from month browsing, make every date cell the
same height, and give the calendar workspace and Selected date section one new
shared background color.

## Current Causes

- `getMonthDays` returns 42 real dates including leading and trailing dates from
  adjacent months, and the component renders every entry as an interactive
  gridcell.
- `setMonth` changes both the viewed month and `selectedDate`, so browsing
  replaces the user's explicit date selection.
- CSS Grid row sizing is content-driven. Rows containing scheduled event tiles
  grow taller than rows containing only dates.
- Calendar and Selected date currently use different existing surface colors.

## Month-Only Grid

Retain the stable Monday-first 7×6 calendar structure. Leading and trailing
positions remain as layout placeholders so weekday alignment and overall
calendar height do not jump between months.

For a placeholder outside the viewed month:

- Render an inert, `aria-hidden` element rather than a button.
- Do not show a date number, event count, event tile, today marker, selection,
  hover state, or focus state.
- Use the same base cell surface and divider treatment as an empty date cell.

Only the viewed month's 28–31 dates are exposed as interactive gridcells.

## Selection and Browsing

`viewYear` and `viewMonth` describe which calendar page is visible.
`selectedDate` describes the last date explicitly selected by the user.

Previous/next navigation and year/month selectors update only `viewYear` and
`viewMonth`. They never change `selectedDate`.

Consequences:

- July 26 remains selected when browsing August.
- August shows no selected gridcell until the user clicks an August date.
- The Selected date section continues showing July 26 while August is browsed.
- Returning to July restores the boundary on July 26.
- Clicking August 12 changes the selected date and agenda to August 12.

Clicking a date is the only calendar action that changes `selectedDate`.

## Uniform Cell Geometry

Move row sizing into the CSS grid:

- Desktop (`min-width: 640px`): every date row is `7.5rem`.
- Mobile: every date row is `4.5rem`.
- Weekday headers size to content and are not included in the fixed date-row
  height.

Date buttons stretch to fill their grid area. Desktop event tiles remain
limited to the existing display cap; mobile continues using event counts.
Overflowing text remains truncated within the fixed cell.

## Shared New Background Token

Add a reusable `calendar-surface` token:

- Light theme: a cool mist blue-green distinct from the current cream, amber,
  white, and sage surfaces.
- Dark theme: a restrained deep blue-green with sufficient foreground contrast.
- High contrast: a neutral high-contrast surface that preserves borders.

Expose it through the Tailwind theme as `bg-calendar-surface`.

Apply `bg-calendar-surface` to:

- The calendar workspace containing controls and the month grid.
- The Selected date section.

The inner empty-state card remains white (`surface-1`) to preserve content
layering.

## Accessibility

- Keep the labelled calendar region and weekday headers.
- Only current-month dates receive `role="gridcell"` and keyboard interaction.
- Placeholders are hidden from assistive technology.
- Preserve complete accessible date/event-count labels and `aria-selected`.
- When the selected date is outside the viewed month, the grid has no selected
  cell; the separately labelled Selected date region still communicates the
  current selection.
- Maintain visible focus and selected boundaries.

## Verification

- Pure tests confirm the six-week grid still positions dates correctly.
- Component tests confirm adjacent-month labels are absent and only
  current-month dates are interactive.
- Component tests confirm month browsing preserves the selected date and agenda,
  returning to the original month restores its selected boundary, and clicking
  a new date changes selection.
- Browser review confirms all six date rows have equal height on desktop and
  mobile, the two sections have the same computed background, and there is no
  horizontal overflow.
- Run focused tests, full tests, TypeScript, lint, and production build.

## Out of Scope

- Changing scheduled interview data.
- Week/day calendar views.
- Dragging, editing, or scheduling interviews.
- Changes to the interview overview or all-interviews pages.
