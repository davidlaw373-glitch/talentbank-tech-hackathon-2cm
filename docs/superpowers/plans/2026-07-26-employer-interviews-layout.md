# Employer Interviews Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split employer interviews into a Jobs-aligned priority overview and a dedicated searchable all-interviews management page while preserving interview-specific actions.

**Architecture:** Move the current route-sized client implementation into focused employer feature components. Shared data helpers, row presentation, and the scheduling dialog support two small route compositions: an overview at `/employer/interviews` and complete management at `/employer/interviews/all`.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui, Lucide, Vitest, Testing Library

## Global Constraints

- Reuse CareerOS tokens, type utilities, shared cards, badges, buttons, dialogs, and `lift-on-hover`; do not hardcode colors.
- Preserve Schedule, Confirm, Join, Reschedule, Notes, Cancel, and View details behavior.
- Do not add resume preview, document preview, backend persistence, calendar integration, or new dependencies.
- Keep both route files as small composition boundaries.
- Preserve keyboard operation, visible focus, semantic status text, responsive wrapping, and reduced-motion support.
- Do not modify unrelated Jobs, candidate, offers, or university code or stage existing user changes.

## File Structure

- Create `src/components/features/employer/interviews/interview-data.ts`: seed rows, status/type options, priority sorting, and pure filtering.
- Create `src/components/features/employer/interviews/interview-data.test.ts`: unit coverage for priority and filtering.
- Create `src/components/features/employer/interviews/interview-schedule-dialog.tsx`: existing scheduling form/dialog behavior extracted from the route.
- Create `src/components/features/employer/interviews/interview-row.tsx`: shared priority/all row presentation and status-specific actions.
- Create `src/components/features/employer/interviews/interview-overview.tsx`: overview state, stats, priority list, scheduling, toasts, and cancellation dialog.
- Create `src/components/features/employer/interviews/interview-overview.test.tsx`: overview composition and priority-action coverage.
- Create `src/components/features/employer/interviews/all-interviews-management.tsx`: complete management state, filters, actions, and cancellation dialog.
- Create `src/components/features/employer/interviews/all-interviews-management.module.css`: responsive toolbar and full-row layout.
- Create `src/components/features/employer/interviews/all-interviews-management.test.tsx`: filter and status-action coverage.
- Modify `src/app/employer/interviews/page.tsx`: compose `InterviewOverview`.
- Create `src/app/employer/interviews/all/page.tsx`: compose `AllInterviewsManagement`.

---

### Task 1: Shared interview data behavior

**Files:**
- Create: `src/components/features/employer/interviews/interview-data.ts`
- Create: `src/components/features/employer/interviews/interview-data.test.ts`

**Interfaces:**
- Consumes: `EmployerInterviewRow`, `InterviewStatus`, `InterviewType`, `getEmployerCandidateRows(1)`, and `getEmployerInterviewRows(1)`.
- Produces: `INTERVIEW_STATUSES`, `INTERVIEW_TYPES`, `getEmployerInterviewSeedRows()`, `sortInterviewRowsByPriority(rows)`, and `filterInterviewRows(rows, filters)`.

- [ ] **Step 1: Write failing tests for sorting and filtering**

```ts
import { describe, expect, it } from "vitest";
import {
  filterInterviewRows,
  getEmployerInterviewSeedRows,
  sortInterviewRowsByPriority,
} from "./interview-data";

describe("employer interview data", () => {
  it("orders interviews by the status attention sequence", () => {
    const rows = getEmployerInterviewSeedRows();
    const ordered = sortInterviewRowsByPriority(rows);
    const ranks = ordered.map((row) => row.interview.status);

    expect(ranks.indexOf("Scheduled")).toBeLessThan(
      ranks.indexOf("Pending confirmation"),
    );
    expect(ranks.indexOf("Pending confirmation")).toBeLessThan(
      ranks.indexOf("Reschedule requested"),
    );
  });

  it("filters by searchable identity, status, and type", () => {
    const rows = getEmployerInterviewSeedRows();
    const result = filterInterviewRows(rows, {
      query: "aisha",
      status: "Scheduled",
      type: "Technical",
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.candidate.name).toBe("Aisha Khan");
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
npm test -- src/components/features/employer/interviews/interview-data.test.ts
```

