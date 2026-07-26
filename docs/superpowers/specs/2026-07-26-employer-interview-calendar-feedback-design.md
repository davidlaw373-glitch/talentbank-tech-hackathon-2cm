# Employer Interview Calendar Feedback Design

## Goal

Apply the second-round calendar feedback without changing interview data or
navigation behavior: make the selected-date boundary appear immediately after
month navigation, visually group the calendar controls and month grid, move
both month arrows fully outside the grid, and refine the selected-date colors.

## Root Cause

Month navigation already updates `selectedDate` to the first day of the new
month. Browser inspection confirms the new cell receives `aria-selected=true`.
The apparent missing dark boundary is caused by transitioning `box-shadow`: the
new selected cell begins with a near-zero ring and reaches the two-pixel primary
ring about 200 ms later.

The selected boundary must not participate in the transition. Background hover
feedback may continue to animate, but the primary inset boundary appears in the
same render as the selected state.

## Calendar Workspace

Create a single rounded, colored workspace containing:

- The back control.
- The labelled year and month selectors.
- The previous-month and next-month controls.
- The seven-column month calendar.

Use a restrained CareerOS product color such as `surface-tint` or
`accent-soft/30`, with a token border and soft shadow. The workspace provides
comfortable padding around the toolbar and calendar rather than applying the
color directly to each control.

The selected-date agenda remains outside this workspace as requested.

## Month Navigation Placement

On desktop, use a three-column calendar frame:

- A fixed-width left rail for Previous month.
- A flexible center column for the calendar shell.
- A fixed-width right rail for Next month.

Both rails have visible gaps from the calendar shell. Neither button overlaps
the grid border or any date cell.

On mobile, both buttons remain in a compact row above the calendar. The
seven-column grid remains full width and must not create horizontal overflow.

## Selected-Date Styling

The selected-date section uses a softly contrasting token background distinct
from the surrounding page and the calendar workspace. Its border and rounded
shape remain.

When no interviews are scheduled, the inner empty-state card uses the white
product surface (`surface-1`) with a subtle border. The empty-state message
remains unchanged.

When interviews exist, the current detailed cards and hover behavior remain.

## Accessibility

- Preserve the labelled `Scheduled interview calendar` region.
- Preserve `aria-selected` and complete date labels on grid cells.
- Keep explicit accessible names for both month buttons.
- Maintain visible focus rings.
- Selected state continues to use both a background change and a boundary.
- No information depends on animation.

## Verification

- Add a component regression test that navigates to the next month, confirms
  August 1 is selected, and confirms the selected cell does not transition
  `box-shadow`.
- Existing month selection, event, and agenda tests continue to pass.
- Run the focused component test, full test suite, TypeScript, lint, and build.
- Browser-check desktop button gaps, immediate selected boundary, workspace
  containment, selected-date colors, and 390 px overflow.

## Out of Scope

- Interview data changes.
- New calendar views.
- Scheduling or rescheduling.
- Changes to employer interview overview or all-interviews pages.
