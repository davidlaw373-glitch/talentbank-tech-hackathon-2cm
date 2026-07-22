import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourceRoot = new URL("../src/components/features/university/", import.meta.url);
const appRoot = new URL("../src/app/", import.meta.url);
const componentRoot = new URL("../src/components/", import.meta.url);
const dataRoot = new URL("../src/data/", import.meta.url);

test("root layout owns the persistent demo provider above every product area", async () => {
  const rootLayoutSource = await readFile(
    new URL("layout.tsx", appRoot),
    "utf8"
  );
  const providerSource = await readFile(
    new URL("common/careeros-demo-provider.tsx", componentRoot),
    "utf8"
  );

  assert.match(rootLayoutSource, /CareerOSDemoProvider/);
  assert.match(
    rootLayoutSource,
    /<CareerOSDemoProvider>[\s\S]*\{children\}[\s\S]*<\/CareerOSDemoProvider>/
  );
  assert.match(providerSource, /createUniversityDemoState/);
  assert.match(providerSource, /executeUniversityCommand/);
  assert.match(providerSource, /export function useCareerOSDemo/);
});

test("dashboard, reports, and public profile derive from the shared demo state", async () => {
  for (const filename of [
    "university-dashboard.tsx",
    "university-reports.tsx",
    "university-profile.tsx",
  ]) {
    const source = await readFile(new URL(filename, sourceRoot), "utf8");
    assert.match(source, /useCareerOSDemo/);
    assert.doesNotMatch(
      source,
      /import\s*\{[^}]*\b(graduates|verificationRecords|employmentOutcomes)\b[^}]*\}\s*from\s*["']@\/data\/university["']/
    );
  }
});

test("graduate management exposes no file upload or direct credential-status editor", async () => {
  const graduateSource = await readFile(
    new URL("graduate-management.tsx", sourceRoot),
    "utf8"
  );

  assert.doesNotMatch(graduateSource, /type="file"|accept=.*csv/);
  assert.doesNotMatch(graduateSource, /Credential status</);
  assert.match(graduateSource, /selectGraduateVerificationStatus/);
});

test("graduate deletion and detail views expose accessible recovery surfaces", async () => {
  const graduateSource = await readFile(
    new URL("graduate-management.tsx", sourceRoot),
    "utf8"
  );

  assert.match(graduateSource, /<dialog/);
  assert.match(graduateSource, /role="alertdialog"/);
  assert.match(graduateSource, /showModal\(\)/);
  assert.match(graduateSource, /View details/);
  assert.match(graduateSource, /No graduate records yet/);
});