Expected: FAIL because `./interview-data` does not exist.

- [ ] **Step 3: Implement the pure data module**

```ts
export type InterviewFilters = {
  query: string;
  status: InterviewStatus | "All";
  type: InterviewType | "All";
};

export function sortInterviewRowsByPriority(rows: EmployerInterviewRow[]) {
  return [...rows].sort(
    (a, b) =>
      STATUS_PRIORITY[a.interview.status] -
      STATUS_PRIORITY[b.interview.status],
  );
}

export function filterInterviewRows(
  rows: EmployerInterviewRow[],
  filters: InterviewFilters,
) {
  const query = filters.query.trim().toLowerCase();
  return sortInterviewRowsByPriority(rows).filter((row) => {
    const searchable =
      `${row.candidate.name} ${row.job.title} ${row.interview.interviewers.join(" ")}`.toLowerCase();
    return (
      (!query || searchable.includes(query)) &&
      (filters.status === "All" ||
        row.interview.status === filters.status) &&
      (filters.type === "All" || row.interview.type === filters.type)
    );
  });
}
```

Move the current status/type constants, status-priority map, and seed-row
construction from the route into this module without changing fixture values.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```powershell
npm test -- src/components/features/employer/interviews/interview-data.test.ts
```

Expected: 2 tests PASS with no warnings.

- [ ] **Step 5: Commit the shared data behavior**

```powershell
git add -- src/components/features/employer/interviews/interview-data.ts src/components/features/employer/interviews/interview-data.test.ts
git commit -m "refactor: extract employer interview data helpers"
```

### Task 2: Priority overview and shared row

**Files:**
- Create: `src/components/features/employer/interviews/interview-row.tsx`
- Create: `src/components/features/employer/interviews/interview-schedule-dialog.tsx`
- Create: `src/components/features/employer/interviews/interview-overview.tsx`
- Create: `src/components/features/employer/interviews/interview-overview.test.tsx`
- Modify: `src/app/employer/interviews/page.tsx`

**Interfaces:**
- Consumes: `getEmployerInterviewSeedRows()`, `sortInterviewRowsByPriority()`, `EmployerInterviewRow`, `useToast()`, `ConfirmDialog`, and existing scheduling form behavior.
- Produces: `InterviewRow({ row, mode, actions })`, `InterviewScheduleDialog`, and `InterviewOverview`.

- [ ] **Step 1: Write the failing overview test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InterviewOverview } from "./interview-overview";

