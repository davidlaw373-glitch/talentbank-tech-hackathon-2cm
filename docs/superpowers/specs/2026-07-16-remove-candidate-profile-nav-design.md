# Remove Candidate Profile Navigation Entry

## Goal

Remove the top-level `Profile` navigation item from the candidate shell without changing any profile functionality.

## User experience

- The header continues to show Dashboard, Find jobs, and Applications.
- The `Profile` item and its user icon are absent from the top navigation at every responsive width.
- The Alex Morgan profile control in the header remains the sole in-product navigation path to `/candidate/profile`.
- The profile route, its editing experience, and all other navigation behavior remain unchanged.

## Implementation boundary

Change only the candidate shell navigation configuration in `src/components/layout/candidate-shell.tsx`. Remove the now-unused profile navigation icon import if it becomes unused. No route removal, redirects, or changes to the profile overview are included.

## Validation

Add a focused regression test that verifies the shared candidate navigation does not render a Profile navigation link while retaining the Alex Morgan profile link. Run the relevant test suite and the project lint/type validation available in the repository. Verify the header in the local application at desktop and mobile widths.

## Self-review

This specification has no placeholders, keeps the profile route intentionally available, and limits scope to the requested header link removal.
