# Employer Candidate Discovery Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the employer candidate rows with searchable, filterable, responsive flip cards that surface evidence-based save decisions and concise AI Match insights.

**Architecture:** Keep the route as the client-side state owner, move filtering and summary derivation into pure feature helpers, and isolate the two-sided interaction in a controlled `CandidateDiscoveryCard`. Use existing local CareerOS data and UI primitives; add only a small Vitest/jsdom test harness to verify helper and interaction behavior before implementation.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn/Radix primitives, Lucide icons, Vitest, jsdom, Testing Library

## Global Constraints

- Use existing CareerOS semantic tokens; do not add hardcoded hex colors.
- Treat `/employer/candidates` as a calm, task-first product surface.
- Keep search and filters visible at all times.
- Show recent experience, one high-signal achievement, and verification on the front.
- Keep AI Match prominent but secondary to employer decision evidence.
- Use icon-only star controls with accessible names and pressed state.
- Do not fabricate portraits or candidate facts.
- Keep full histories, contact data, and pipeline actions on the detail page.
- Respect keyboard, touch, focus-visible, and reduced-motion behavior.
- Do not add backend search, pagination, persistent stars, or remote AI calls.

---

## File Structure

- Create `src/components/features/employer/candidate-discovery.ts`: pure search, filter, sort, achievement, and AI insight helpers.
- Create `src/components/features/employer/candidate-discovery.test.ts`: helper behavior and fallback tests.
- Create `src/components/features/employer/candidate-discovery-card.tsx`: controlled two-sided candidate card.
- Create `src/components/features/employer/candidate-discovery-card.test.tsx`: flip, keyboard, star-isolation, and detail-link tests.
- Modify `src/app/employer/candidates/page.tsx`: discovery toolbar, result count, filter state, responsive grid, and empty states.
- Create `src/app/employer/candidates/page.test.tsx`: route-level composition smoke test.
- Create `vitest.config.ts`: jsdom environment and `@` alias.
- Create `src/test/setup.ts`: DOM cleanup and React act configuration.
- Modify `package.json` and `package-lock.json`: test scripts and test-only dependencies.

### Task 1: Add the test harness and pure candidate discovery helpers

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/components/features/employer/candidate-discovery.test.ts`
- Create: `src/components/features/employer/candidate-discovery.ts`

**Interfaces:**
- Consumes: `EmployerCandidateRow`, `JobCandidateMatchScore`, `ApplicationStage`.
- Produces:
  - `CandidateStageFilter`
  - `CandidateVerificationFilter`
  - `CandidateMatchSort`
  - `CandidateDiscoveryFilters`
  - `CandidateInsight`
  - `filterCandidateRows(rows, filters): EmployerCandidateRow[]`
  - `getCandidateAchievement(row): string`
  - `buildCandidateInsight(row, match): CandidateInsight`

- [ ] **Step 1: Install the focused test dependencies and add scripts**

Run:

```powershell
npm install --save-dev vitest jsdom @testing-library/react @testing-library/user-event
```

Add to `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Create `vitest.config.ts`:

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

Create `src/test/setup.ts`:

```ts
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
afterEach(() => cleanup());
```

- [ ] **Step 2: Write the failing helper tests**

Create a typed `makeRow` fixture and tests with these assertions:

