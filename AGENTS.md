# AGENTS.md

## Project Overview

This project is a talent and career platform built with **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui**.

The application foundation is in place and the project is now in its **product design and experience refinement stage**. Frontend work should be visually intentional, engaging, responsive, and accessible. Agents are encouraged to improve the interface and interaction design while keeping the codebase coherent and maintainable.

This file defines the default expectations for all work in this repository. A specific user request takes precedence when it conflicts with these defaults.

---

## Product and Design Principles

1. **Design for the user journey.** Make hierarchy, navigation, feedback, and next actions immediately understandable.
2. **Create a distinctive experience.** Thoughtful typography, color, composition, imagery, and motion are encouraged when they support the product.
3. **Keep patterns coherent.** Pages may have their own character, but recurring actions and states should behave consistently.
4. **Prefer purposeful details.** Every visual or animated treatment should improve comprehension, emotional tone, or usability.
5. **Design the complete state.** Include loading, empty, error, success, disabled, selected, and hover/focus states where relevant.
6. **Preserve engineering quality.** Visual ambition must not come at the expense of accessibility, responsiveness, performance, or maintainability.

Avoid both extremes: do not produce an unconsidered default-template interface, and do not add decoration that competes with the content.

---

## Technology and Dependency Rules

Continue using the existing stack:

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- shadcn/ui and its Radix primitives
- Lucide icons

Do not introduce another frontend framework or a second general-purpose component library.

New dependencies are allowed only when they provide meaningful functionality that would be costly or fragile to recreate. Before adding one:

- check whether the repository or platform already provides the capability;
- prefer small, maintained, tree-shakeable packages;
- consider bundle size, client-side cost, licensing, and maintenance status;
- explain the reason in the implementation summary.

Use the package manager and conventions already present in the repository. Do not upgrade unrelated dependencies during a feature task.

---

## Next.js and React Rules

Follow the existing App Router structure. Route files should primarily compose feature components, load route-level data, and define metadata.

- Prefer Server Components by default.
- Add `"use client"` only where browser APIs, local state, event handlers, or client-only libraries require it.
- Keep client component boundaries as narrow as practical.
- Use Next.js primitives such as `Link`, `Image`, route handlers, metadata, and `next/font` where appropriate.
- Do not create a parallel routing, data-fetching, or state-management system without a clear need.
- Avoid large UI blocks and unrelated business logic directly inside `page.tsx` or `layout.tsx`.
- Avoid premature abstraction. Extract a component when it clarifies a page, is reused, owns meaningful behavior, or represents a stable product concept.

Preferred organization:

```txt
src/
  app/                  # routes, layouts, loading/error boundaries
  components/
    ui/                 # shadcn primitives and shared UI foundations
    layout/             # application-wide shells and navigation
    common/             # reusable cross-feature components
    features/           # feature-specific UI and composition
  data/                 # fixtures or static data
  hooks/                # reusable client hooks
  lib/                  # utilities and shared configuration
  services/             # API and external-service boundaries
  types/                # shared domain types
```

Follow the repository's current structure when it differs; do not move files solely to match this example.

---

## TypeScript and Code Quality

- Use `.ts` and `.tsx` for application code.
- Keep strict, meaningful types for component props, domain records, form data, and service responses.
- Avoid `any`; use `unknown` plus validation or narrowing when the input is not trusted.
- Prefer clear domain names over generic names such as `data`, `item`, or `handler` when context is not obvious.
- Keep rendering, state transitions, and business rules understandable. Extract complex logic into utilities, hooks, or services.
- Avoid duplicated constants and repeated conditionals when a shared type, configuration object, or component API would express the intent better.
- Remove obsolete code, imports, and comments introduced or made unnecessary by the change.
- Do not modify unrelated areas of the repository.

Use the configured import alias for project modules when available:

```tsx
import { Button } from "@/components/ui/button"
```

Use kebab-case for component filenames, PascalCase for component names, and the `use-` prefix for hook filenames.

---

## shadcn/ui and Component Strategy

Use shadcn/ui as the **accessible behavioral foundation**, not as a visual ceiling.

- Check existing project and shadcn components before building a new primitive.
- Prefer shadcn/Radix for controls such as buttons, inputs, selects, dialogs, dropdowns, tabs, tooltips, checkboxes, and menus.
- It is acceptable to customize shadcn components, add variants, compose them into richer patterns, and change their visual treatment.
- Keep shared variants in the underlying UI component or a consistent feature abstraction instead of repeating long class lists across pages.
- Preserve keyboard navigation, focus management, ARIA behavior, disabled states, and ref forwarding when modifying primitives.
- A custom component is appropriate when it represents a product-specific interaction or when the required experience does not map cleanly to an existing primitive.
- Raw semantic HTML is acceptable when it is simpler and remains fully accessible. Do not reimplement complex accessible behavior such as dialogs, menus, selects, or focus traps by hand.

Changes inside `src/components/ui` should improve or extend the shared primitive deliberately. Feature-specific styling should generally remain in the feature component or be expressed through an explicit variant.

---

## Visual Design System

The interface may use custom colors, typography, spacing, borders, radii, shadows, gradients, illustrations, and effects. Apply them as a system rather than as isolated decoration.

### Design tokens

- Use the existing CSS variables and Tailwind theme as the starting point.
- Add or revise semantic tokens in `globals.css` when a value is reused or communicates product meaning.
- Prefer names such as `primary`, `surface`, `muted`, `success`, or feature-level semantic tokens over names tied to a literal color.
- Support dark mode for shared tokens and new major surfaces when the surrounding application supports it.
- One-off values are acceptable for genuinely unique artwork or calculated effects; recurring values should become tokens or shared variants.

### Color