test("verification controls are guarded by shared eligibility and one visible live notice", async () => {
  const verificationSource = await readFile(
    new URL("verification-center.tsx", sourceRoot),
    "utf8"
  );

  assert.match(verificationSource, /useCareerOSDemo/);
  assert.match(verificationSource, /execute\(\{/);
  assert.match(verificationSource, /isDecidable/);
  assert.match(verificationSource, /role="status"/);
  assert.doesNotMatch(
    verificationSource,
    /className="sr-only"\s+aria-live="polite"/
  );
});

test("employment updates use the shared Careers-only command and one announcement", async () => {
  const employmentSource = await readFile(
    new URL("employment-tracking.tsx", sourceRoot),
    "utf8"
  );

  assert.match(employmentSource, /useCareerOSDemo/);
  assert.match(employmentSource, /type:\s*"employment\/update"/);
  assert.equal(
    (employmentSource.match(/role="status"/g) ?? []).length,
    1,
    "the visible status notice is also the only live status announcement"
  );
});

test("every notification tab value is represented by a TabsContent panel", async () => {
  const notificationSource = await readFile(
    new URL("university-notifications.tsx", sourceRoot),
    "utf8"
  );

  assert.match(notificationSource, /TabsContent/);
  assert.match(notificationSource, /notificationFilters\.map/);
  assert.match(
    notificationSource,
    /<TabsContent[\s\S]*value=\{notificationFilter\}/
  );
});

test("Candidate and Employer trust use one shared credential projection", async () => {
  const candidateSource = await readFile(
    new URL("features/candidate/profile-overview.tsx", componentRoot),
    "utf8"
  );
  const employerSource = await readFile(
    new URL("features/employer/candidate-management.tsx", componentRoot),
    "utf8"
  );
  const candidateData = await readFile(new URL("candidate.ts", dataRoot), "utf8");
  const employerData = await readFile(new URL("employer.ts", dataRoot), "utf8");

  for (const source of [candidateSource, employerSource]) {
    assert.match(source, /useCareerOSDemo/);
    assert.match(source, /selectCredentialProjection/);
  }
  assert.doesNotMatch(candidateData, /University verified/);
  assert.doesNotMatch(employerData, /University verified/);
  assert.doesNotMatch(employerData, /verifiedCredential/);
});

test("static University Insights content stays outside the role client boundary", async () => {
  const insightsSource = await readFile(
    new URL("university-insights.tsx", sourceRoot),
    "utf8"
  );
  const roleCopySource = await readFile(
    new URL("university-insights-role-copy.tsx", sourceRoot),
    "utf8"
  );

  assert.doesNotMatch(insightsSource, /^"use client";/);
  assert.match(insightsSource, /UniversityInsightsRoleCopy/);
  assert.match(roleCopySource, /^"use client";/);
  assert.match(roleCopySource, /useUniversityRole/);
});

test("Candidate notification and dashboard progress derive from the shared typed credential association", async () => {
  const dashboardSource = await readFile(
    new URL("features/candidate/dashboard-overview.tsx", componentRoot),
    "utf8"
  );
  const profileSource = await readFile(
    new URL("features/candidate/profile-overview.tsx", componentRoot),
    "utf8"
  );
  const notificationSource = await readFile(
    new URL("features/notifications/notifications-center.tsx", componentRoot),
    "utf8"
  );
  const notificationData = await readFile(
    new URL("notifications.ts", dataRoot),
    "utf8"
  );
  const employerSource = await readFile(
    new URL("features/employer/candidate-management.tsx", componentRoot),
    "utf8"
  );

  assert.match(dashboardSource, /candidateProfile\.graduateId/);
  assert.match(dashboardSource, /credentialProgress/);
  assert.match(notificationSource, /useCareerOSDemo/);
  assert.match(notificationSource, /selectCredentialProjection/);
  assert.match(notificationSource, /candidateProfile\.graduateId/);
  assert.doesNotMatch(notificationData, /Evidence verified|verified by the university/);
  for (const source of [dashboardSource, profileSource, employerSource]) {
    assert.doesNotMatch(source, /["']graduate-alex["']/);
  }
  assert.match(employerSource, /applicant\.graduateId/);
});

test("Registry import and evidence submission stay behind shared commands", async () => {
  const graduateSource = await readFile(
    new URL("graduate-management.tsx", sourceRoot),
    "utf8"
  );
  const verificationSource = await readFile(
    new URL("verification-center.tsx", sourceRoot),
    "utf8"
  );
  const universityData = await readFile(new URL("university.ts", dataRoot), "utf8");

  assert.match(graduateSource, /parseGraduateCsv/);
  assert.match(graduateSource, /type:\s*"graduate\/import"/);
  assert.match(graduateSource, /Preview sample CSV/);
  assert.match(graduateSource, /if \(!isRegistry\)/);
  assert.match(verificationSource, /type:\s*"verification\/submit-evidence"/);
  assert.match(verificationSource, /Submit complete evidence/);
  assert.match(universityData, /Pending evidence/);
  assert.doesNotMatch(universityData, /ready to import; one record needs attention/);
});

test("graduate actions, details, skip links, and dashboard collections are derived and accessible", async () => {
  const graduateSource = await readFile(
    new URL("graduate-management.tsx", sourceRoot),
    "utf8"
  );
  const dashboardSource = await readFile(
    new URL("university-dashboard.tsx", sourceRoot),
    "utf8"
  );
  const universityData = await readFile(new URL("university.ts", dataRoot), "utf8");
  const candidateShell = await readFile(
    new URL("layout/candidate-shell.tsx", componentRoot),
    "utf8"
  );
  const universityShell = await readFile(
    new URL("layout/university-shell.tsx", componentRoot),
    "utf8"
  );

  assert.match(graduateSource, /selectGraduateNextAction/);
  assert.doesNotMatch(universityData, /nextAction:/);
  assert.match(graduateSource, /aria-expanded=/);
  assert.match(graduateSource, /aria-controls=/);
  assert.match(graduateSource, /tabIndex=\{-1\}/);
  assert.doesNotMatch(candidateShell, /Skip to main content/);
  assert.doesNotMatch(universityShell, /Skip to main content/);
  assert.match(dashboardSource, /verificationQueue\.length === 0/);
  assert.match(dashboardSource, /new Set\(state\.graduates\.map/);
  assert.doesNotMatch(dashboardSource, /universityProfile\.faculties\.map/);
});
