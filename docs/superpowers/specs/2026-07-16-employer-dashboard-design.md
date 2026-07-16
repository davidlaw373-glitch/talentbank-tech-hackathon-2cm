# Employer Dashboard Design

## Goal

Create a standalone Employer Dashboard for the fictional Kuala Lumpur software company Meridian Byte Labs. It provides the employer-facing dashboard capabilities from `context.txt` while matching the established Candidate Dashboard's visual system and responsive behavior.

## Scope

### Included

- A new `/employer/dashboard` route and employer-specific page shell.
- A dashboard overview for Meridian Byte Labs with static, realistic recruiting data.
- Recruitment, job, application, and offer summary metrics.
- Candidate shortlist, upcoming interview, recent candidate-activity, and notification summaries.
- A desktop and mobile layout based on the Candidate Dashboard's cards, typography, spacing, hover treatment, and one-to-four-column responsive grids.

### Excluded

- Employer login and registration pages and their links from the landing-page employer section.
- Authentication, role-based redirects, persisted data, and backend integration.
- Job management, candidate management, interview management, offer management, talent re-engagement, company-profile, and notification-center routes.

## Information Architecture

The employer shell uses the existing CareerOS header pattern with a home link, a single active Dashboard navigation item, a non-navigating notification affordance, and an accessible company identity control. This avoids exposing links to the out-of-scope pages while retaining the same header composition as the candidate experience.

The dashboard content appears in this order:

1. Welcome header for Meridian Byte Labs, with a disabled `Post a job` affordance that communicates the future action without navigating to an unfinished page.
2. Four summary cards: open roles, active applicants, interviews this week, and offers awaiting response.
3. A recruitment pipeline panel showing application counts across Applied, Screening, Interview, Offer, and Hired; alongside a hiring pulse panel that highlights the next interview and the highest-volume role.
4. A candidate shortlist panel with candidate name, role fit, experience, current stage, and matching skills; alongside an upcoming interviews panel.
5. A job-performance panel that ranks active roles by applications and in-process candidates; alongside recent activity and notifications summaries.

## Data and Component Boundaries

- `src/data/employer.ts` exports typed static company, role, candidate, interview, pipeline, activity, and notification fixtures. It is the only source of dashboard data.
- `src/components/layout/employer-shell.tsx` owns the shared employer header and main-content landmark.
- `src/components/features/employer/employer-dashboard-overview.tsx` renders the Employer Dashboard from the fixtures and existing shared `Button`, `Badge`, `Card`, and `Separator` primitives.
- `src/app/employer/layout.tsx` composes the employer shell around employer routes.
- `src/app/employer/dashboard/page.tsx` composes the dashboard feature component.

## Interaction and States

- Links only target routes that exist: CareerOS home and `/employer/dashboard`.
- The `Post a job` and notifications controls are visibly disabled with an accessible description that their management pages are not available in this dashboard-only phase.
- Candidate, job, pipeline, and notification content is display-only; it remains readable on touch devices and does not depend on hover.
- All informative status values use label text in addition to color.

## Visual and Responsive Design

- Reuse the Candidate Dashboard's page header, `Card` composition, muted icon wells, `lift-on-hover` cards, badge language, and data-dense but breathable spacing.
- On small screens, metric cards remain a two-column grid and all multi-column content stacks into one column. On large screens, use three-column sections where the primary analytical panel spans two columns.
- Use the project semantic color tokens and existing Lucide icon set; do not introduce new dependencies or a parallel design system.

## Validation

- Add focused source-level regression coverage that verifies the Employer Dashboard route composes the dashboard overview and that dashboard data includes the five required recruiting pipeline stages.
- Run the focused lint check for each new TypeScript/TSX file and a Next.js production build.
- Inspect `/employer/dashboard` at representative mobile and desktop widths to confirm the Candidate Dashboard visual language is preserved, the layout does not overflow, and disabled controls do not navigate.

## Self-review

The design intentionally limits the work to a dashboard-only employer slice. Every summary capability requested for Employer Dashboard in `context.txt` appears as a dashboard surface, while out-of-scope management workflows are not exposed as unfinished routes.