```ts
import { describe, expect, it } from "vitest";
import type { EmployerCandidateRow } from "@/lib/data-helpers";
import type { JobCandidateMatchScore } from "@/types/match-score";
import {
  buildCandidateInsight,
  filterCandidateRows,
  getCandidateAchievement,
} from "./candidate-discovery";

function makeRow(
  id: number,
  overrides: {
    name?: string;
    title?: string;
    company?: string;
    skill?: string;
    role?: string;
    stage?: EmployerCandidateRow["app"]["stage"];
    rejected?: boolean;
    verification?: EmployerCandidateRow["verification"];
    score?: number;
    description?: string;
  } = {},
): EmployerCandidateRow {
  const role = overrides.role ?? "Frontend Engineer";
  return {
    candidate: {
      id,
      name: overrides.name ?? `Candidate ${id}`,
      initials: `C${id}`,
      title: overrides.title ?? "Senior Engineer",
      location: "Singapore",
      email: `candidate${id}@example.com`,
      phone: "+65 0000 0000",
      summary: "Product-minded engineer with strong delivery signals.",
      profileCompletion: 90,
      verificationStatus: "Verified",
      skills: [overrides.skill ?? "React"],
      topSkills: [overrides.skill ?? "React"],
      experience: [{
        id: 1,
        company: overrides.company ?? "Helio",
        role: "Senior Engineer",
        period: "2022 – present",
        description: overrides.description ?? "Reduced checkout latency by 35% across 12M daily sessions.",
      }],
      education: [],
      projects: [],
      evidence: [],
      onboardingComplete: true,
    },
    job: {
      id,
      employerId: 1,
      title: role,
      location: "Singapore",
      workMode: "Hybrid",
      employmentType: "Full-time",
      posted: "2 days ago",
      salary: "SGD 140–180k",
      status: "Live",
      description: role,
      responsibilities: [],
      requirements: [],
      department: "Engineering",
      applicants: 1,
      filledScore: 100,
      mustHave: ["React"],
      niceToHave: [],
      summary: role,
      aboutCompany: "CareerOS",
    },
    app: {
      id,
      candidateId: id,
      jobId: id,
      appliedDate: "2026-07-01",
      stage: overrides.stage ?? "Applied",
      rejected: overrides.rejected ?? false,
      nextAction: "Review",
      timeline: [],
    },
    matchScore: overrides.score ?? 80,
    verification: overrides.verification ?? "Verified",
  };
}

describe("filterCandidateRows", () => {
  const rows = [
    makeRow(1, { name: "Aisha Khan", company: "Helio", skill: "React", score: 94 }),
    makeRow(2, { name: "Miguel Santos", company: "Atlas", skill: "Python", role: "Data Engineer", stage: "Interview", verification: "Pending", score: 71 }),
    makeRow(3, { name: "Priya Rao", role: "Data Engineer", rejected: true, verification: "None", score: 62 }),
  ];

  it.each(["Aisha", "Senior Engineer", "Frontend Engineer", "Helio", "React"])(
    "searches candidate identity and evidence for %s",
    (query) => {
      expect(filterCandidateRows(rows, {
        query,
        role: "All",
        stage: "All",
        verification: "All",
        sort: "desc",
      }).map((row) => row.candidate.id)).toEqual([1]);
    },
  );

  it("combines role, stage, and verification filters", () => {
    expect(filterCandidateRows(rows, {
      query: "",
      role: "Data Engineer",
      stage: "Interview",
      verification: "Pending",
      sort: "desc",
    }).map((row) => row.candidate.id)).toEqual([2]);
  });

  it("treats rejected as a side-state and sorts both directions", () => {
    const rejected = filterCandidateRows(rows, {
      query: "",
      role: "All",
      stage: "Rejected",
      verification: "All",
      sort: "desc",
    });
    expect(rejected.map((row) => row.candidate.id)).toEqual([3]);
    expect(filterCandidateRows(rows, {
      query: "",
      role: "All",
      stage: "All",
      verification: "All",
      sort: "asc",
    }).map((row) => row.matchScore)).toEqual([62, 71, 94]);
  });
});

describe("candidate evidence", () => {
  it("uses the latest experience impact and falls back without fabrication", () => {
    const row = makeRow(1);
    expect(getCandidateAchievement(row)).toBe(
      "Reduced checkout latency by 35% across 12M daily sessions.",
    );
    expect(getCandidateAchievement({
      ...row,
      candidate: { ...row.candidate, experience: [], summary: "" },
    })).toBe("No impact summary provided yet.");
  });

  it("builds grounded AI reasons and exposes a skill gap", () => {
    const row = makeRow(1);
    const match: JobCandidateMatchScore = {
      id: 1,
      candidateId: 1,
      jobId: 1,
      score: 94,
      matchingSkills: ["React", "TypeScript"],
      missingSkills: ["GraphQL"],
    };
    const insight = buildCandidateInsight(row, match);
    expect(insight.reasons).toHaveLength(3);
    expect(insight.caution).toContain("GraphQL");
    expect(insight.skills).toEqual(["React", "TypeScript"]);
  });

  it("uses a positive caution when no gaps are recorded", () => {
    const row = makeRow(1);
    const insight = buildCandidateInsight(row, {
      id: 1,
      candidateId: 1,
      jobId: 1,
      score: 94,
      matchingSkills: ["React"],
      missingSkills: [],
    });
    expect(insight.caution).toBe("No must-have skill gaps identified.");
  });
});
```

