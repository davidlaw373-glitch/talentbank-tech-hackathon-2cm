# Candidate Card Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align AI Match across candidate cards, add card-local Recent Signal expansion, make flip state click-only, and reduce decorative color variety.

**Architecture:** Keep the existing `CandidateDiscoveryCard` API and introduce only local UI state for Recent Signal expansion. Separate the hover-lift wrapper from the 3D rotation plane so their transforms cannot override one another, and replace chart accents with existing forest/sage/cream tokens.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, existing shadcn UI primitives, Lucide icons, Vitest, Testing Library

## Global Constraints

- Do not use external plugins, connectors, or new dependencies.
- Keep the card at its existing fixed size.
- Keep AI Match aligned across every front face.
- Recent Signal overflow must scroll inside a bounded region.
- Expanded Recent Signal must remain inside its card and must not resize it.
- Card faces change only after click/tap or Enter/Space.
- Remove visible `Return to summary` copy while retaining back-face click behavior.
- Reduce decorative colors to forest/sage/cream, with amber reserved for AI emphasis.
- Preserve star, detail-link, focus-visible, touch, and reduced-motion behavior.

---

## File Structure

- Modify `src/components/features/employer/candidate-discovery-card.test.tsx`:
  cover expansion isolation, complete signal content, transform separation, and
  removed return copy.
- Modify `src/components/features/employer/candidate-discovery-card.tsx`:
  add bounded signal UI, card-local overlay, transform layers, and reduced
  palette.
- Modify `src/app/employer/candidates/page.test.tsx`: protect the simplified
  page palette.
- Modify `src/app/employer/candidates/page.tsx`: replace the multicolor toolbar
  accents with one primary brand accent.

### Task 1: Stabilize the card layout and interaction

**Files:**
- Modify: `src/components/features/employer/candidate-discovery-card.test.tsx`
- Modify: `src/components/features/employer/candidate-discovery-card.tsx`

**Interfaces:**
- Consumes: the existing `CandidateDiscoveryCardProps` contract.
- Produces: the same exported `CandidateDiscoveryCard` component with local
  `signalExpanded: boolean` state.

- [ ] **Step 1: Write failing tests for the Recent Signal overlay**

Add these behavior tests:

```tsx
import { within } from "@testing-library/react";

it("expands the complete recent signal inside the card without flipping", async () => {
  const user = userEvent.setup();
  render(
    <CandidateDiscoveryCard
      row={row}
      match={match}
      starred={false}
      onToggleStar={vi.fn()}
    />,
  );

  const flip = screen.getByRole("button", {
    name: "Show AI insight for Aisha Khan",
  });
  await user.click(
    screen.getByRole("button", {
      name: "Expand recent signal for Aisha Khan",
    }),
  );

  expect(flip.getAttribute("aria-pressed")).toBe("false");
  const fullSignal = screen.getByRole("region", {
    name: "Full recent signal for Aisha Khan",
  });
  expect(fullSignal).toBeTruthy();
  expect(
    within(fullSignal).getByText(
      "Owned the design-system rebuild used by 12M daily users across marketing, console, and docs.",
    ),
  ).toBeTruthy();

  await user.click(
    screen.getByRole("button", {
      name: "Close recent signal for Aisha Khan",
    }),
  );
  expect(
    screen.queryByRole("region", {
      name: "Full recent signal for Aisha Khan",
    }),
  ).toBeNull();
  expect(flip.getAttribute("aria-pressed")).toBe("false");
});

it("keeps hover lift and card rotation on separate elements", () => {
  const { container } = render(
    <CandidateDiscoveryCard
      row={row}
      match={match}
      starred={false}
      onToggleStar={vi.fn()}
    />,
  );
  const article = container.querySelector("article");
  const liftLayer = article?.firstElementChild;
  const rotationPlane = liftLayer?.firstElementChild;

  expect(liftLayer).not.toBe(rotationPlane);
  expect(liftLayer?.className).toContain("lift-on-hover");
  expect(rotationPlane?.className).toContain("[transform-style:preserve-3d]");
  expect(rotationPlane?.className).not.toContain("lift-on-hover");
});

it("removes the visible return prompt while the back remains clickable", async () => {
  const user = userEvent.setup();
  render(
    <CandidateDiscoveryCard
      row={row}
      match={match}
      starred={false}
      onToggleStar={vi.fn()}
    />,
  );
  await user.click(
    screen.getByRole("button", {
      name: "Show AI insight for Aisha Khan",
    }),
  );

  expect(screen.queryByText("Return to summary")).toBeNull();
  await user.click(
    screen.getByRole("button", {
      name: "Show profile summary for Aisha Khan",
    }),
  );
  expect(
    screen
      .getByRole("button", { name: "Show AI insight for Aisha Khan" })
      .getAttribute("aria-pressed"),
  ).toBe("false");
});
```

- [ ] **Step 2: Run the card tests and verify RED**

Run:

```powershell
npm test -- src/components/features/employer/candidate-discovery-card.test.tsx
```

Expected failures:

- no `Expand recent signal for Aisha Khan` control;
- lift and rotation classes exist on the same element; and
- `Return to summary` remains visible.

- [ ] **Step 3: Implement the transform separation**

Change the card skeleton to:

```tsx
<article className="h-[31rem] min-w-0 animate-reveal [perspective:1200px]">
  <div className="lift-on-hover relative h-full w-full">
    <div
      className={cn(
        "relative h-full w-full [transform-style:preserve-3d] transition-transform duration-500 motion-reduce:transition-none",
        flipped && "[transform:rotateY(180deg)]",
      )}
    >
      {/* existing front and back faces */}
    </div>
  </div>
</article>
```

