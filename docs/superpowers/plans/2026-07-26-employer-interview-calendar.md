# Employer Interview Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the overview scheduling button with a dedicated month calendar that shows every Scheduled candidate on the correct date with role and time.

**Architecture:** Add a required ISO `scheduledAt` field to interview records and pure Singapore-time calendar helpers. A focused client calendar component owns month navigation and date selection, while a small App Router page exposes `/employer/interviews/calendar`.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui, Lucide, Vitest, Testing Library

## Global Constraints

- Work on the current branch as explicitly authorized by the user.
- Use `Asia/Singapore` for calendar date grouping and time display.
- Show only interviews whose status is exactly `Scheduled`.
- Keep `scheduledFor` for compact list copy and make `scheduledAt` the calendar source of truth.
- Do not add dependencies, external calendar synchronization, event editing, drag/drop, recurrence, or week/day timeline views.
- Use existing CareerOS tokens, typography, motion, controls, cards, and focus behavior.
- Preserve unrelated user changes and do not modify Jobs, candidates, offers, or university features.

## File Structure

- Modify `src/types/interview.ts`: add required `scheduledAt: string`.
- Modify `src/data/interviews.json`: add ISO timestamps to all fixtures.
- Modify `src/components/features/employer/interviews/interview-data.ts`: add timestamps to generated seed rows.
- Modify `src/components/features/employer/interviews/interview-schedule-dialog.tsx`: derive `scheduledAt` from a `datetime-local` control.
- Create `src/components/features/employer/interviews/interview-calendar-data.ts`: pure calendar/date grouping helpers.
- Create `src/components/features/employer/interviews/interview-calendar-data.test.ts`: helper behavior tests.
- Create `src/components/features/employer/interviews/interview-calendar.tsx`: calendar UI, navigation, selection, and agenda.
- Create `src/components/features/employer/interviews/interview-calendar.test.tsx`: component interaction tests.
- Create `src/app/employer/interviews/calendar/page.tsx`: route composition.
- Modify `src/components/features/employer/interviews/interview-overview.tsx`: replace Schedule interview with Scheduled calendar.
- Modify `src/components/features/employer/interviews/interview-overview.test.tsx`: verify the new route entry.

---

### Task 1: Calendar-ready interview dates

**Files:**
- Modify: `src/types/interview.ts`
- Modify: `src/data/interviews.json`
- Modify: `src/components/features/employer/interviews/interview-data.ts`
- Modify: `src/components/features/employer/interviews/interview-schedule-dialog.tsx`
- Create: `src/components/features/employer/interviews/interview-calendar-data.ts`
- Create: `src/components/features/employer/interviews/interview-calendar-data.test.ts`

**Interfaces:**
- Consumes: `Interview`, `EmployerInterviewRow`, and ISO 8601 timestamps.
- Produces:
  - `SINGAPORE_TIME_ZONE`
  - `getCalendarDateKey(iso: string): string | null`
  - `getMonthDays(year: number, monthIndex: number): CalendarDay[]`
  - `getScheduledRowsByDate(rows): Map<string, EmployerInterviewRow[]>`
  - `formatCalendarTime(iso: string): string`

- [ ] **Step 1: Write failing helper tests**

```ts
import { describe, expect, it } from "vitest";
import {
  getCalendarDateKey,
  getMonthDays,
  getScheduledRowsByDate,
} from "./interview-calendar-data";
import { getEmployerInterviewSeedRows } from "./interview-data";

describe("interview calendar data", () => {
  it("groups an offset timestamp by its Singapore calendar date", () => {
    expect(getCalendarDateKey("2026-07-26T18:30:00Z")).toBe("2026-07-27");
  });

  it("builds a Monday-first six-week grid for July 2026", () => {
    const days = getMonthDays(2026, 6);
    expect(days).toHaveLength(42);
    expect(days[0]?.key).toBe("2026-06-29");
    expect(days[41]?.key).toBe("2026-08-09");
  });

  it("excludes non-Scheduled interviews and sorts each day by time", () => {
    const grouped = getScheduledRowsByDate(getEmployerInterviewSeedRows());
    const july27 = grouped.get("2026-07-27") ?? [];

    expect(july27.map((row) => row.candidate.name)).toEqual([
      "Aisha Khan",
      "Sara Park",
    ]);
    expect(
      [...grouped.values()].flat().every(
        (row) => row.interview.status === "Scheduled",
      ),
    ).toBe(true);
  });
});
```

- [ ] **Step 2: Run the helper test and verify RED**

```powershell
npm test -- src/components/features/employer/interviews/interview-calendar-data.test.ts
```

Expected: FAIL because `interview-calendar-data.ts` does not exist.