- [ ] **Step 3: Run the helper tests and verify RED**

Run:

```powershell
npm test -- src/components/features/employer/candidate-discovery.test.ts
```

Expected: FAIL because `candidate-discovery.ts` and its exports do not exist.

- [ ] **Step 4: Implement the pure helper module**

Create `candidate-discovery.ts` with these exact types and grounded rules:

```ts
import type { EmployerCandidateRow } from "@/lib/data-helpers";
import type { ApplicationStage } from "@/types/application";
import type { JobCandidateMatchScore } from "@/types/match-score";

export type CandidateStageFilter = ApplicationStage | "All" | "Rejected";
export type CandidateVerificationFilter =
  | EmployerCandidateRow["verification"]
  | "All";
export type CandidateMatchSort = "desc" | "asc";

export type CandidateDiscoveryFilters = {
  query: string;
  role: string;
  stage: CandidateStageFilter;
  verification: CandidateVerificationFilter;
  sort: CandidateMatchSort;
};

export type CandidateInsight = {
  verdict: string;
  reasons: string[];
  caution: string;
  skills: string[];
};

export function getCandidateAchievement(row: EmployerCandidateRow): string {
  return row.candidate.experience[0]?.description.trim()
    || row.candidate.summary.trim()
    || "No impact summary provided yet.";
}

export function filterCandidateRows(
  rows: EmployerCandidateRow[],
  filters: CandidateDiscoveryFilters,
): EmployerCandidateRow[] {
  const query = filters.query.trim().toLocaleLowerCase();
  return rows
    .filter((row) => {
      const searchable = [
        row.candidate.name,
        row.candidate.title,
        row.job.title,
        ...row.candidate.experience.flatMap((experience) => [
          experience.company,
          experience.role,
        ]),
        ...row.candidate.skills,
      ].join(" ").toLocaleLowerCase();
      const stageMatches = filters.stage === "All"
        || (filters.stage === "Rejected"
          ? row.app.rejected
          : !row.app.rejected && row.app.stage === filters.stage);
      return (!query || searchable.includes(query))
        && (filters.role === "All" || row.job.title === filters.role)
        && stageMatches
        && (filters.verification === "All"
          || row.verification === filters.verification);
    })
    .toSorted((a, b) => filters.sort === "desc"
      ? b.matchScore - a.matchScore
      : a.matchScore - b.matchScore);
}

export function buildCandidateInsight(
  row: EmployerCandidateRow,
  match: JobCandidateMatchScore | undefined,
): CandidateInsight {
  const matchingSkills = match?.matchingSkills.slice(0, 3) ?? [];
  const reasons = [
    matchingSkills.length
      ? `Matches ${matchingSkills.join(", ")} for ${row.job.title}.`
      : `Experience aligns with the ${row.job.title} application.`,
    getCandidateAchievement(row),
    row.verification === "Verified"
      ? "Profile evidence includes university-verified credentials."
      : `Credential review status: ${row.verification.toLowerCase()}.`,
  ];
  return {
    verdict: row.matchScore >= 85
      ? "Strong profile to shortlist"
      : row.matchScore >= 70
        ? "Worth a closer review"
        : "Review role gaps before saving",
    reasons,
    caution: match?.missingSkills.length
      ? `Validate ${match.missingSkills.slice(0, 2).join(" and ")} during screening.`
      : "No must-have skill gaps identified.",
    skills: matchingSkills,
  };
}
```

- [ ] **Step 5: Run helper tests and verify GREEN**

Run:

```powershell
npm test -- src/components/features/employer/candidate-discovery.test.ts
```

Expected: all helper tests PASS with zero warnings.

- [ ] **Step 6: Commit the helper deliverable**

