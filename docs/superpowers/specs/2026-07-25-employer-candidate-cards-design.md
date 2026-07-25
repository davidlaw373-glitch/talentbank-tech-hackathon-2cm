# Employer Candidate Discovery Cards

## Objective

Redesign `/employer/candidates` as a candidate discovery surface where an
employer can make a fast, evidence-based decision about whether to save a
candidate. Replace the current dense rows with responsive, flippable cards.
Keep AI Match prominent, but treat it as supporting evidence rather than the
primary reason to save someone.

## Design direction

Use the `work-in-progress.openai.chatgpt.site` homepage as a composition
reference: warm paper-like surfaces, fine dark outlines, restrained shadows,
small category color accents, and a clearly separated discovery toolbar.
Translate those traits into the existing CareerOS sage, forest, cream, amber,
surface, and chart tokens. Do not copy the reference site's brand palette,
typography, or content.

This is a product/app surface, so motion remains measured and task-first. The
card flip is the primary signature interaction; hover lift and progress
animation are secondary. All motion must respect reduced-motion preferences.

## Page information architecture

The page contains three regions:

1. A `Candidate management` heading with concise explanatory copy and the
   visible result count.
2. An always-visible discovery toolbar containing keyword search, applied-role
   filter, hiring-stage filter, verification filter, and AI Match sort order.
3. A responsive candidate-card grid: one column on small screens, two on
   medium screens, and three on large screens.

The old priority/all-candidates toggle is removed. Search and filters are
always available, and the default result order is AI Match descending.

## Candidate card

Each application is represented by one card with equal-height front and back
faces.

### Front face

The front face is optimized for a save/no-save decision and includes:

- a slim chart-token color strip that helps distinguish cards;
- an initials avatar, candidate name, professional title, and location;
- the applied role;
- the most recent role and company;
- one quantified or otherwise high-signal achievement extracted from the most
  recent experience description;
- credential verification and current hiring-stage labels;
- a prominent AI Match score with a thin progress bar;
- an icon-only star control in the upper-right corner; and
- a short prompt that the card can be flipped for AI insight.

There are no `Star` or `Starred` text labels. The control has an accessible
name, pressed state, tooltip/title, and a filled visual state when selected.
When no real portrait exists in the data, the card uses a styled initials
avatar instead of inventing a photograph.

### Back face

The back face is a deliberately incomplete preview and includes:

- a concise AI recommendation headline;
- two or three match reasons derived from matching skills, recent experience,
  candidate summary, and credentials;
- one caution based on missing skills, or a positive no-gap message;
- a compact list of matching skills;
- a `View full profile` link to
  `/employer/candidates/[candidateId]`; and
- a short prompt explaining that clicking the surface returns to the front.

Education history, full experience, projects, contact data, and pipeline
actions remain exclusive to the detail page.

## Interaction and accessibility

- Clicking the non-interactive area of either face flips that card.
- Enter or Space flips the focused card.
- Star and profile-detail controls stop propagation and do not flip the card.
- Each card owns independent flip state.
- The card exposes its expanded/flipped state and a descriptive accessible
  label.
- Focus rings remain visible on the card and nested controls.
- In reduced-motion mode, the face changes without a 3D transition.
- Flip animation uses transform and opacity only; it does not block input.
- On touch devices, the same tap behavior applies and no information depends
  on hover.

## Search, filter, and sort behavior

Keyword search matches candidate name, professional title, applied role,
company names, and skills. Filters can be combined:

- applied role: all roles or one job title;
- hiring stage: all, each application stage, or rejected;
- verification: all, verified, pending, or none;
- sort: highest AI Match first or lowest AI Match first.

The result count updates immediately. When no candidates match, the page shows
an explanatory empty state and a `Clear filters` action. Clearing resets the
query, all filters, and sort order to the default.

## Data and component boundaries

The route remains a narrow client-side composition because it owns current demo
state for search, filters, stars, and application rows.

Create a feature-level `CandidateDiscoveryCard` component responsible for one
card's visual treatment, flip state, star interaction, and profile link.
Create pure helpers for:

- building searchable candidate text;
- applying combined filters and sort;
- selecting the high-signal achievement;
- constructing the AI recommendation preview.

Reuse the existing `EmployerCandidateRow`, candidate, application, job,
match-score, credential, toast, Button, Badge, Select, PageHeading, and
CareerOS token utilities. Match details may be joined from the existing
candidate/job match-score record; no new dependency or API is required.

## State and failure handling

The demo data is local and synchronous, so no new network loading or error
state is introduced. The page must still handle:

- an empty initial dataset;
- zero search/filter results;
- candidates with no experience, credentials, matching skills, missing skills,
  or summary;
- long names, roles, companies, achievements, and translated content; and
- zero or unavailable match scores.

Fallback copy must be concise and must not fabricate candidate facts.

## Validation

Use test-first development for the pure discovery helpers and card interaction
where supported by the repository's test setup. At minimum, automated
verification must cover:

- keyword search across identity, role, company, and skill fields;
- combined role, stage, and verification filters;
- ascending and descending AI Match sort;
- achievement extraction and missing-data fallback;
- AI insight generation with and without skill gaps; and
- flip behavior plus nested-control click isolation.

Run the repository's lint and production build. Then verify the live route in
the browser at desktop, tablet, and mobile widths, including keyboard flip,
star behavior, profile navigation, empty state, reduced motion, overflow,
console errors, and hydration warnings.

## Out of scope

- Persistence of starred candidates beyond the current client session
- Real candidate portrait uploads or generated headshots
- Changes to the full candidate-detail information architecture
- New application-stage or rejection controls on the discovery cards
- Backend search, pagination, or remote AI generation

## Refinement: signal layout, flip stability, and color restraint

The following refinements supersede any conflicting visual details above.

### Recent Signal

- Every front face reserves the same fixed-height Recent Signal region so the
  AI Match block aligns across all cards.
- The role/company heading remains fixed at the top of the region.
- The achievement body scrolls inside the region when its content exceeds the
  available height.
- An icon-only expand control appears at the upper-right of the region. It has
  an accessible name, visible focus state, and expanded state.
- Activating the control opens a card-local overlay with the complete role,
  company, and achievement text. The overlay stays inside the card boundary,
  does not resize the card, and never becomes a page-level modal.
- The overlay has its own scroll area and icon-only close control. Opening or
  closing it must not flip the card.

### Flip interaction

- Front and back faces change only after click/tap or Enter/Space on the
  corresponding full-surface control.
- Hover must never change which face is visible.
- Hover lift and 3D rotation use separate transform layers so the lift
  transform cannot override `rotateY(180deg)`.
- The back face remains clickable to return to the front, but the visible
  `Return to summary` prompt and icon are removed.
- Star, Recent Signal expansion, overlay close, and profile-detail controls
  remain isolated from card flipping.

### Reduced palette

- Remove per-candidate chart-color strips and the multicolor discovery-toolbar
  strip.
- Use one forest/sage brand accent for card and toolbar strips.
- Use warm amber only for the AI Match emphasis where needed.
- Use neutral cream surface layers for signal, screening, and filter regions.
- Keep semantic status colors only where status meaning requires them; do not
  add decorative chart colors elsewhere.

### Refinement validation

Add regression coverage that proves:

- Recent Signal uses a stable bounded region with an internal scroll area;
- expanding shows the complete signal in a card-local overlay;
- expansion and close controls do not flip the card;
- the expanded overlay does not expose hidden-face controls;
- clicking and keyboard activation still flip both directions;
- hover styling is applied to a layer separate from the rotation plane; and
- the removed `Return to summary` text is absent.