- [ ] **Step 3: Add `scheduledAt` to the domain and fixtures**

Add to `Interview`:

```ts
/** ISO timestamp used for calendar grouping and sorting. */
scheduledAt: string;
```

Use these concrete fixture timestamps:

```json
[
  "2026-07-27T10:00:00+08:00",
  "2026-07-27T14:00:00+08:00",
  "2026-07-30T15:00:00+08:00",
  "2026-07-20T11:00:00+08:00",
  "2026-07-22T16:00:00+08:00"
]
```

Use these generated seed timestamps:

```ts
[
  "2026-07-31T09:30:00+08:00",
  "2026-08-03T11:00:00+08:00",
  "2026-08-04T16:00:00+08:00",
]
```

Extend `ScheduleInterviewValues` with `scheduledAt`, change the date/time input
to `type="datetime-local"`, and on submit convert the entered value to a
Singapore-offset ISO string with the helper implemented below.

- [ ] **Step 4: Implement pure calendar helpers**

```ts
export const SINGAPORE_TIME_ZONE = "Asia/Singapore";

export type CalendarDay = {
  key: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
};

export function getCalendarDateKey(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SINGAPORE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function formatCalendarTime(iso: string) {
  return new Intl.DateTimeFormat("en-SG", {
    timeZone: SINGAPORE_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}
```

`getMonthDays` calculates the Monday offset with
`(firstDay.getUTCDay() + 6) % 7`, starts at the preceding Monday, and returns
exactly 42 `CalendarDay` records. `getScheduledRowsByDate` ignores invalid
timestamps and non-Scheduled statuses, groups by date key, and sorts each group
by `scheduledAt`.

- [ ] **Step 5: Run helper tests and type-check**

```powershell
npm test -- src/components/features/employer/interviews/interview-calendar-data.test.ts
npx tsc --noEmit
```

Expected: helper tests PASS and TypeScript exits 0.

- [ ] **Step 6: Commit calendar data support**

```powershell
git add -- src/types/interview.ts src/data/interviews.json src/components/features/employer/interviews/interview-data.ts src/components/features/employer/interviews/interview-schedule-dialog.tsx src/components/features/employer/interviews/interview-calendar-data.ts src/components/features/employer/interviews/interview-calendar-data.test.ts
git commit -m "feat: add calendar-ready interview dates"
```

### Task 2: Scheduled interview month calendar

**Files:**
- Create: `src/components/features/employer/interviews/interview-calendar.tsx`
- Create: `src/components/features/employer/interviews/interview-calendar.test.tsx`
- Create: `src/app/employer/interviews/calendar/page.tsx`

**Interfaces:**
- Consumes: `getEmployerInterviewSeedRows()`, `getMonthDays()`,
  `getScheduledRowsByDate()`, `formatCalendarTime()`.
- Produces: `InterviewCalendar({ initialYear?, initialMonth? })`.

- [ ] **Step 1: Write failing calendar interaction tests**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { InterviewCalendar } from "./interview-calendar";