- Custom palettes and branded colors are allowed.
- Maintain sufficient text and control contrast in every interactive state.
- Do not rely on color alone to communicate status or required action.
- Use gradients and transparency intentionally, and verify readability over complex backgrounds.

### Typography and fonts

- Inter is no longer mandatory. Fonts may be changed or combined when they strengthen the design direction.
- Load web fonts through `next/font` when possible to reduce layout shift and improve delivery.
- Keep the number of font families and weights reasonable.
- Establish a consistent type hierarchy for display text, headings, body copy, labels, and supporting text.
- Semantic HTML remains important: choose heading levels by document structure, then style them as needed.
- Tailwind typography utilities, responsive sizes, fluid sizes, tracking, weight, and line-height adjustments are allowed.

### Layout and responsive behavior

- Tailwind may be used for both layout and visual styling.
- Design mobile-first and verify the interface at small, medium, and large widths.
- Avoid layouts that only work for ideal-length English text. Allow for wrapping, long names, empty values, and translated copy.
- Use consistent content widths, alignment, spacing rhythm, and visual hierarchy across related pages.
- Avoid arbitrary values when a standard token expresses the same result; use arbitrary or fluid values when the design genuinely requires them.

### CSS and inline styles

- Tailwind is the default styling approach.
- Custom CSS is allowed for shared tokens, advanced selectors, complex animations, and effects that are clearer in CSS.
- Keep global CSS focused on global concerns; avoid accumulating page-specific rules in `globals.css`.
- Inline styles are acceptable for dynamic values that cannot be known at build time, such as coordinates or calculated progress. Do not use them as the default styling method.

---

## Motion and Interaction

Motion is encouraged when it provides continuity, feedback, orientation, or delight.

- Prefer short, responsive transitions for controls and state changes.
- Use larger entrance or scroll effects selectively so important content remains immediate.
- Avoid animating expensive layout properties when transforms and opacity can achieve the same effect.
- Do not block interaction while decorative animation finishes.
- Respect `prefers-reduced-motion`; essential information must remain available without animation.
- Ensure hover-only interactions also work with keyboard and touch input.
- Avoid excessive simultaneous motion, looping distractions, and effects that reduce legibility.

For custom interactive elements, verify focus, hover, pressed, active, disabled, loading, and touch behavior as applicable.

---

## Content and UX States

- Use concise, specific interface copy. Buttons should describe the action they perform.
- Prefer real product language and realistic data shapes over generic placeholder text.
- Forms require visible labels or an equally accessible labeling mechanism, useful validation messages, and a clear submission state.
- Destructive or irreversible actions require appropriate warning or confirmation.
- Show progress for operations that are not immediate and prevent accidental duplicate submissions.
- Empty states should explain what happened and offer a useful next action when one exists.
- Error states should help the user recover rather than merely report failure.

---

## Accessibility Requirements

Accessibility is a release requirement, not an optional refinement.

- Use semantic HTML landmarks and a logical heading structure.
- All controls must be operable with a keyboard and have a visible focus state.
- Icon-only controls require accessible names.
- Images require meaningful alt text when informative and empty alt text when decorative.
- Form fields require programmatic labels and associated error/help text.
- Preserve shadcn/Radix accessibility behavior when customizing components.
- Maintain usable contrast and do not encode meaning through color alone.
- Ensure dialogs, menus, popovers, and dynamic content manage focus correctly.
- Use ARIA only when native HTML does not express the behavior.

---

## Performance Expectations

- Prefer Server Components and server-side data access where appropriate.
- Avoid sending large data sets, unnecessary JavaScript, or server-only logic to the client.
- Optimize images and provide dimensions or stable aspect ratios to prevent layout shift.
- Lazy-load heavy below-the-fold media or client-only features when it improves the experience.
- Avoid unnecessary rerenders, document-level event listeners, and unbounded animation work.
- Treat bundle-heavy visual libraries as an explicit tradeoff, not a default choice.

Do not sacrifice clarity for speculative micro-optimization. Address measurable or clearly foreseeable performance costs.

---

## Agent Workflow

Before changing frontend code:

1. Read the relevant route, nearby components, shared UI primitives, and global theme.
2. Understand the user flow and the visual language already established in adjacent screens.
3. Reuse existing domain types and behavior where possible.
4. Decide whether the change belongs in a page, feature component, shared component, or UI primitive.
5. Identify responsive, accessibility, loading, empty, and error-state requirements.

While implementing:

1. Keep the scope aligned with the request.
2. Preserve established behavior unless the change intentionally improves it.
3. Use visually coherent tokens and patterns rather than isolated one-off choices.
4. Keep components readable and separate business logic from presentation when complexity warrants it.
5. Do not erase or overwrite unrelated user changes.

After implementing:

1. Run the relevant lint, type-check, test, or build commands available in the project.
2. Review the changed screens at representative mobile and desktop widths when UI behavior changed.
3. Check keyboard navigation, focus visibility, contrast, reduced motion, and key UX states.
4. Confirm that there are no accidental console errors, hydration warnings, broken links, or layout overflows.
5. Summarize the change, validation performed, and any remaining tradeoffs.

---

## Decision Guide

When choosing between approaches, prefer the option that best balances these priorities:

1. User comprehension and task completion
2. Accessibility and reliability
3. Consistency with the product's visual language
4. Maintainability and reuse
5. Performance
6. Visual novelty

A visually bold solution is welcome when it improves the product. A simpler solution is better when extra complexity does not create meaningful user value.

---

## Final Standard

Build interfaces that feel intentional, polished, and alive.

Use shadcn/ui for robust foundations, customize it when the experience benefits, and create product-specific components when necessary. Typography, color, motion, and layout are design tools—not prohibited territory. Apply them with a coherent system, accessible behavior, responsive execution, and maintainable TypeScript code.