describe("InterviewOverview", () => {
  it("shows a Jobs-aligned priority section and links to complete management", () => {
    render(<InterviewOverview />);

    expect(
      screen.getByRole("heading", { name: "Priority interviews" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View all interviews" }),
    ).toHaveAttribute("href", "/employer/interviews/all");
    expect(
      screen.getByRole("button", { name: "Schedule interview" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Search interviews"),
    ).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the overview test and verify RED**

Run:

```powershell
npm test -- src/components/features/employer/interviews/interview-overview.test.tsx
```

Expected: FAIL because `InterviewOverview` does not exist.

- [ ] **Step 3: Implement the shared row and overview**

Implement:

```ts
export type InterviewRowActions = {
  onConfirm: () => void;
  onReschedule: () => void;
  onRequestCancel: () => void;
  onJoin: () => void;
  onViewNotes: () => void;
  onView: () => void;
};

export function InterviewRow({
  row,
  mode,
  actions,
}: {
  row: EmployerInterviewRow;
  mode: "priority" | "all";
  actions: InterviewRowActions;
}) {
  const showCompleteActions = mode === "all";
  const { candidate, job, interview } = row;

  return (
    <li>
      <Card className="lift-on-hover">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-body font-medium">{candidate.name}</h3>
            <p className="text-meta text-muted-foreground">
              {job.title} · {interview.type}
            </p>
          </div>
          <div>
            <Badge variant={statusVariant(interview.status)}>
              {interview.status}
            </Badge>
            {interview.status === "Scheduled" ? (
              <>
                <Button size="sm" onClick={actions.onJoin}>Join</Button>
                <Button size="sm" variant="outline" onClick={actions.onReschedule}>
                  Reschedule
                </Button>
                {showCompleteActions ? (
                  <>
                    <Button size="sm" variant="outline" onClick={actions.onViewNotes}>
                      View notes
                    </Button>
                    <Button size="sm" variant="destructive" onClick={actions.onRequestCancel}>
                      Cancel
                    </Button>
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </li>
  );
}
```

Add the remaining all-mode status branches exactly as specified in the design:
Pending confirmation exposes Confirm/Reschedule/Cancel; Reschedule requested
exposes Propose new slot/View notes/Cancel; Completed exposes View notes; and
Cancelled exposes View details. Keep the current candidate initials,
interviewers, schedule, duration, and scorecard metadata markup in the shared
identity block.

Compose the overview with:

```tsx
<PageHeading
  title="Interview management"
  description="Review priority interviews and act on what needs attention next."
  action={
    <Button onClick={() => setScheduleOpen(true)}>
      <CalendarPlus />
      Schedule interview
    </Button>
  }
/>

<section aria-label="Interview status counts" className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
  {[
    { label: "Upcoming", value: counts.upcoming, icon: Calendar },
    { label: "Pending confirmation", value: counts.pending, icon: Clock },
    { label: "Reschedule requested", value: counts.reschedule, icon: ClipboardList },
    { label: "Completed", value: counts.completed, icon: Users },
  ].map(({ label, value, icon: Icon }) => (
    <Card key={label}>
      <CardContent className="flex items-center gap-3 p-5">
        <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
          <p className="text-sm font-medium">{label}</p>
        </div>
      </CardContent>
    </Card>
  ))}
</section>

<section className="space-y-3">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h2>Priority interviews</h2>
      <p className="text-sm text-muted-foreground">
        Interviews ordered by what needs attention next.
      </p>
    </div>
    <Button asChild className="bg-highlight-soft text-foreground hover:bg-highlight-soft/80">
      <Link href="/employer/interviews/all">View all interviews</Link>
    </Button>
  </div>
  <ul aria-label="Priority interviews" className="space-y-3">
    {priorityRows.map((row) => (
      <InterviewRow
        key={row.interview.id}
        row={row}
        mode="priority"
        actions={createRowActions(row)}
      />
    ))}
  </ul>
</section>
```

Extract the current native dialog scheduling form into
`interview-schedule-dialog.tsx`, preserving its labels, validation, date/time
composition, candidate options, and submit behavior.

Replace `src/app/employer/interviews/page.tsx` with:

```tsx
import { InterviewOverview } from "@/components/features/employer/interviews/interview-overview";

export default function EmployerInterviewsPage() {
  return <InterviewOverview />;
}
```

- [ ] **Step 4: Run the overview test and verify GREEN**

Run:

```powershell
npm test -- src/components/features/employer/interviews/interview-overview.test.tsx
```

Expected: PASS; no nested fixed-height scroll container exists in the rendered overview.

- [ ] **Step 5: Add a failing action-visibility test**

```tsx
it("keeps destructive management actions out of priority rows", () => {
  render(<InterviewOverview />);

  expect(
    screen.queryByRole("button", { name: "Cancel interview" }),
  ).not.toBeInTheDocument();
  expect(screen.getAllByRole("button", { name: "Join" }).length).toBeGreaterThan(0);
});
```

Run the focused test and confirm it fails if priority rows still expose complete
management actions. Make the minimal `mode="priority"` adjustment, then rerun
until PASS.

- [ ] **Step 6: Commit the overview**

```powershell
git add -- src/app/employer/interviews/page.tsx src/components/features/employer/interviews/interview-row.tsx src/components/features/employer/interviews/interview-schedule-dialog.tsx src/components/features/employer/interviews/interview-overview.tsx src/components/features/employer/interviews/interview-overview.test.tsx
git commit -m "feat: align employer interview overview with jobs"
```

### Task 3: Complete interviews management route

**Files:**
- Create: `src/app/employer/interviews/all/page.tsx`
- Create: `src/components/features/employer/interviews/all-interviews-management.tsx`
- Create: `src/components/features/employer/interviews/all-interviews-management.module.css`
- Create: `src/components/features/employer/interviews/all-interviews-management.test.tsx`

**Interfaces:**
- Consumes: shared data helpers, `InterviewRow` with `mode="all"`, `InterviewScheduleDialog`, and existing toast/confirmation components.
- Produces: `AllInterviewsManagement` and the `/employer/interviews/all` route.

- [ ] **Step 1: Write the failing filter test**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AllInterviewsManagement } from "./all-interviews-management";

describe("AllInterviewsManagement", () => {
  it("filters the complete list by candidate search", async () => {
    const user = userEvent.setup();
    render(<AllInterviewsManagement />);

    await user.type(
      screen.getByRole("textbox", { name: "Search interviews" }),
      "Aisha",
    );

    expect(screen.getByText("Aisha Khan")).toBeInTheDocument();
    expect(screen.queryByText("Marco Okafor")).not.toBeInTheDocument();
    expect(screen.getByText("1 interview")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the management test and verify RED**

Run:

```powershell
npm test -- src/components/features/employer/interviews/all-interviews-management.test.tsx
```

Expected: FAIL because `AllInterviewsManagement` does not exist.

- [ ] **Step 3: Implement toolbar, filters, results, and route**

Use the Jobs all-view layout:

```tsx
<div className={`${styles.toolbar} border-b pb-6`}>
  <Button asChild variant="outline" size="icon" className="bg-surface-1 hover:bg-surface-2">
    <Link href="/employer/interviews" aria-label="Back to interview overview">
      <ArrowLeft />
    </Link>
  </Button>
  <section aria-label="Interview filters" className={styles.filters}>
    <div>
      <label htmlFor="all-interview-search" className="sr-only">Search interviews</label>
      <Input
        id="all-interview-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Candidate, role, or interviewer"
      />
    </div>
    <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
      <SelectTrigger aria-label="Interview status"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="All">All statuses</SelectItem>
        {INTERVIEW_STATUSES.map((option) => (
          <SelectItem key={option} value={option}>{option}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Select value={type} onValueChange={(value) => setType(value as TypeFilter)}>
      <SelectTrigger aria-label="Interview type"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="All">All interview types</SelectItem>
        {INTERVIEW_TYPES.map((option) => (
          <SelectItem key={option} value={option}>{option}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </section>
</div>

<section aria-label="All interviews" className="space-y-4">
  <div>
    <h2>Interview schedule</h2>
    <p className="text-meta text-muted-foreground">
      {filteredRows.length} {filteredRows.length === 1 ? "interview" : "interviews"}
    </p>
  </div>
  {filteredRows.length === 0 ? (
    <p className="py-16 text-center text-body text-muted-foreground">
      No interviews match the current search and filters.
    </p>
  ) : (
    <ul aria-label="Complete interview list" className="space-y-4">
      {filteredRows.map((row) => (
        <InterviewRow
          key={row.interview.id}
          row={row}
          mode="all"
          actions={createRowActions(row)}
        />
      ))}
    </ul>
  )}
</section>
```

Render `InterviewRow` with `mode="all"` and wire the existing status changes and
toasts. Preserve the cancellation confirmation dialog.

Create the route:

```tsx
import { AllInterviewsManagement } from "@/components/features/employer/interviews/all-interviews-management";

export default function AllEmployerInterviewsPage() {
  return <AllInterviewsManagement />;
}
```

Create CSS matching the Jobs responsive structure:

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
    grid-template-columns: minmax(0, 1fr) 14rem 14rem;
  }
}

@media (max-width: 639px) {
  .toolbar {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

- [ ] **Step 4: Run the filter test and verify GREEN**

Run:

```powershell
npm test -- src/components/features/employer/interviews/all-interviews-management.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Add and verify a status-action test**

```tsx
it("exposes complete management actions for a scheduled interview", () => {
  render(<AllInterviewsManagement />);

  expect(screen.getAllByRole("button", { name: "Join" }).length).toBeGreaterThan(0);
  expect(
    screen.getAllByRole("button", { name: "View notes" }).length,
  ).toBeGreaterThan(0);
  expect(
    screen.getAllByRole("button", { name: "Cancel interview" }).length,
  ).toBeGreaterThan(0);
});
```

Run the test, confirm the expected RED if accessible action labels are missing,
add exact row-level `aria-label` values, and rerun until PASS.

- [ ] **Step 6: Commit the complete management route**

```powershell
git add -- src/app/employer/interviews/all/page.tsx src/components/features/employer/interviews/all-interviews-management.tsx src/components/features/employer/interviews/all-interviews-management.module.css src/components/features/employer/interviews/all-interviews-management.test.tsx src/components/features/employer/interviews/interview-row.tsx
git commit -m "feat: add complete employer interview management view"
```

### Task 4: Regression and visual verification

**Files:**
- Modify only files from Tasks 1–3 if verification exposes a defect.

**Interfaces:**
- Consumes: completed overview and all-interviews routes.
- Produces: verified responsive and accessible implementation.

- [ ] **Step 1: Run all interview-focused tests**

```powershell
npm test -- src/components/features/employer/interviews
```

Expected: all interview tests PASS without React or accessibility warnings.

- [ ] **Step 2: Run project static verification**

```powershell
npx tsc --noEmit
npm run lint
```

Expected: both commands exit 0. If unrelated pre-existing failures appear,
record them separately and do not modify unrelated files.

- [ ] **Step 3: Run the production build**

```powershell
npm run build
```

Expected: build exits 0 and both `/employer/interviews` and
`/employer/interviews/all` are included.

- [ ] **Step 4: Verify desktop overview in the in-app browser**

At `http://localhost:3000/employer/interviews`, confirm:

- heading, Schedule interview, four stats, priority heading, and warm View all
  action are visible;
- standalone cards replace the fixed-height inset scroller;
- priority rows do not expose Cancel or Notes;
- no horizontal overflow or console errors occur.

- [ ] **Step 5: Verify the complete management view**

At `http://localhost:3000/employer/interviews/all`, confirm:

- back control returns to the overview;
- search, status, and type filters update result count;
- Join, Reschedule, Notes, Confirm, Cancel, and details actions match statuses;
- cancellation confirmation and schedule dialog remain keyboard operable.

- [ ] **Step 6: Verify mobile and reduced motion**

Test at 390×844:

- toolbar stacks without overflow;
- long identity and interviewer text stay within cards;
- controls remain reachable and focus rings are visible.

Enable reduced motion and confirm card transitions do not produce required
information or block interaction.

- [ ] **Step 7: Review the final diff**

```powershell
git diff --check
git status --short
git diff -- src/app/employer/interviews src/components/features/employer/interviews
```

Confirm no unrelated user files are staged or changed by this implementation.

- [ ] **Step 8: Commit verification fixes if needed**

```powershell
git add -- src/app/employer/interviews src/components/features/employer/interviews
git commit -m "test: verify employer interview management flows"
```