```powershell
git add package.json package-lock.json vitest.config.ts src/test/setup.ts src/components/features/employer/candidate-discovery.ts src/components/features/employer/candidate-discovery.test.ts
git commit -m "test: add candidate discovery behavior"
```

### Task 2: Build the accessible two-sided candidate card

**Files:**
- Create: `src/components/features/employer/candidate-discovery-card.test.tsx`
- Create: `src/components/features/employer/candidate-discovery-card.tsx`

**Interfaces:**
- Consumes:
  - `row: EmployerCandidateRow`
  - `match: JobCandidateMatchScore | undefined`
  - `starred: boolean`
  - `onToggleStar(): void`
  - `buildCandidateInsight(row, match)`
  - `getCandidateAchievement(row)`
- Produces:
  - `CandidateDiscoveryCard(props): JSX.Element`

- [ ] **Step 1: Write failing interaction tests**

Use Testing Library with a local row fixture. Verify the semantic contracts:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CandidateDiscoveryCard } from "./candidate-discovery-card";

it("flips from the front to AI insight and back by click", async () => {
  const user = userEvent.setup();
  render(<CandidateDiscoveryCard row={row} match={match} starred={false} onToggleStar={vi.fn()} />);

  const showInsight = screen.getByRole("button", {
    name: "Show AI insight for Aisha Khan",
  });
  expect(showInsight.getAttribute("aria-pressed")).toBe("false");
  await user.click(showInsight);
  expect(showInsight.getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByText("Strong profile to shortlist")).toBeTruthy();

  await user.click(screen.getByRole("button", {
    name: "Show profile summary for Aisha Khan",
  }));
  expect(showInsight.getAttribute("aria-pressed")).toBe("false");
});

it("supports Enter and Space without double toggling", () => {
  render(<CandidateDiscoveryCard row={row} match={match} starred={false} onToggleStar={vi.fn()} />);
  const showInsight = screen.getByRole("button", {
    name: "Show AI insight for Aisha Khan",
  });
  fireEvent.keyDown(showInsight, { key: "Enter" });
  expect(showInsight.getAttribute("aria-pressed")).toBe("true");
  fireEvent.keyDown(screen.getByRole("button", {
    name: "Show profile summary for Aisha Khan",
  }), { key: " " });
  expect(showInsight.getAttribute("aria-pressed")).toBe("false");
});

it("stars without flipping and links to the full profile", async () => {
  const user = userEvent.setup();
  const onToggleStar = vi.fn();
  render(<CandidateDiscoveryCard row={row} match={match} starred={false} onToggleStar={onToggleStar} />);
  const showInsight = screen.getByRole("button", {
    name: "Show AI insight for Aisha Khan",
  });
  await user.click(screen.getByRole("button", {
    name: "Save Aisha Khan",
  }));
  expect(onToggleStar).toHaveBeenCalledOnce();
  expect(showInsight.getAttribute("aria-pressed")).toBe("false");
  await user.click(showInsight);
  expect(screen.getByRole("link", {
    name: "View Aisha Khan's full profile",
  }).getAttribute("href")).toBe("/employer/candidates/1");
});
```

- [ ] **Step 2: Run card tests and verify RED**

Run:

```powershell
npm test -- src/components/features/employer/candidate-discovery-card.test.tsx
```

Expected: FAIL because `CandidateDiscoveryCard` does not exist.

- [ ] **Step 3: Implement the card**

Implement a controlled card with:

```tsx
"use client";

type CandidateDiscoveryCardProps = {
  row: EmployerCandidateRow;
  match: JobCandidateMatchScore | undefined;
  starred: boolean;
  onToggleStar: () => void;
};

