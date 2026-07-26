# Employer Offers Layout Alignment

## Goal

Align employer offers with the established employer interviews layout while
preserving offer-specific workflows. The offers experience should use the same
overview-and-management information architecture without adopting interview-only
calendar or scheduling capabilities.

## Information Architecture

- `/employer/offers` becomes the overview with the page heading, primary
  `Send offer` action, four decision summaries, and priority offers.
- `/employer/offers/all` becomes the complete management view with search,
  decision and offered-role filters, complete status-specific actions, and a
  back control.
- The overview links to the management view with a warm-highlight
  `View all offers` action.

## Overview

The overview keeps the existing offer composer and local fixture-driven
behavior. It removes the current same-page priority/all toggle, fixed-height
outer card, inset list panel, and internal list scrollbar.

Priority offers render as independent `lift-on-hover` cards ordered by decision
attention priority and match score. The overview exposes only immediate,
non-destructive actions: pending offers can be sent or reminded, and accepted
offers can be viewed. Withdraw actions remain in complete management.

The four decision summaries remain Pending, Accepted, Declined, and Expired.
Their presentation matches interviews: responsive stat cards with icon swatches,
large tabular values, and clear labels.

## Complete Management

The all-offers route mirrors the all-interviews composition:

- A top toolbar contains a back control and responsive filters.
- Search matches candidate or offered role.
- Filters cover decision status and offered role.
- A result heading announces the number of matching offers.
- Full-width offer cards use stronger boundaries and expose the complete
  status-specific action set.

Existing action behavior remains:

- Pending: Send, Remind, Withdraw.
- Accepted: View.
- Declined: Withdraw.
- Expired: View.

Withdrawing removes the offer from the current client-side collection and keeps
the existing toast feedback. No new persistence or backend boundary is added.

## Component Boundaries

Offer-specific implementation moves under
`src/components/features/employer/offers`:

- `offer-data.ts` owns seed construction, decision ordering, and filtering.
- `offer-row.tsx` owns shared priority/all presentation and action visibility.
- `offer-composer-dialog.tsx` owns the existing composer.
- `offer-overview.tsx` composes summary and priority behavior.
- `all-offers-management.tsx` composes filters and complete actions.

Route files remain small composition boundaries. Existing CareerOS cards,
buttons, badges, inputs, selects, toast behavior, tokens, typography utilities,
and motion classes are reused. No dependency is added.

## Responsive, Accessibility, and States

- Summary cards remain two columns on narrow screens and four on wider screens.
- The management toolbar stacks on mobile without horizontal overflow.
- Offer identity, salary, dates, and actions wrap without clipping.
- Icon-only navigation has an accessible name; list and filter regions retain
  semantic labels; result counts use an appropriate live region.
- Status is communicated with text and color.
- Hover motion uses `lift-on-hover` and inherits reduced-motion behavior.
- Overview and management views each provide contextual empty states.
- Local synchronous fixtures require no new loading or network error state.

## Verification

- Pure tests cover offer sorting and combined filtering.
- Component tests cover the overview link/action boundary and all-view filters
  and complete actions.
- Type-check, lint, production build, and focused tests must pass.
- Browser verification covers overview and all views at desktop and mobile
  widths, interactions, overflow, console errors, keyboard access, and reduced
  motion.

## Out of Scope

- Interview calendar, scheduled-calendar navigation, interview scheduling, or
  scorecard concepts.
- New offer details routes, document preview, backend persistence, or global
  cross-route client state.
- Changes to interviews, jobs, candidates, universities, or unrelated shared
  primitives.
