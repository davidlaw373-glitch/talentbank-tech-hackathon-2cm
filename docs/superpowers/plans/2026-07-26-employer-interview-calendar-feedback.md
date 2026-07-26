# Employer Interview Calendar Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the annotated calendar feedback with an immediate selected boundary, a colored calendar workspace, non-overlapping desktop arrows, and revised selected-date colors.

**Architecture:** Keep state and markup in `InterviewCalendar` and responsive geometry in its colocated CSS module. Add one behavioral regression test for month navigation; verify visual-only frame and color requirements in the browser.

**Tech Stack:** React, TypeScript, Tailwind CSS, CSS Modules, Vitest, Testing Library

## Global Constraints

- Work on the current branch and preserve unrelated dirty workspace changes.
- The calendar workspace includes the toolbar and calendar but excludes Selected date.
- Neither desktop month arrow may overlap the calendar.
- The selected boundary appears immediately and does not transition `box-shadow`.
- The Selected date section uses a fitting token background and the empty state uses `surface-1`.
- Preserve calendar data, grid semantics, date selection, and mobile behavior.
- Add no dependencies and use only CareerOS tokens.

---

### Task 1: Add the month-selection regression test

**Files:**
- Modify: `src/components/features/employer/interviews/interview-calendar.test.tsx`

**Interfaces:**
- Consumes: `InterviewCalendar`, the `Next month` button, and gridcell `aria-selected`
- Produces: regression coverage for immediate selected-boundary styling

- [ ] **Step 1: Write the failing test**

Add:

```tsx
it("selects the first date of the next month without delaying its boundary", async () => {
  const user = userEvent.setup();
  render(<InterviewCalendar initialYear={2026} initialMonth={6} />);

  await user.click(screen.getByRole("button", { name: "Next month" }));

  const selectedDate = screen.getByRole("gridcell", {
    name: "Saturday, August 1, 2026, 0 scheduled interviews",
  });
  expect(selectedDate.getAttribute("aria-selected")).toBe("true");
  expect(selectedDate.className).not.toContain("box-shadow");
});
```

- [ ] **Step 2: Run the focused test and verify RED**

```powershell
npx vitest run src/components/features/employer/interviews/interview-calendar.test.tsx
```

Expected: FAIL because the selected date cell still contains
`transition-[background-color,box-shadow]`.

- [ ] **Step 3: Commit the red test**

```powershell
git add -- src/components/features/employer/interviews/interview-calendar.test.tsx
git commit -m "test: cover immediate calendar selection boundary"
```

### Task 2: Implement the calendar workspace and visual corrections

**Files:**
- Modify: `src/components/features/employer/interviews/interview-calendar.tsx`
- Modify: `src/components/features/employer/interviews/interview-calendar.module.css`

**Interfaces:**
- Consumes: existing toolbar, calendar region, calendar frame, and agenda
- Produces: `.calendarWorkspace`, a three-column desktop `.calendarFrame`, and immediate selected boundaries

- [ ] **Step 1: Group the toolbar and calendar**

Wrap the current header and calendar region in:

```tsx
<div
  data-testid="calendar-workspace"
  className="space-y-5 rounded-3xl border bg-accent-soft/30 p-4 shadow-sm sm:p-5"
>
  {/* current header */}
  {/* current Scheduled interview calendar section */}
</div>
```

Keep the Selected date section after this closing `div`.

- [ ] **Step 2: Make the selected boundary immediate**

Change the gridcell transition class from:

```tsx
transition-[background-color,box-shadow]
```

to:

```tsx
transition-colors
```

Keep the selected `ring-2 ring-inset ring-primary` classes unchanged.

- [ ] **Step 3: Move both desktop arrows outside the calendar**

Update the CSS module:

```css
.calendarFrame {
  position: relative;
  display: grid;
  grid-template-columns: 2.75rem minmax(0, 1fr) 2.75rem;
  gap: 0.75rem;
  align-items: center;
}

.previousRail {
  grid-column: 1;
}

.calendarShell {
  grid-column: 2;
}

.nextOverlay {
  position: static;
  grid-column: 3;
  transform: none;
}
```

Retain the mobile rule that places the arrows above the calendar, updating its
columns only where necessary to preserve the existing layout.

- [ ] **Step 4: Revise Selected date and empty-state colors**

Set the Selected date section to a token background such as:

```tsx
className="space-y-4 rounded-2xl border bg-highlight-soft/45 p-4 sm:p-5"
```

Set the empty-state card to:

```tsx
className="border-border/60 bg-surface-1 shadow-sm"
```

- [ ] **Step 5: Run the focused test and verify GREEN**

```powershell
npx vitest run src/components/features/employer/interviews/interview-calendar.test.tsx
```

Expected: all component tests PASS.

- [ ] **Step 6: Commit the implementation**

```powershell
git add -- src/components/features/employer/interviews/interview-calendar.tsx src/components/features/employer/interviews/interview-calendar.module.css
git commit -m "fix: refine interview calendar feedback"
```

### Task 3: Verify the completed calendar

**Files:**
- Verify only

**Interfaces:**
- Consumes: completed calendar implementation
- Produces: automated and browser evidence

- [ ] **Step 1: Run automated checks**

```powershell
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Expected: tests, TypeScript, and build pass; lint has no new errors.

- [ ] **Step 2: Verify desktop layout**

At approximately 1349×898 confirm:

- Toolbar and calendar share one colored rounded workspace.
- Selected date is outside the workspace.
- Both arrows have positive gaps from the calendar border.
- After next-month navigation, August 1 immediately has the selected boundary.
- Empty state is white and Selected date uses the contrasting token background.
- No horizontal overflow or console errors.

- [ ] **Step 3: Verify mobile layout**

At 390 px confirm both arrows sit above the grid, the calendar workspace fits
without horizontal overflow, and the selected agenda remains readable.
