import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourceRoot = new URL("../src/components/features/university/", import.meta.url);

test("dashboard keeps role-independent content outside the client boundary", async () => {
  const dashboardSource = await readFile(
    new URL("university-dashboard.tsx", sourceRoot),
    "utf8"
  );

  assert.doesNotMatch(dashboardSource, /^"use client";/);
  assert.match(dashboardSource, /UniversityRoleHeader/);
  assert.match(dashboardSource, /UniversityUpcomingTasks/);
});

test("dashboard projects exact task fields before crossing the client boundary", async () => {
  const dashboardSource = await readFile(
    new URL("university-dashboard.tsx", sourceRoot),
    "utf8"
  );
  const roleContentSource = await readFile(
    new URL("university-dashboard-role-content.tsx", sourceRoot),
    "utf8"
  );
  const exactTaskProjections = dashboardSource.match(
    /\.map\(\(\{\s*id,\s*name,\s*nextAction\s*\}\)\s*=>\s*\(\{\s*id,\s*name,\s*nextAction\s*\}\)\)/g
  ) ?? [];

  assert.equal(
    exactTaskProjections.length,
    2,
    "both role task arrays must project only id, name, and nextAction"
  );
  assert.doesNotMatch(roleContentSource, /\bGraduate\b/);
  assert.match(
    roleContentSource,
    /type UpcomingTask = \{\s*id: string;\s*name: string;\s*nextAction: string;\s*\}/
  );
});

test("graduate CSV preview clears the native input on cancel and import", async () => {
  const graduateSource = await readFile(
    new URL("graduate-management.tsx", sourceRoot),
    "utf8"
  );

  assert.match(graduateSource, /useRef<HTMLInputElement>/);
  assert.match(graduateSource, /fileInputRef\.current\.value\s*=\s*""/);
  assert.match(graduateSource, /onClick=\{cancelImportPreview\}/);
  assert.match(graduateSource, /function importValidRecords\(\)[\s\S]*resetImportPreview\(\)/);
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

test("public profile metrics include graduates without outcome rows", async () => {
  const profileSource = await readFile(
    new URL("university-profile.tsx", sourceRoot),
    "utf8"
  );

  assert.match(profileSource, /normalizeEmploymentOutcomes/);
  assert.match(
    profileSource,
    /calculateEmploymentMetrics\(normalizedEmploymentOutcomes\)/
  );
  assert.match(
    profileSource,
    /normalizedEmploymentOutcomes\.filter/
  );
});