export function CandidateDiscoveryCard({
  row,
  match,
  starred,
  onToggleStar,
}: CandidateDiscoveryCardProps) {
  const [flipped, setFlipped] = useState(false);
  const insight = buildCandidateInsight(row, match);
  const latestExperience = row.candidate.experience[0];
  // Render an article with a perspective wrapper and equal min-height faces.
  // Each face has its own full-surface semantic button behind the content.
  // Set aria-pressed on both flip buttons and tabIndex=-1 on the hidden face.
}
```

Required visual implementation:

- outer `li` with `animate-reveal` and per-index-safe natural grid flow;
- card wrapper with `min-h-[30rem]`, `[perspective:1200px]`, and `lift-on-hover`;
- inner plane with `[transform-style:preserve-3d]`,
  `transition-transform duration-500`, and
  `[transform:rotateY(180deg)]` only when flipped;
- both faces use token surfaces, border-2, rounded-xl, restrained offset shadow,
  `[backface-visibility:hidden]`, and `motion-reduce:transition-none`;
- a chart-token top strip selected from a fixed token class array by candidate id;
- initials avatar with `bg-accent-soft`;
- `text-caption`, `text-subheading`, `text-meta`, and tabular score utilities;
- AI score bar using `bg-chart-1` and `animate-progress-x`;
- icon-only star `Button size="icon"` with a filled `Star` when selected;
- `BadgeCheck`, `MapPin`, `BriefcaseBusiness`, `Sparkles`, `ShieldCheck`,
  `TriangleAlert`, `RotateCw`, `ArrowUpRight`, and `Star` icons;
- a `Button asChild` profile link with the exact accessible name from the test;
- `title` and `aria-label` on the icon-only star control;
- no raw color values and no `Star`/`Starred` visible labels.

- [ ] **Step 4: Run card tests and verify GREEN**

Run:

```powershell
npm test -- src/components/features/employer/candidate-discovery-card.test.tsx
```

Expected: all card tests PASS with no React act, nesting, or accessibility warnings.

- [ ] **Step 5: Commit the card deliverable**

```powershell
git add src/components/features/employer/candidate-discovery-card.tsx src/components/features/employer/candidate-discovery-card.test.tsx
git commit -m "feat: add flippable candidate discovery card"
```

### Task 3: Replace the candidate list with the discovery toolbar and grid

**Files:**
- Create: `src/app/employer/candidates/page.test.tsx`
- Modify: `src/app/employer/candidates/page.tsx`

**Interfaces:**
- Consumes:
  - `CandidateDiscoveryCard`
  - `filterCandidateRows`
  - `CandidateDiscoveryFilters`
  - `getMatchScoreByPair(candidateId, jobId)`
  - existing toast and talent-pool contexts
- Produces: the complete `/employer/candidates` discovery experience.

- [ ] **Step 1: Write the failing route composition test**

Mock only the page contexts, not the discovery components:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/common/toast", () => ({
  useToast: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/features/employer/talent-pool/pool-provider", () => ({
  useTalentPool: () => ({
    add: vi.fn(),
    remove: vi.fn(),
    isInPool: () => false,
    getByCandidate: () => undefined,
  }),
}));

import EmployerCandidatesPage from "./page";

describe("EmployerCandidatesPage", () => {
  it("keeps discovery controls visible and renders candidate cards", () => {
    render(<EmployerCandidatesPage />);
    expect(screen.getByLabelText("Search candidates")).toBeTruthy();
    expect(screen.getByLabelText("Applied role")).toBeTruthy();
    expect(screen.getByLabelText("Hiring stage")).toBeTruthy();
    expect(screen.getByLabelText("Verification")).toBeTruthy();
    expect(screen.getByLabelText("Sort candidates")).toBeTruthy();
    expect(screen.getByText(/candidates shown/i)).toBeTruthy();
    expect(screen.getAllByText(/AI Match/i).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the page test and verify RED**

Run:

```powershell
npm test -- src/app/employer/candidates/page.test.tsx
```

Expected: FAIL because the old page hides filters behind the priority toggle and renders rows.

- [ ] **Step 3: Rewrite the route composition**

Replace the old toggle, scrolling row card, stage mutation, rejection dialog,
pool controls, and `CandidateRow` with:

```tsx
const DEFAULT_FILTERS: CandidateDiscoveryFilters = {
  query: "",
  role: "All",
  stage: "All",
  verification: "All",
  sort: "desc",
};

const [filters, setFilters] =
  useState<CandidateDiscoveryFilters>(DEFAULT_FILTERS);
const [starredIds, setStarredIds] = useState<Set<number>>(new Set());