Only the inner plane receives the rotation transform. Only the outer wrapper
receives `lift-on-hover`.

- [ ] **Step 4: Implement the bounded Recent Signal area**

Add `Maximize2`, `Minimize2`, and local state:

```tsx
const [signalExpanded, setSignalExpanded] = useState(false);
```

Replace the current signal block with:

```tsx
<div className="relative mt-5 h-36 shrink-0 rounded-lg border bg-surface-2 p-4 pr-14">
  <Button
    type="button"
    variant="ghost"
    size="icon"
    className="pointer-events-auto absolute right-2.5 top-2.5 z-20"
    aria-label={`Expand recent signal for ${candidate.name}`}
    aria-expanded={signalExpanded}
    tabIndex={flipped ? -1 : 0}
    onClick={() => setSignalExpanded(true)}
  >
    <Maximize2 aria-hidden />
  </Button>
  <p className="text-caption">Recent signal</p>
  <p className="mt-1.5 line-clamp-2 text-body font-medium leading-snug">
    {latestExperience
      ? `${latestExperience.role} at ${latestExperience.company}`
      : "No recent role provided"}
  </p>
  <div
    role="region"
    aria-label={`Recent signal details for ${candidate.name}`}
    className="mt-2 max-h-14 overflow-y-auto pr-2 text-meta leading-relaxed"
  >
    {getCandidateAchievement(row)}
  </div>
</div>
```

The fixed `h-36 shrink-0` block preserves AI Match alignment. The achievement
body scrolls independently.

- [ ] **Step 5: Implement the card-local expanded overlay**

Render this inside the front face, after its regular content:

```tsx
{signalExpanded ? (
  <section
    role="region"
    aria-label={`Full recent signal for ${candidate.name}`}
    className="pointer-events-auto absolute inset-4 z-40 flex flex-col rounded-xl border-2 bg-surface-1 p-5 shadow-xl"
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-caption">Recent signal</p>
        <h3 className="mt-1 text-subheading">
          {latestExperience
            ? `${latestExperience.role} at ${latestExperience.company}`
            : "No recent role provided"}
        </h3>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Close recent signal for ${candidate.name}`}
        onClick={() => setSignalExpanded(false)}
      >
        <Minimize2 aria-hidden />
      </Button>
    </div>
    <div className="mt-5 min-h-0 flex-1 overflow-y-auto rounded-lg border bg-surface-2 p-4 text-body leading-relaxed">
      {getCandidateAchievement(row)}
    </div>
  </section>
) : null}
```

Remove `Return to summary` and its `RotateCw` icon from the back footer. Keep
the full-surface back button and the `View full profile` link.

- [ ] **Step 6: Reduce card accent colors**

Delete `ACCENT_STRIPS` and `stripClass`. Use these replacements:

```tsx
<div className="h-1.5 shrink-0 bg-primary" aria-hidden />
```

Use `bg-primary` for the AI Match progress bar and match-reason bullets. Keep
`bg-highlight-soft` only on the back-face AI Match percentage badge.

- [ ] **Step 7: Run card tests and verify GREEN**

Run:

```powershell
npm test -- src/components/features/employer/candidate-discovery-card.test.tsx
```

Expected: all card tests pass without act or DOM-nesting warnings.

- [ ] **Step 8: Commit the card refinement**

```powershell
git add src/components/features/employer/candidate-discovery-card.tsx src/components/features/employer/candidate-discovery-card.test.tsx
git commit -m "fix: refine candidate card signal interaction"
```

### Task 2: Simplify the discovery-toolbar palette

**Files:**
- Modify: `src/app/employer/candidates/page.test.tsx`
- Modify: `src/app/employer/candidates/page.tsx`

**Interfaces:**
- Consumes: existing page composition and CareerOS theme tokens.
- Produces: the same discovery controls with a reduced decorative palette.

- [ ] **Step 1: Write the failing palette regression test**

Extend the existing page test:

```tsx
it("uses a restrained brand palette without decorative chart accents", () => {
  const { container } = render(<EmployerCandidatesPage />);
  expect(container.querySelector('[class*="bg-chart-"]')).toBeNull();
  expect(container.querySelector(".bg-primary")).toBeTruthy();
});
```

- [ ] **Step 2: Run the page test and verify RED**

Run:

```powershell
npm test -- src/app/employer/candidates/page.test.tsx
```

Expected: FAIL because the toolbar and cards still render `bg-chart-*`
classes.

- [ ] **Step 3: Simplify the toolbar accents**

Replace the five-color toolbar strip:

```tsx
<div className="h-1.5 bg-primary" aria-hidden />
```

Change the discovery icon swatch from `bg-highlight-soft` to
`bg-accent-soft`, and change the explanatory Sparkles icon from
`text-highlight` to `text-primary`.

- [ ] **Step 4: Run focused and full verification**

Run:

```powershell
npm test -- src/app/employer/candidates/page.test.tsx src/components/features/employer/candidate-discovery-card.test.tsx
npm test
npm run lint
npm run build
```

Expected:

- all tests pass;
- lint exits 0 with no new warnings; the existing unrelated
  `graduate-management.tsx` warning may remain;
- the production build exits 0.

- [ ] **Step 5: Commit the page palette refinement**

```powershell
git add src/app/employer/candidates/page.tsx src/app/employer/candidates/page.test.tsx
git commit -m "style: simplify candidate discovery palette"
```
