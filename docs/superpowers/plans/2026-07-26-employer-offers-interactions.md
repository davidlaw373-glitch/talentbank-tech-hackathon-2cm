# Employer Offers Interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Send, Remind, View, and Withdraw state-aware prototype interactions while simplifying the overview into a Pending-offer action queue.

**Architecture:** Add a client provider at the offers route layout so overview and all-offers pages share one in-memory workflow. Keep display logic in `OfferRow`, read-only detail presentation in a focused dialog, and use existing feature components for composition.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui, Lucide, Vitest, Testing Library

## Global Constraints

- Keep all state local to `/employer/offers`; a full refresh restores seed data.
- Do not add email APIs, persistence, offer editing, document generation, new dependencies, or changes outside the offers route.
- Send appears only for unsent Pending offers; Remind only for sent Pending offers; Withdraw only for Pending offers in complete management; View for every offer.
- Reminder cooldown is exactly 30 seconds and must clean up its timers.
- Reuse CareerOS tokens, typography, focus behavior, `lift-on-hover`, toast feedback, and reduced-motion handling.

## File Structure

- Create `src/components/features/employer/offers/offer-workflow-provider.tsx`: shared rows and state transitions.
- Create `src/components/features/employer/offers/offer-workflow-provider.test.tsx`: Send, Remind cooldown, create, and withdraw tests.
- Create `src/app/employer/offers/layout.tsx`: route-scoped provider composition.
- Create `src/components/features/employer/offers/offer-details-dialog.tsx`: read-only details dialog.
- Create `src/components/features/employer/offers/offer-details-dialog.test.tsx`: fields and close behavior.
- Modify `src/components/features/employer/offers/offer-row.tsx`: state-aware action visibility.
- Modify `src/components/features/employer/offers/offer-overview.tsx`: Pending-only priority queue and shared actions.
- Modify `src/components/features/employer/offers/all-offers-management.tsx`: shared history and Pending-only withdrawal.
- Modify overview and management tests to protect the workflow.

---

### Task 1: Shared offer workflow

**Files:**
- Create: `src/components/features/employer/offers/offer-workflow-provider.tsx`
- Test: `src/components/features/employer/offers/offer-workflow-provider.test.tsx`
- Create: `src/app/employer/offers/layout.tsx`

**Interfaces:**
- Consumes: `getEmployerOfferSeedRows()`, `EmployerOfferRow`, `EmployerCandidateRow`, and `OfferComposerValues`.
- Produces: `OfferWorkflowProvider`, `useOfferWorkflow()`, `sendOffer(id)`, `remindOffer(id)`, `withdrawOffer(id)`, `createOffer(candidate, values)`, and `isReminderCoolingDown(id)`.

- [ ] **Step 1: Write failing integration tests against a provider harness**

```tsx
function WorkflowHarness() {
  const workflow = useOfferWorkflow();
  const unsent = workflow.rows.find(
    (row) => row.offer.sentDate === "Not yet sent",
  )!;
  return (
    <>
      <p>{unsent.offer.sentDate}</p>
      <p>{workflow.isReminderCoolingDown(unsent.offer.id) ? "cooling" : "ready"}</p>
      <button onClick={() => workflow.sendOffer(unsent.offer.id)}>Send</button>
      <button onClick={() => workflow.remindOffer(unsent.offer.id)}>Remind</button>
      <button onClick={() => workflow.withdrawOffer(unsent.offer.id)}>Withdraw</button>
    </>
  );
}

it("marks an unsent offer as sent", async () => {
  const user = userEvent.setup();
  render(<OfferWorkflowProvider><WorkflowHarness /></OfferWorkflowProvider>);
  await user.click(screen.getByRole("button", { name: "Send" }));
  expect(screen.getByText("Just now")).toBeTruthy();
});

it("holds reminder cooldown for thirty seconds", async () => {
  vi.useFakeTimers();
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<OfferWorkflowProvider><WorkflowHarness /></OfferWorkflowProvider>);
  await user.click(screen.getByRole("button", { name: "Remind" }));
  expect(screen.getByText("cooling")).toBeTruthy();
  vi.advanceTimersByTime(30_000);
  expect(screen.getByText("ready")).toBeTruthy();
  vi.useRealTimers();
});
```

- [ ] **Step 2: Run `npm test -- src/components/features/employer/offers/offer-workflow-provider.test.tsx` and verify RED because the provider module is missing**
- [ ] **Step 3: Implement the provider with one `rows` state and a `Set<number>` of cooling reminder IDs**

```tsx
const REMINDER_COOLDOWN_MS = 30_000;

const sendOffer = (id: number) =>
  setRows((current) =>
    current.map((row) =>
      row.offer.id === id
        ? { ...row, offer: { ...row.offer, sentDate: "Just now" } }
        : row,
    ),
  );

const remindOffer = (id: number) => {
  setCoolingIds((current) => new Set(current).add(id));
  const timer = window.setTimeout(() => {
    setCoolingIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  }, REMINDER_COOLDOWN_MS);
  timers.current.add(timer);
};
```

