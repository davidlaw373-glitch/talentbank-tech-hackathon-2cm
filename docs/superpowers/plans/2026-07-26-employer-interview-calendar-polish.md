# Employer Interview Calendar Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the scheduled-interviews month calendar and apply the requested header and month-navigation placement changes without changing its data behavior.

**Architecture:** Keep `InterviewCalendar` as the interaction owner and extend its colocated CSS module for the responsive calendar frame. Tests assert the user-visible removals and semantic navigation grouping; visual verification confirms the intentionally asymmetric desktop arrow placement.

**Tech Stack:** React, TypeScript, Tailwind CSS, CSS Modules, Vitest, Testing Library

## Global Constraints

- Work on the current branch and preserve unrelated dirty workspace changes.
- Remove the title/description block and Today control.
- Previous month must use a non-overlapping left rail on desktop.
- Next month must overlap only the calendar's right border on desktop.
- At 390 px both navigation controls must avoid date-cell overlap and horizontal overflow.
- Use existing CareerOS tokens and dependencies only; do not add a calendar package.
- Preserve the existing grid semantics, date selection, filtering, and agenda behavior.

---

### Task 1: Lock the revised calendar chrome contract

**Files:**
- Modify: `src/components/features/employer/interviews/interview-calendar.test.tsx`

**Interfaces:**
- Consumes: `InterviewCalendar({ initialYear?: number, initialMonth?: number })`
- Produces: tests for the `Scheduled interview calendar` region and removed controls

- [ ] **Step 1: Write the failing test**

Add a test that renders July 2026 and asserts the removed interface is absent
while navigation remains grouped with the calendar:

```tsx
it("uses compact calendar chrome without the removed title and Today action", () => {
  render(<InterviewCalendar initialYear={2026} initialMonth={6} />);

  const calendarRegion = screen.getByRole("region", {
    name: "Scheduled interview calendar",
  });

  expect(within(calendarRegion).getByRole("button", {
    name: "Previous month",
  })).toBeTruthy();
  expect(within(calendarRegion).getByRole("button", {
    name: "Next month",
  })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Today" })).toBeNull();
  expect(screen.queryByText("Browse confirmed interview dates, candidates, and panels.")).toBeNull();
  expect(screen.queryByText("Scheduled interviews")).toBeNull();
});
```

Import `within` from `@testing-library/react`.

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```powershell
npx vitest run src/components/features/employer/interviews/interview-calendar.test.tsx
```

Expected: FAIL because no `Scheduled interview calendar` region exists and the
removed controls are still rendered.

- [ ] **Step 3: Commit the red test**

```powershell
git add -- src/components/features/employer/interviews/interview-calendar.test.tsx
git commit -m "test: define polished interview calendar chrome"
```

### Task 2: Implement the polished responsive month calendar

**Files:**
- Modify: `src/components/features/employer/interviews/interview-calendar.tsx`
- Modify: `src/components/features/employer/interviews/interview-calendar.module.css`

**Interfaces:**
- Consumes: existing month data, selection state, `shiftMonth(delta)`, and CSS module import
- Produces: accessible `section[aria-label="Scheduled interview calendar"]`, `.calendarFrame`, `.previousRail`, `.nextOverlay`, and `.calendarShell`

- [ ] **Step 1: Replace the current header with the compact toolbar**

Remove the title block and Today button. Render the back button and existing
year/month selectors in:

```tsx
<header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
  {/* back button */}
  <div className="grid grid-cols-2 gap-3 sm:w-[24rem]">
    {/* unchanged labelled year and month Select controls */}
  </div>
</header>
```

Remove the unused Today click handler markup. Keep `today` because it still
drives the initial view and today marker.

- [ ] **Step 2: Add the semantic calendar frame and navigation controls**

Wrap navigation and the grid as:

