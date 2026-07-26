# Employer Offers Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split employer offers into an interviews-aligned priority overview and a dedicated searchable complete-management page while preserving offer-specific actions.

**Architecture:** Extract the current route-sized client component into focused offer data, row, dialog, overview, and all-management modules. Keep `/employer/offers` and `/employer/offers/all` as small route composition boundaries backed by the existing local fixtures.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui, Lucide, Vitest, Testing Library

## Global Constraints

- Reuse CareerOS tokens, typography utilities, shared controls, and `lift-on-hover`; do not hardcode colors or add dependencies.
- Preserve Send, Remind, Withdraw, View, composer submission, and toast behavior.
- Do not add interview calendar, scheduled-calendar, interview scheduling, scorecard, persistence, or new detail-route behavior.
- Keep the overview free of destructive actions and the all view responsible for complete management.
- Preserve keyboard access, visible focus, semantic labels, responsive wrapping, and reduced-motion behavior.
- Modify only offers routes, offer feature components, and the two confirmed design/plan documents.

## File Structure

- Create `src/components/features/employer/offers/offer-data.ts`: seed rows, decision options, sorting, and filtering.
- Create `src/components/features/employer/offers/offer-data.test.ts`: sorting and combined-filter tests.
- Create `src/components/features/employer/offers/offer-row.tsx`: shared priority/all offer row.
- Create `src/components/features/employer/offers/offer-composer-dialog.tsx`: extracted composer dialog.
- Create `src/components/features/employer/offers/offer-overview.tsx`: overview stats, actions, priority rows, and composer.
- Create `src/components/features/employer/offers/offer-overview.test.tsx`: overview composition and action-boundary tests.
- Create `src/components/features/employer/offers/all-offers-management.tsx`: full filters and actions.
- Create `src/components/features/employer/offers/all-offers-management.module.css`: responsive toolbar layout.
- Create `src/components/features/employer/offers/all-offers-management.test.tsx`: filtering and complete-action tests.
- Modify `src/app/employer/offers/page.tsx`: compose `OfferOverview`.
- Create `src/app/employer/offers/all/page.tsx`: compose `AllOffersManagement`.

---

### Task 1: Pure offer data behavior

**Files:**
- Create: `src/components/features/employer/offers/offer-data.ts`
- Test: `src/components/features/employer/offers/offer-data.test.ts`

**Interfaces:**
- Consumes: `EmployerOfferRow`, `Offer`, `OfferDecision`, `getEmployerOfferRows(1)`, and `getEmployerCandidateRows(1)`.
- Produces: `OFFER_DECISIONS`, `DecisionFilter`, `RoleFilter`, `getEmployerOfferSeedRows()`, `sortOfferRowsByPriority(rows)`, and `filterOfferRows(rows, filters)`.

- [ ] **Step 1: Write failing sorting and filtering tests**

```ts
it("places pending offers before resolved offers and uses match score within a decision", () => {
  const rows = sortOfferRowsByPriority(getEmployerOfferSeedRows());
  expect(rows.slice(0, 2).map((row) => row.offer.decision)).toEqual([
    "Pending",
    "Pending",
  ]);
  expect(rows[0]!.offer.matchScore).toBeGreaterThanOrEqual(
    rows[1]!.offer.matchScore,
  );
});

it("combines candidate search, decision, and role filters", () => {
  const rows = filterOfferRows(getEmployerOfferSeedRows(), {
    query: "aisha",
    decision: "Pending",
    role: "Senior Frontend Engineer",
  });
  expect(rows).toHaveLength(1);
  expect(rows[0]!.candidate.name).toBe("Aisha Khan");
});
```

- [ ] **Step 2: Run `npm test -- src/components/features/employer/offers/offer-data.test.ts` and verify RED because the module is missing**
- [ ] **Step 3: Implement seed construction moved verbatim from the route plus pure sorting and filtering**

```ts
export function sortOfferRowsByPriority(rows: EmployerOfferRow[]) {
  return [...rows].sort((a, b) => {
    const decisionDifference =
      DECISION_PRIORITY[a.offer.decision] -
      DECISION_PRIORITY[b.offer.decision];
    return decisionDifference || b.offer.matchScore - a.offer.matchScore;
  });
}

export function filterOfferRows(
  rows: EmployerOfferRow[],
  filters: { query: string; decision: DecisionFilter; role: RoleFilter },
) {
  const query = filters.query.trim().toLowerCase();
  return sortOfferRowsByPriority(rows).filter((row) => {
    const searchable = `${row.candidate.name} ${row.job.title}`.toLowerCase();
    return (
      (!query || searchable.includes(query)) &&
      (filters.decision === "All" ||
        row.offer.decision === filters.decision) &&
      (filters.role === "All" || row.job.title === filters.role)
    );
  });
}
```

- [ ] **Step 4: Rerun the focused data test and verify GREEN**

### Task 2: Shared row and overview

**Files:**
- Create: `src/components/features/employer/offers/offer-row.tsx`
- Create: `src/components/features/employer/offers/offer-composer-dialog.tsx`
- Create: `src/components/features/employer/offers/offer-overview.tsx`
- Test: `src/components/features/employer/offers/offer-overview.test.tsx`
- Modify: `src/app/employer/offers/page.tsx`