Cleanup every stored timer in an unmount effect. Move the existing create-row
and withdraw-row updates into provider functions without changing offer fields.

- [ ] **Step 4: Add `src/app/employer/offers/layout.tsx` wrapping children with `OfferWorkflowProvider`**
- [ ] **Step 5: Rerun the provider test and verify GREEN**

### Task 2: State-aware row and details dialog

**Files:**
- Modify: `src/components/features/employer/offers/offer-row.tsx`
- Create: `src/components/features/employer/offers/offer-details-dialog.tsx`
- Test: `src/components/features/employer/offers/offer-details-dialog.test.tsx`
- Test: `src/components/features/employer/offers/offer-row.test.tsx`

**Interfaces:**
- Consumes: `EmployerOfferRow`, `mode`, `reminderCoolingDown`, and row callbacks.
- Produces: Send/View for unsent Pending, Remind/View for sent Pending, View for every resolved decision, Pending-only all-mode Withdraw, and `OfferDetailsDialog`.

- [ ] **Step 1: Write failing row visibility tests**

```tsx
it("shows Send and View for an unsent pending offer", () => {
  render(<OfferRow row={unsentPending} mode="priority" reminderCoolingDown={false} actions={actions} />);
  expect(screen.getByRole("button", { name: /Send offer/ })).toBeTruthy();
  expect(screen.getByRole("button", { name: /View offer/ })).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Remind/ })).toBeNull();
});

it("shows a disabled Reminded action for a cooling sent offer", () => {
  render(<OfferRow row={sentPending} mode="priority" reminderCoolingDown actions={actions} />);
  expect(screen.getByRole("button", { name: /Reminder cooling down/ })).toBeDisabled();
});

it("does not offer withdrawal for a declined offer", () => {
  render(<OfferRow row={declined} mode="all" reminderCoolingDown={false} actions={actions} />);
  expect(screen.queryByRole("button", { name: /Withdraw offer/ })).toBeNull();
  expect(screen.getByRole("button", { name: /View offer/ })).toBeTruthy();
});
```

- [ ] **Step 2: Run the row test and verify RED because the existing action rules differ**
- [ ] **Step 3: Implement action branches from `offer.decision`, `offer.sentDate`, and `mode`; remove `Bell` only if Remind is unavailable**
- [ ] **Step 4: Write a failing details-dialog test that opens the dialog and asserts candidate, role, salary, start date, sent date, decision, match score, and Close**
- [ ] **Step 5: Implement `OfferDetailsDialog` with the existing native dialog focus pattern and a semantic definition list**
- [ ] **Step 6: Rerun row and dialog tests and verify GREEN**

### Task 3: Wire overview and complete management

**Files:**
- Modify: `src/components/features/employer/offers/offer-overview.tsx`
- Modify: `src/components/features/employer/offers/all-offers-management.tsx`
- Modify: `src/components/features/employer/offers/offer-overview.test.tsx`
- Modify: `src/components/features/employer/offers/all-offers-management.test.tsx`

**Interfaces:**
- Consumes: `useOfferWorkflow`, `OfferRow`, `OfferDetailsDialog`, `OfferComposerDialog`, and `useToast`.
- Produces: a Pending-only overview queue and full history with meaningful state transitions.

- [ ] **Step 1: Add a failing overview test asserting that Accepted, Declined, and Expired candidate headings are absent while both Pending candidates remain**
- [ ] **Step 2: Add failing interaction assertions that clicking Send changes the row to Remind and clicking View opens the candidate detail dialog**
- [ ] **Step 3: Replace local overview rows with provider rows, filter `decision === "Pending"`, wire provider mutations, reminder cooldown, details selection, and existing toasts**
- [ ] **Step 4: Add a failing all-management test asserting every offer has View, only Pending offers have Withdraw, and a withdrawn candidate disappears**
- [ ] **Step 5: Replace local management rows with provider rows and wire the same detail, send, reminder, and withdrawal behavior while preserving filters**
- [ ] **Step 6: Run all offer tests and verify GREEN**

### Task 4: Verification

**Files:**
- Modify only offers files if verification reveals a defect.

**Interfaces:**
- Consumes: both completed offers routes.
- Produces: verified responsive and accessible prototype behavior.

- [ ] **Step 1: Run `npm test -- src/components/features/employer/offers`**
- [ ] **Step 2: Run `npx eslint src/app/employer/offers src/components/features/employer/offers`**
- [ ] **Step 3: Run `npm run build` and confirm `/employer/offers` plus `/employer/offers/all`**
- [ ] **Step 4: In the browser send Aisha's unsent offer, verify it switches to Remind, navigate to View all, and confirm `Just now` persists**
- [ ] **Step 5: Trigger Remind, confirm disabled `Reminded` feedback and the success toast, then verify cooldown release**
- [ ] **Step 6: Open View for Pending, Accepted, Declined, and Expired records and confirm complete details**
- [ ] **Step 7: Verify only Pending records appear in the overview and only Pending records expose Withdraw in all management**
- [ ] **Step 8: Check desktop and 390×844 overflow, keyboard focus, console errors, `git diff --check`, and final scope**
