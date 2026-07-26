# Employer Interview Calendar Polish Design

## Goal

Refine the scheduled-interviews month calendar into a calmer, more polished
CareerOS product surface while applying the annotated layout changes: remove
the page title block and Today action, place previous-month navigation beside
the calendar without overlap, and float next-month navigation over the
calendar's right edge without covering date content.

## Recommended Direction

Use a soft card-style month calendar rather than a flat table or a dense
timeline. The month grid remains the most direct way to browse scheduled
interviews by year, month, and date, while layered surfaces, restrained borders,
clear date states, and richer event tiles make the existing interaction easier
to scan.

No calendar dependency is added. Existing date utilities, fixtures, navigation,
selection, and daily-agenda behavior remain the source of truth.

## Toolbar

Remove the `Scheduled interviews` eyebrow, dynamic month heading, explanatory
copy, and `Today` button.

Keep a compact utility row containing:

- The existing back control to `/employer/interviews`.
- Labelled year and month selectors grouped at the opposite side on desktop.
- A responsive two-column selector layout on narrow screens.

This keeps the controls discoverable without reintroducing a second visual
heading above the month calendar.

## Calendar Composition

Wrap the month grid in a rounded, elevated `surface-1` shell with a subtle
border and shadow. Use a softly tinted weekday header and lower-contrast cell
dividers instead of the current heavy table grid.

On desktop:

- Previous month occupies a dedicated left rail with spacing between the button
  and calendar shell. It never overlaps the calendar.
- Next month is vertically centered and floats over the calendar's right
  border. Its opaque surface, border, shadow, and z-index keep it distinct.
- The calendar shell reserves right-side breathing room inside date cells so
  the floating control does not cover date or event content.

On mobile:

- Both month controls move into a compact row above the calendar shell.
- Neither control overlaps the seven narrow date columns.
- The page must not create horizontal overflow at 390 px.

## Visual States

- Weekday labels use the caption scale, uppercase tracking, and muted text.
- Adjacent-month days use `surface-inset` and muted text.
- Weekend columns receive a restrained tint that is still subordinate to the
  selected state.
- Today keeps the existing filled primary date marker.
- The selected date gains a highlight-soft background plus an inset primary
  ring, preserving a non-color-only boundary cue.
- Hover and keyboard-focus states remain visible and use shared tokens.
- Event tiles use an accent-soft surface, a small primary status mark, compact
  hierarchy for candidate, role, and time, and rounded corners.
- Mobile cells retain event counts instead of attempting to fit full event
  content.

## Selected-Date Agenda

Place the selected-date label and count in a softly layered section that
visually connects it to the calendar. Keep the existing empty state and detailed
interview cards, while tightening their surrounding spacing and retaining
`lift-on-hover`.

The agenda remains the complete accessible representation of a selected day,
especially on mobile where calendar events are compact.

## Accessibility and Responsive Behavior

- The calendar keeps `role="grid"` and a dynamic accessible month label.
- Month navigation buttons keep explicit `Previous month` and `Next month`
  names.
- The navigation and grid are grouped in a labelled calendar region.
- Every date remains a keyboard-operable button with full date and event count.
- Focus rings must remain visible above selected and floating layers.
- No information depends on hover, animation, or color alone.
- Layout changes must preserve date selection and adjacent-month navigation.

## Verification

- Component tests prove the removed title/Today controls stay absent.
- Component tests prove both month controls remain accessible and functional
  inside the calendar navigation region.
- Existing date, event-content, and selected-agenda tests continue to pass.
- Run the focused component test, full test suite, TypeScript check, lint, and
  production build.
- Review at desktop and 390 px widths for button placement, event readability,
  overflow, keyboard focus, and console errors.

## Out of Scope

- Week or day views.
- Drag-and-drop event editing.
- Scheduling or rescheduling workflows.
- External calendar synchronization.
- Changes to interview data or overview/list pages.
