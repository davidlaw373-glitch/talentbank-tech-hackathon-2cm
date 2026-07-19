# Employer Company Profile Entry Design

## Goal

Make the Meridian Byte Labs identity area in the employer header the sole navigation entry to Company Profile.

## Experience

- The primary employer navigation retains Dashboard and Jobs only.
- The Company profile item is removed from the primary navigation at every breakpoint.
- The right-aligned identity area containing the MB badge, company name, and Employer label becomes a link to `/employer/company`.
- The linked identity area has an accessible name, visible keyboard focus treatment, and the existing hover surface treatment.
- The header notification control and all other routes remain unchanged.

## Implementation Boundary

Modify only `src/components/layout/employer-shell.tsx`. Remove the unused `Building2` icon import and Company profile navigation button. Replace the non-interactive company identity `div` with a Next.js `Link` to `/employer/company`.

## Validation

Run focused lint on the employer shell and a production build. Confirm the source contains exactly one Company Profile route entry, on the company identity link, and that the primary navigation no longer renders a Company profile label.

## Self-review

This is a focused navigation consolidation. It preserves the Company Profile page and makes the requested identity control its single header entry point.