describe("InterviewCalendar", () => {
  it("shows scheduled candidate, role, and time on the matching date", () => {
    render(<InterviewCalendar initialYear={2026} initialMonth={6} />);
    expect(screen.getByText("Aisha Khan")).toBeTruthy();
    expect(screen.getAllByText("Senior Frontend Engineer").length).toBeGreaterThan(0);
    expect(screen.getByText("10:00")).toBeTruthy();
  });

  it("moves to the next month and updates the month selector", async () => {
    const user = userEvent.setup();
    render(<InterviewCalendar initialYear={2026} initialMonth={6} />);
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(
      (screen.getByRole("combobox", { name: "Month" }) as HTMLSelectElement)
        .value,
    ).toBe("7");
  });

  it("selects a date and exposes its complete daily agenda", async () => {
    const user = userEvent.setup();
    render(<InterviewCalendar initialYear={2026} initialMonth={6} />);
    await user.click(
      screen.getByRole("button", {
        name: "Monday, July 27, 2026, 2 scheduled interviews",
      }),
    );
    expect(
      screen.getByRole("heading", { name: "Monday, July 27" }),
    ).toBeTruthy();
    expect(screen.getAllByText("Aisha Khan").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sara Park").length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the component test and verify RED**

```powershell
npm test -- src/components/features/employer/interviews/interview-calendar.test.tsx
```

Expected: FAIL because `InterviewCalendar` does not exist.

- [ ] **Step 3: Implement calendar navigation and grid**

Implement state:

```ts
const now = new Date();
const [viewYear, setViewYear] = useState(initialYear ?? singaporeYear(now));
const [viewMonth, setViewMonth] = useState(initialMonth ?? singaporeMonth(now));
const [selectedDate, setSelectedDate] = useState(
  `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-01`,
);
```

Render:

- Back link to `/employer/interviews`.
- `Today`, `Previous month`, and `Next month` buttons.
- Visible `Year` and `Month` labels attached to native shared `Select`
  controls.
- Monday-through-Sunday column headings.
- Forty-two date buttons with full accessible date/event-count names.
- Up to two desktop event cards per cell with candidate, role, and time.
- Compact mobile markers via responsive classes.
- A `+N more` indicator when a date has more than two interviews.
- A selected-day agenda under the grid with full interview metadata.

Use `surface-1`, `surface-2`, `surface-inset`, `highlight-soft`, `primary`,
`text-secondary`, and `text-muted` tokens only.

- [ ] **Step 4: Add the small route composition**

```tsx
import { InterviewCalendar } from "@/components/features/employer/interviews/interview-calendar";

export default function EmployerInterviewCalendarPage() {
  return <InterviewCalendar />;
}
```

- [ ] **Step 5: Run component tests and type-check**

```powershell
npm test -- src/components/features/employer/interviews/interview-calendar.test.tsx
npx tsc --noEmit
```

Expected: 3 tests PASS and TypeScript exits 0.

- [ ] **Step 6: Commit the calendar page**

```powershell
git add -- src/components/features/employer/interviews/interview-calendar.tsx src/components/features/employer/interviews/interview-calendar.test.tsx src/app/employer/interviews/calendar/page.tsx
git commit -m "feat: add scheduled interview calendar"
```

### Task 3: Replace the overview action

**Files:**
- Modify: `src/components/features/employer/interviews/interview-overview.tsx`
- Modify: `src/components/features/employer/interviews/interview-overview.test.tsx`

**Interfaces:**
- Consumes: Next.js `Link` and existing shared `Button`.
- Produces: a `Scheduled calendar` link to `/employer/interviews/calendar`.

- [ ] **Step 1: Change the existing overview test first**

Replace the Schedule interview assertion with:

```tsx
expect(
  screen.getByRole("link", { name: "Scheduled calendar" }),
).toHaveProperty(
  "href",
  "http://localhost:3000/employer/interviews/calendar",
);
expect(
  screen.queryByRole("button", { name: "Schedule interview" }),
).toBeNull();
```

- [ ] **Step 2: Run the overview test and verify RED**

```powershell
npm test -- src/components/features/employer/interviews/interview-overview.test.tsx
```

Expected: FAIL because the overview still renders Schedule interview.

- [ ] **Step 3: Replace the heading action**

```tsx
<Button asChild>
  <Link href="/employer/interviews/calendar">
    <CalendarDays />
    Scheduled calendar
  </Link>
</Button>
```

Remove overview scheduling state, scheduling callbacks, the rendered
`InterviewScheduleDialog`, and unused imports. Keep the empty-state scheduling
button out of scope by changing its recovery copy to direct employers to the
candidate pipeline rather than opening the removed dialog.

- [ ] **Step 4: Run overview and calendar tests**

```powershell
npm test -- src/components/features/employer/interviews
```

Expected: all interview feature tests PASS.

- [ ] **Step 5: Commit the overview entry**

```powershell
git add -- src/components/features/employer/interviews/interview-overview.tsx src/components/features/employer/interviews/interview-overview.test.tsx
git commit -m "feat: link interview overview to calendar"
```

### Task 4: Full verification

**Files:**
- Modify only Task 1–3 files if verification reveals a defect.

**Interfaces:**
- Consumes: completed calendar and overview entry.
- Produces: verified desktop/mobile calendar behavior.

- [ ] **Step 1: Run automated verification**

```powershell
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Expected: tests, type-check, lint, and build exit 0. Record unrelated existing
warnings without modifying unrelated files.

- [ ] **Step 2: Verify desktop behavior**

At `http://localhost:3000/employer/interviews` and
`http://localhost:3000/employer/interviews/calendar`, confirm:

- the overview heading action reads Scheduled calendar;
- the link reaches the calendar route;
- July 2026 events appear on their correct dates;
- year/month selectors and previous/next/Today controls update the grid;
- selecting July 27 shows Aisha Khan and Sara Park in the daily agenda;
- no console errors or horizontal overflow occur.

- [ ] **Step 3: Verify mobile behavior**

At 390×844, confirm the seven-column grid stays within the viewport, compact
event markers remain legible, and the selected-day agenda exposes full details.

- [ ] **Step 4: Review and commit any verification fixes**

```powershell
git diff --check -- src/app/employer/interviews src/components/features/employer/interviews src/types/interview.ts src/data/interviews.json
git status --short
```

Do not stage unrelated existing user changes.
