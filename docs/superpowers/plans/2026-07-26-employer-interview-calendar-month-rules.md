# Employer Interview Calendar Month Rules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Limit each calendar page to its current month's dates, preserve explicit date selection while browsing, equalize cell heights, and apply one new shared background color.

**Architecture:** Keep the 42-position month model for stable weekday alignment, but render adjacent-month positions as inert placeholders. Separate view updates from selection updates in `InterviewCalendar`, define fixed date rows in its CSS module, and add one theme-level `calendar-surface` token used by both major sections.

**Tech Stack:** React, TypeScript, Tailwind CSS, CSS Modules, Vitest, Testing Library

## Global Constraints

- Work on the current branch and preserve unrelated dirty workspace changes.
- Only current-month dates are visible and interactive.
- Month browsing never changes `selectedDate`.
- All six date rows have equal fixed height.
- Calendar and Selected date use the same new token color.
- Use a new design token rather than a hardcoded component color.
- Preserve scheduled-event data, agenda behavior, keyboard access, and mobile overflow safety.

---

### Task 1: Define the month-only and persistent-selection contracts

**Files:**
- Modify: `src/components/features/employer/interviews/interview-calendar.test.tsx`

**Interfaces:**
- Consumes: `InterviewCalendar({ initialYear?: number, initialMonth?: number })`
- Produces: regression coverage for current-month gridcells and selection independent from browsing

- [ ] **Step 1: Replace the previous date-continuity tests**

Remove tests that expect month navigation to move the selection to the same day
in the next month. Add:

```tsx
it("exposes only dates from the viewed month as gridcells", () => {
  render(<InterviewCalendar initialYear={2026} initialMonth={6} />);

  expect(screen.getAllByRole("gridcell")).toHaveLength(31);
  expect(screen.queryByRole("gridcell", {
    name: "Monday, June 29, 2026, 0 scheduled interviews",
  })).toBeNull();
  expect(screen.queryByRole("gridcell", {
    name: "Monday, August 3, 2026, 1 scheduled interview",
  })).toBeNull();
});
```

Add:

```tsx
it("keeps the explicit selected date while browsing another month", async () => {
  const user = userEvent.setup();
  render(<InterviewCalendar initialYear={2026} initialMonth={6} />);

  await user.click(screen.getByRole("button", { name: "Next month" }));

  expect(screen.getByRole("heading", {
    name: "Sunday, July 26",
  })).toBeTruthy();
  expect(
    screen.getAllByRole("gridcell").every(
      (cell) => cell.getAttribute("aria-selected") === "false",
    ),
  ).toBe(true);

  await user.click(screen.getByRole("button", { name: "Previous month" }));

  expect(screen.getByRole("gridcell", {
    name: "Sunday, July 26, 2026, 0 scheduled interviews",
  }).getAttribute("aria-selected")).toBe("true");
});
```

- [ ] **Step 2: Run the focused test and verify RED**

```powershell
npx vitest run src/components/features/employer/interviews/interview-calendar.test.tsx
```

Expected: FAIL because July renders 42 interactive dates and month navigation
changes selection to August 26.

- [ ] **Step 3: Commit the red tests**

```powershell
git add -- src/components/features/employer/interviews/interview-calendar.test.tsx
git commit -m "test: define calendar month browsing rules"
```

### Task 2: Implement month-only rendering and independent selection

**Files:**
- Modify: `src/components/features/employer/interviews/interview-calendar.tsx`

**Interfaces:**
- Consumes: existing `CalendarDay.inCurrentMonth`, `viewYear`, `viewMonth`, and `selectedDate`
- Produces: inert adjacent-month placeholders and view-only `setMonth`

- [ ] **Step 1: Make `setMonth` update only the viewed month**

Replace the current selected-day clamping logic with:

```tsx
const setMonth = (year: number, monthIndex: number) => {
  setViewYear(year);
  setViewMonth(monthIndex);
};
```

- [ ] **Step 2: Render adjacent-month positions as placeholders**

At the start of `days.map`, before event lookup, add:

```tsx
if (!day.inCurrentMonth) {
  return (
    <span
      key={day.key}
      aria-hidden
      className={cn(
        "border-b border-r border-border/40 bg-surface-1",
        (index + 1) % 7 === 0 && "border-r-0",
      )}
    />
  );
}
```

Remove adjacent-month surface logic from the button classes. Remove the
unreachable branch that changes the view when an adjacent date is clicked.

- [ ] **Step 3: Run the focused test and verify GREEN**

```powershell
npx vitest run src/components/features/employer/interviews/interview-calendar.test.tsx
```

Expected: all calendar component tests PASS.

- [ ] **Step 4: Commit the behavior implementation**

```powershell
git add -- src/components/features/employer/interviews/interview-calendar.tsx
git commit -m "fix: separate calendar browsing from selection"
```

### Task 3: Add the shared color token and uniform grid geometry

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/features/employer/interviews/interview-calendar.tsx`
- Modify: `src/components/features/employer/interviews/interview-calendar.module.css`

**Interfaces:**
- Consumes: CareerOS theme variables and calendar CSS module
- Produces: `calendar-surface` / `bg-calendar-surface` and fixed six-row month geometry

- [ ] **Step 1: Add the theme token**

Add to the light theme:

```css
--calendar-surface: #dfe8e7;
```

Add to `.dark`:

```css
--calendar-surface: #263638;
```

Add to `[data-theme="hc"]`:

```css
--calendar-surface: #f5f5f5;
```

Expose it in `@theme inline`:

```css
--color-calendar-surface: var(--calendar-surface);
```

- [ ] **Step 2: Apply the shared section color**

Replace both `bg-surface-tint` on the calendar workspace and
`bg-highlight-soft` on the Selected date section with:

```tsx
bg-calendar-surface
```

Keep the empty-state card `bg-surface-1`.

- [ ] **Step 3: Fix the six date-row heights**

Update the CSS module:

```css
.calendarGrid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  grid-template-rows: auto repeat(6, 7.5rem);
}

@media (max-width: 639px) {
  .calendarGrid {
    grid-template-rows: auto repeat(6, 4.5rem);
  }
}
```

Remove `min-h-20 sm:min-h-32` from date buttons because row sizing now belongs
to the grid.

- [ ] **Step 4: Run focused tests and TypeScript**

```powershell
npx vitest run src/components/features/employer/interviews/interview-calendar.test.tsx
npx tsc --noEmit
```

Expected: tests and TypeScript PASS.

- [ ] **Step 5: Commit the visual implementation**

```powershell
git add -- src/app/globals.css src/components/features/employer/interviews/interview-calendar.tsx src/components/features/employer/interviews/interview-calendar.module.css
git commit -m "style: unify interview calendar surfaces"
```

### Task 4: Verify the completed calendar

**Files:**
- Verify only

**Interfaces:**
- Consumes: final calendar implementation
- Produces: automated and browser evidence

- [ ] **Step 1: Run automated checks**

```powershell
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Expected: tests, TypeScript, and build pass; lint has no new errors.

- [ ] **Step 2: Verify desktop behavior and geometry**

At approximately 1349×898 confirm:

- Adjacent-month positions are blank.
- July has 31 interactive gridcells.
- All six date rows have the same computed height.
- Browsing August leaves Selected date on July 26 and August has no selected
  gridcell.
- Returning to July restores the July 26 selected boundary.
- Calendar and Selected date have identical computed backgrounds.

- [ ] **Step 3: Verify mobile behavior**

At 390 px confirm all six date rows share the same compact height, event counts
remain readable, and there is no horizontal overflow.