const filtered = useMemo(
  () => filterCandidateRows(rows, filters),
  [rows, filters],
);
```

Compose:

- `PageHeading` with title, decision-oriented copy, and no toggle action;
- a bordered `Card` discovery toolbar using `surface-inset`;
- one labelled `Input` and four labelled Radix `Select` controls;
- a small result summary with `filtered.length` and `rows.length`;
- a `Clear filters` button shown whenever filters differ from defaults;
- `EmptyState` with `SearchX` for an empty filtered set;
- a list grid with
  `grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3`;
- one `CandidateDiscoveryCard` per row, passing the current match record,
  controlled star state, and a toast-producing toggle handler.

Search input placeholder:

```text
Search name, role, company, or skill
```

Filter accessible labels:

```text
Applied role
Hiring stage
Verification
Sort candidates
```

Sort labels:

```text
AI Match: highest first
AI Match: lowest first
```

Empty-state copy:

```text
No candidates match these filters
Try a broader search or clear one of the filters.
```

- [ ] **Step 4: Run focused tests and verify GREEN**

Run:

```powershell
npm test -- src/components/features/employer/candidate-discovery.test.ts src/components/features/employer/candidate-discovery-card.test.tsx src/app/employer/candidates/page.test.tsx
```

Expected: all focused tests PASS.

- [ ] **Step 5: Run lint and type/build verification**

Run:

```powershell
npm run lint
npm run build
```

Expected: both commands exit 0 with no new lint errors, TypeScript errors,
hydration failures, or route build failures.

- [ ] **Step 6: Commit the complete route**

```powershell
git add src/app/employer/candidates/page.tsx src/app/employer/candidates/page.test.tsx
git commit -m "feat: redesign employer candidate discovery"
```

### Task 4: Browser interaction, responsive, and accessibility verification

**Files:**
- Modify if verification reveals an issue:
  `src/components/features/employer/candidate-discovery-card.tsx`
- Modify if verification reveals an issue:
  `src/app/employer/candidates/page.tsx`
- Modify the corresponding test first for every behavior fix.

**Interfaces:**
- Consumes: the running local `/employer/candidates` route.
- Produces: verified desktop, tablet, and mobile behavior with no console or
  hydration errors.

- [ ] **Step 1: Start or reuse the local development server**

Run:

```powershell
npm run dev
```

Expected: the app is available at `http://localhost:3000`.

- [ ] **Step 2: Verify the desktop surface**

At 1440 × 1000, verify:

- the toolbar is always visible;
- the grid has three columns;
- cards have equal visual height and no clipped content;
- front evidence and AI score scan clearly;
- clicking the face flips exactly once;
- star toggles without flipping;
- the detail link navigates to the correct candidate;
- combined filters update the result count;
- clearing filters restores the default order; and
- the zero-result state exposes `Clear filters`.

- [ ] **Step 3: Verify tablet and mobile layouts**

At 900 × 1000, verify two columns and a wrapping toolbar.

At 390 × 844, verify one column, controls remain at least 44 px tall, long
content wraps without horizontal overflow, and tap-to-flip works without hover.

- [ ] **Step 4: Verify keyboard and reduced motion**

Tab through search, selects, star, flip controls, and profile link. Verify a
visible focus ring, Enter/Space flip behavior, hidden-face controls are not in
the tab order, and no focus trap occurs.

Emulate `prefers-reduced-motion: reduce`; verify that the faces change without
the 3D transition and all content remains available.

- [ ] **Step 5: Inspect runtime diagnostics**

Check browser console logs after initial load, filtering, flipping, starring,
and navigation. Expected: no errors, hydration warnings, invalid DOM nesting
warnings, or uncontrolled/controlled input warnings.

- [ ] **Step 6: Apply test-first fixes if needed and re-run final verification**

For each issue, add or amend the smallest failing focused test, observe the
failure, implement the fix, and rerun:

```powershell
npm test
npm run lint
npm run build
```

Expected: all tests PASS and both verification commands exit 0.

- [ ] **Step 7: Commit verification fixes, if any**

```powershell
git add src/app/employer/candidates/page.tsx src/app/employer/candidates/page.test.tsx src/components/features/employer/candidate-discovery-card.tsx src/components/features/employer/candidate-discovery-card.test.tsx
git commit -m "fix: polish candidate discovery interactions"
```