**Interfaces:**
- Consumes: the Task 1 data helpers, `EmployerOfferRow`, `useToast`, and existing shared UI primitives.
- Produces: `OfferRow({ row, mode, actions })`, `OfferComposerDialog`, and `OfferOverview`.

- [ ] **Step 1: Write a failing overview behavior test**

```tsx
it("renders the priority overview and links to complete management", () => {
  render(<OfferOverview />);
  expect(
    screen.getByRole("heading", { name: "Priority offers" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "View all offers" }),
  ).toHaveAttribute("href", "/employer/offers/all");
  expect(
    screen.getByRole("button", { name: "Send offer" }),
  ).toBeInTheDocument();
  expect(screen.queryByLabelText("Search offers")).not.toBeInTheDocument();
});

it("keeps withdraw actions out of priority rows", () => {
  render(<OfferOverview />);
  expect(
    screen.queryByRole("button", { name: /Withdraw offer/ }),
  ).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused overview test and verify RED because `OfferOverview` is missing**
- [ ] **Step 3: Extract the current composer without changing its fields, validation, or submission**
- [ ] **Step 4: Implement `OfferRow` with `mode: "priority" | "all"`; use a `Card` with `lift-on-hover`, keep existing metadata, and expose Withdraw only in all mode**
- [ ] **Step 5: Implement the overview heading, four stat cards, Priority offers heading, warm View all link, independent row cards, contextual empty state, and composer**

```tsx
<section className="space-y-3">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h2>Priority offers</h2>
      <p className="text-meta">
        Offers ordered by what needs attention next.
      </p>
    </div>
    <Button
      asChild
      className="bg-highlight-soft text-foreground hover:bg-highlight-soft/80"
    >
      <Link href="/employer/offers/all">View all offers</Link>
    </Button>
  </div>
  <ul aria-label="Priority offers" className="space-y-3">
    {priorityRows.map((row) => (
      <OfferRow
        key={row.offer.id}
        row={row}
        mode="priority"
        actions={createRowActions(row)}
      />
    ))}
  </ul>
</section>
```

- [ ] **Step 6: Replace the route with a small `OfferOverview` composition**
- [ ] **Step 7: Rerun the focused overview tests and verify GREEN**

### Task 3: Complete offers management route

**Files:**
- Create: `src/components/features/employer/offers/all-offers-management.tsx`
- Create: `src/components/features/employer/offers/all-offers-management.module.css`
- Test: `src/components/features/employer/offers/all-offers-management.test.tsx`
- Create: `src/app/employer/offers/all/page.tsx`

**Interfaces:**
- Consumes: Task 1 data helpers, `OfferRow` in all mode, and existing toast behavior.
- Produces: `AllOffersManagement` and the `/employer/offers/all` route.

- [ ] **Step 1: Write a failing management-view test**

```tsx
it("filters complete offers by search, decision, and role", async () => {
  const user = userEvent.setup();
  render(<AllOffersManagement />);
  await user.type(screen.getByLabelText("Search offers"), "Aisha");
  expect(
    screen.getByRole("heading", { name: "Aisha Khan" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: "Tomoko Yamamoto" }),
  ).not.toBeInTheDocument();
});

it("exposes complete pending-offer actions", () => {
  render(<AllOffersManagement />);
  expect(
    screen.getAllByRole("button", { name: /Withdraw offer/ }).length,
  ).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run the focused management test and verify RED because the component is missing**
- [ ] **Step 3: Implement the back toolbar, filters, live result count, empty state, and all-mode rows**

```css
.toolbar {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 1rem;
}

.filters {
  display: grid;
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .filters {
    grid-template-columns: minmax(0, 1fr) 14rem 17rem;
    align-items: end;
  }
}

@media (max-width: 639px) {
  .toolbar {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

- [ ] **Step 4: Add exact candidate-specific accessible labels to row actions and preserve all existing toasts/removal behavior**
- [ ] **Step 5: Add the small `/employer/offers/all` route composition**
- [ ] **Step 6: Rerun the focused management tests and verify GREEN**

### Task 4: Regression and browser verification

**Files:**
- Modify only offer files from Tasks 1–3 if verification reveals a defect.

**Interfaces:**
- Consumes: completed overview and all-offers routes.
- Produces: verified responsive, accessible implementation.

- [ ] **Step 1: Run `npm test -- src/components/features/employer/offers`**
- [ ] **Step 2: Run `npx tsc --noEmit` and `npm run lint`**
- [ ] **Step 3: Run `npm run build` and confirm both offer routes are emitted**
- [ ] **Step 4: At desktop width verify the overview stats, independent cards, action boundary, View all navigation, composer, and lack of fixed internal scrolling**
- [ ] **Step 5: Verify the all view filters, result count, back navigation, complete actions, and empty state**
- [ ] **Step 6: At 390×844 verify toolbar stacking, row wrapping, reachable controls, and no horizontal overflow**
- [ ] **Step 7: Verify keyboard focus, reduced motion, and zero page console errors**
- [ ] **Step 8: Run `git diff --check`, inspect `git status --short`, and review only the offer-scoped diff**