```tsx
<section aria-label="Scheduled interview calendar" className="space-y-4">
  <div className={styles.calendarFrame}>
    <Button className={styles.previousRail} variant="outline" size="icon"
      aria-label="Previous month" onClick={() => shiftMonth(-1)}>
      <ChevronLeft />
    </Button>
    <div className={styles.calendarShell}>
      <div role="grid" aria-label={`${MONTHS[viewMonth]} ${viewYear} calendar`}
        className={styles.calendarGrid}>
        {/* weekday headers and date cells */}
      </div>
    </div>
    <Button className={styles.nextOverlay} variant="outline" size="icon"
      aria-label="Next month" onClick={() => shiftMonth(1)}>
      <ChevronRight />
    </Button>
  </div>
</section>
```

Use token classes for tinted weekday headers, subtle borders, weekend and
adjacent-month surfaces, selected/today states, and event tiles. Add a small
decorative primary dot inside desktop event tiles with `aria-hidden`.

- [ ] **Step 3: Implement responsive frame geometry in the CSS module**

Use an explicit desktop left rail and right-edge overlay:

```css
.calendarFrame {
  position: relative;
  display: grid;
  grid-template-columns: 2.75rem minmax(0, 1fr);
  gap: 0.75rem;
  align-items: center;
}

.previousRail {
  grid-column: 1;
}

.calendarShell {
  grid-column: 2;
  min-width: 0;
  overflow: hidden;
}

.nextOverlay {
  position: absolute;
  top: 50%;
  right: -1.25rem;
  z-index: 20;
  transform: translateY(-50%);
}

.calendarGrid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

@media (max-width: 639px) {
  .calendarFrame {
    grid-template-columns: 1fr auto auto;
    gap: 0.5rem;
    align-items: center;
  }

  .previousRail,
  .nextOverlay {
    position: static;
    transform: none;
  }

  .previousRail {
    grid-column: 2;
  }

  .nextOverlay {
    grid-column: 3;
  }

  .calendarShell {
    grid-column: 1 / -1;
    grid-row: 2;
  }
}
```

Add rounded corners, token-based shadow/border classes in TSX, and enough
right-side internal spacing that the desktop overlay covers only the shell
border.

- [ ] **Step 4: Run the focused component test**

Run:

```powershell
npx vitest run src/components/features/employer/interviews/interview-calendar.test.tsx
```

Expected: all calendar component tests PASS.

- [ ] **Step 5: Commit the implementation**

```powershell
git add -- src/components/features/employer/interviews/interview-calendar.tsx src/components/features/employer/interviews/interview-calendar.module.css
git commit -m "feat: polish interview calendar layout"
```

### Task 3: Validate behavior and responsive presentation

**Files:**
- Verify only; no planned source changes

**Interfaces:**
- Consumes: completed calendar component and running Next.js app
- Produces: test, type, lint, build, and browser evidence

- [ ] **Step 1: Run automated verification**

```powershell
npm test -- --run
npx tsc --noEmit
npm run lint
npm run build
```

Expected: tests, TypeScript, and production build pass; lint reports no new
errors.

- [ ] **Step 2: Review desktop presentation**

Open `/employer/interviews/calendar` around 1349×898 and verify:

- No title/description or Today control.
- Previous month sits outside the left edge without overlap.
- Next month floats over the right border without covering a date or event.
- Calendar has seven equal columns, polished surfaces, and readable events.
- Month navigation and date selection update the grid and agenda.
- No console errors or hydration warnings.

- [ ] **Step 3: Review 390 px presentation**

At 390 px width verify:

- Both arrow controls are above the grid and do not overlap cells.
- Year/month selectors remain usable.
- There is no horizontal overflow.
- Event counts, selected date, and agenda remain readable.

- [ ] **Step 4: Record any verification-only correction**

If browser evidence exposes a layout defect, first add or adjust the narrowest
relevant test where feasible, then patch only the two calendar component files,
rerun the focused test, and commit with:

```powershell
git add -- src/components/features/employer/interviews/interview-calendar.tsx src/components/features/employer/interviews/interview-calendar.module.css src/components/features/employer/interviews/interview-calendar.test.tsx
git commit -m "fix: refine interview calendar responsiveness"
```
