# Employer Offers Interaction Design

## Goal

Turn the employer offers prototype into a coherent state-aware workflow. Send,
Remind, and View must produce meaningful interface behavior, while redundant
actions and resolved records are removed from the priority queue.

## Information Architecture

- `/employer/offers` is an action queue. Its Priority offers list contains only
  Pending offers, ordered with unsent offers first and then sent offers by match
  score.
- `/employer/offers/all` is the complete searchable history and management
  surface. It retains Pending, Accepted, Declined, and Expired offers.
- The four decision summary cards remain on the overview because they provide a
  compact pipeline health snapshot without duplicating the complete list.
- Search, decision, and role filters remain on the all-offers page because they
  help locate records in the complete history.

## Action Rules

### Send

An unsent Pending offer is identified by `sentDate === "Not yet sent"`.
Its row exposes Send and View.

Sending:

- updates `sentDate` to `Just now`;
- keeps the decision as Pending;
- changes the row action from Send to Remind;
- shows success feedback naming the candidate and role.

The global Send offer action remains. Its existing composer creates a new
Pending offer with `sentDate: "Just now"`, meaning the submitted offer has
already been sent.

### Remind

Remind is retained because it represents a distinct follow-up: the offer has
already been sent, the candidate has not responded, and the employer wants to
nudge them.

It appears only for sent Pending offers. After activation it:

- shows a success notification;
- becomes disabled and reads `Reminded`;
- remains unavailable for 30 seconds;
- returns to Remind after the cooldown.

Unsent, Accepted, Declined, and Expired offers never expose Remind.

### View

View is available for every offer in both list modes. It opens a read-only
details dialog containing candidate, role, decision, salary, proposed start
date, sent date, and match score. The dialog has a clear heading, semantic
labels, keyboard focus behavior inherited from the existing native dialog
pattern, and a Close action.

### Withdraw

Withdraw remains a complete-management action only for Pending offers. It
removes the offer from the shared in-memory collection and displays feedback.

Declined offers no longer expose Withdraw because the candidate has already
closed the decision and the action does not advance or clarify the workflow.
Accepted and Expired offers remain read-only.

## Shared State

A route-scoped client provider under `/employer/offers/layout.tsx` owns:

- the current offer rows;
- sending an existing offer;
- creating an offer;
- withdrawing an offer;
- reminder cooldown state.

Both the overview and all-offers components consume the provider, so client-side
navigation between the two routes preserves prototype state. A full page refresh
restores seed data; backend or durable browser persistence remains out of scope.

Reminder timers are cleaned up when the provider unmounts. Cooldown state is
kept by offer ID and does not alter the offer domain type.

## Component Changes

- `offer-workflow-provider.tsx` owns route-scoped state transitions.
- `offer-row.tsx` derives visible actions from sent and decision state and
  accepts a reminder-disabled flag.
- `offer-details-dialog.tsx` owns read-only offer presentation.
- `offer-overview.tsx` filters to Pending priority rows and composes the details
  dialog and composer.
- `all-offers-management.tsx` keeps filters, all records, details, and Pending
  withdrawal.

No dependency or generic cross-domain state framework is added.

## Accessibility and Responsive Behavior

- Each action has a candidate-specific accessible name.
- Disabled Remind remains visibly and programmatically disabled.
- Toast feedback communicates Send, Remind, and Withdraw results without color
  alone.
- The details dialog is labelled by its heading and can be dismissed with Close
  or the platform dialog behavior.
- Action groups wrap on narrow screens; removing redundant actions reduces
  mobile crowding.
- Existing focus styles and global reduced-motion behavior are preserved.

## Testing

- Pure/provider tests verify Send changes `sentDate`, cooldown activation and
  release, create, and withdraw behavior.
- Overview tests verify only Pending offers appear and that unsent/sent action
  sets differ.
- Row and management tests verify View on all decisions, Withdraw only on
  Pending, and removal of declined withdrawal.
- Dialog tests verify the complete offer fields and Close behavior.
- Browser checks cover both routes, client navigation state continuity,
  reminder disabled feedback, dialog operation, desktop/mobile overflow, and
  console errors.

## Out of Scope

- Real email delivery, notification APIs, backend persistence, document
  generation, offer editing, reminder history, and configurable cooldowns.
- Changes outside employer offers except the route-scoped offers layout.
