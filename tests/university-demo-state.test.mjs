import assert from "node:assert/strict";
import test from "node:test";

import {
  createUniversityDemoState,
  executeUniversityCommand,
  selectCredentialProjection,
  selectDashboardProjection,
  selectGraduateVerificationStatus,
  selectReportProjection,
  selectVerificationAudit,
} from "../src/lib/university-demo-state.ts";

const NOW = "2026-07-22T08:00:00.000Z";

function createSeedState() {
  return createUniversityDemoState({
    institutionName: "University of Malaya",
    graduates: [
      {
        id: "graduate-alex",
        studentId: "UMCS2024001",
        name: "Alex Morgan",
        initials: "AM",
        faculty: "Computing",
        programme: "BSc Computer Science",
        graduationYear: 2024,
        profileCompletion: 82,
        nextAction: "Await Registry review",
      },
      {
        id: "graduate-wei",
        studentId: "UMCS2023008",
        name: "Wei Jian Lim",
        initials: "WL",
        faculty: "Computing",
        programme: "BSc Computer Science",
        graduationYear: 2023,
        profileCompletion: 74,
        nextAction: "Resolve dispute",
      },
      {
        id: "graduate-amir",
        studentId: "UMBE2023004",
        name: "Amir Hakim",
        initials: "AH",
        faculty: "Business",
        programme: "BBA Economics",
        graduationYear: 2023,
        profileCompletion: 67,
        nextAction: "Request complete evidence",
      },
    ],
    verificationRecords: [
      {
        id: "verification-alex-degree",
        graduateId: "graduate-alex",
        evidenceName: "Computer Science degree",
        evidenceType: "Degree",
        status: "Pending",
        submittedAt: "2024-07-08T09:00:00Z",
        institutionRecord: "BSc Computer Science, awarded July 2024",
        evidenceComplete: true,
      },
      {
        id: "verification-wei-course",
        graduateId: "graduate-wei",
        evidenceName: "Cloud systems course completion",
        evidenceType: "Course completion",
        status: "Disputed",
        submittedAt: "2024-07-05T12:10:00Z",
        institutionRecord: "Cloud Computing, completed December 2023",
        evidenceComplete: true,
      },
      {
        id: "verification-amir-certificate",
        graduateId: "graduate-amir",
        evidenceName: "Business analytics certificate",
        evidenceType: "Certificate",
        status: "Rejected",
        submittedAt: "2024-07-09T11:00:00Z",
        reviewer: "Dr. Nur Aina",
        reviewedAt: "2024-07-11T09:20:00Z",
        note: "Certificate number is incomplete.",
        institutionRecord: "No matching certificate record found",
        evidenceComplete: false,
      },
    ],
    employmentOutcomes: [
      {
        graduateId: "graduate-alex",
        status: "Employed",
        employer: "Northstar Labs",
        jobTitle: "Frontend Developer",
        industry: "Technology",
        employedAt: "2024-08-01",
        daysToEmployment: 31,
      },
      { graduateId: "graduate-wei", status: "Seeking" },
      { graduateId: "graduate-amir", status: "Unknown" },
    ],
  });
}

function registryDecision(state, recordId, decision, note) {
  return executeUniversityCommand(state, {
    type: "verification/decide",
    role: "registry",
    recordId,
    decision,
    note,
    actor: "Registry Demo User",
    occurredAt: NOW,
  });
}

test("Alex starts pending without a trusted Candidate or Employer label", () => {
  const state = createSeedState();

  assert.equal(
    selectGraduateVerificationStatus(state, "graduate-alex"),
    "Pending"
  );
  assert.deepEqual(selectCredentialProjection(state, "graduate-alex"), {
    graduateId: "graduate-alex",
    candidateName: "Alex Morgan",
    qualification: "Computer Science degree",
    institution: "University of Malaya",
    verificationStatus: "Pending",
    trustLabel: null,
  });
  assert.equal(selectDashboardProjection(state).pendingVerificationCount, 1);
});

test("Registry approval propagates one University verified projection and audit entry", () => {
  const initial = createSeedState();
  const result = registryDecision(
    initial,
    "verification-alex-degree",
    "approve",
    "Award matched the Registry record."
  );

  assert.equal(result.ok, true);
  assert.equal(
    selectGraduateVerificationStatus(result.state, "graduate-alex"),
    "Verified"
  );
  assert.deepEqual(selectCredentialProjection(result.state, "graduate-alex"), {
    graduateId: "graduate-alex",
    candidateName: "Alex Morgan",
    qualification: "Computer Science degree",
    institution: "University of Malaya",
    verificationStatus: "Verified",
    trustLabel: "University verified",
  });
  assert.equal(selectDashboardProjection(result.state).pendingVerificationCount, 0);
  assert.deepEqual(selectVerificationAudit(result.state, "verification-alex-degree").at(-1), {
    id: "verification-alex-degree-2026-07-22T08:00:00.000Z-approved",
    recordId: "verification-alex-degree",
    action: "Approved",
    actor: "Registry Demo User",
    occurredAt: NOW,
    note: "Award matched the Registry record.",
  });
});

test("Career Services cannot make an academic verification decision", () => {
  const initial = createSeedState();
  const result = executeUniversityCommand(initial, {
    type: "verification/decide",
    role: "careers",
    recordId: "verification-alex-degree",
    decision: "approve",
    note: "Attempted approval",
    actor: "Careers Demo User",
    occurredAt: NOW,
  });

  assert.equal(result.ok, false);
  assert.match(result.error, /Registry access is required/);
  assert.strictEqual(result.state, initial);
  assert.equal(
    selectGraduateVerificationStatus(result.state, "graduate-alex"),
    "Pending"
  );
});

test("Career Services cannot add, edit, or delete graduate academic records", () => {
  const initial = createSeedState();
  const newGraduate = {
    id: "graduate-new",
    studentId: "UMCS2026001",
    name: "New Graduate",
    initials: "NG",
    faculty: "Computing",
    programme: "BSc Computer Science",
    graduationYear: 2026,
    profileCompletion: 20,
    nextAction: "Await Registry review",
  };

  const attempts = [
    executeUniversityCommand(initial, {
      type: "graduate/add",
      role: "careers",
      graduate: newGraduate,
      actor: "Careers Demo User",
      occurredAt: NOW,
    }),
    executeUniversityCommand(initial, {
      type: "graduate/update-academic",
      role: "careers",
      graduateId: "graduate-alex",
      patch: { programme: "Changed programme" },
    }),
    executeUniversityCommand(initial, {
      type: "graduate/delete",
      role: "careers",
      graduateId: "graduate-alex",
    }),
  ];

  for (const result of attempts) {
    assert.equal(result.ok, false);
    assert.match(result.error, /Registry access is required/);
    assert.strictEqual(result.state, initial);
  }
});

test("Registry academic maintenance creates a pending audited record and can reach zero graduates", () => {
  let state = createUniversityDemoState({
    institutionName: "University of Malaya",
    graduates: [],
    verificationRecords: [],
    employmentOutcomes: [],
  });
  const graduate = {
    id: "graduate-new",
    studentId: "UMCS2026001",
    name: "New Graduate",
    initials: "NG",
    faculty: "Computing",
    programme: "BSc Computer Science",
    graduationYear: 2026,
    profileCompletion: 20,
    nextAction: "Await Registry review",
  };

  const added = executeUniversityCommand(state, {
    type: "graduate/add",
    role: "registry",
    graduate,
    actor: "Registry Demo User",
    occurredAt: NOW,
  });
  assert.equal(added.ok, true);
  assert.equal(added.state.graduates.length, 1);
  assert.equal(
    selectGraduateVerificationStatus(added.state, graduate.id),
    "Pending"
  );
  assert.equal(added.state.employmentOutcomes[0].status, "Unknown");

  const updated = executeUniversityCommand(added.state, {
    type: "graduate/update-academic",
    role: "registry",
    graduateId: graduate.id,
    patch: { programme: "BSc Information Systems", profileCompletion: 45 },
  });
  assert.equal(updated.ok, true);
  assert.equal(updated.state.graduates[0].programme, "BSc Information Systems");

  const removed = executeUniversityCommand(updated.state, {
    type: "graduate/delete",
    role: "registry",
    graduateId: graduate.id,
  });
  assert.equal(removed.ok, true);
  assert.deepEqual(removed.state.graduates, []);
  assert.deepEqual(removed.state.verificationRecords, []);
  assert.deepEqual(removed.state.employmentOutcomes, []);
});

test("Registry cannot update employment outcomes", () => {
  const initial = createSeedState();
  const result = executeUniversityCommand(initial, {
    type: "employment/update",
    role: "registry",
    outcome: { graduateId: "graduate-wei", status: "Not seeking" },
    actor: "Registry Demo User",
    occurredAt: NOW,
  });

  assert.equal(result.ok, false);
  assert.match(result.error, /Career Services access is required/);
  assert.strictEqual(result.state, initial);
});

test("Career Services employment updates recalculate dashboard and report projections", () => {
  const initial = createSeedState();
  const beforeDashboard = selectDashboardProjection(initial);
  const beforeReport = selectReportProjection(initial, {
    graduationYear: "all",
    faculty: "all",
    programme: "all",
  });

  const result = executeUniversityCommand(initial, {
    type: "employment/update",
    role: "careers",
    outcome: {
      graduateId: "graduate-wei",
      status: "Employed",
      employer: "Meridian Bank",
      jobTitle: "Cloud Engineer",
      industry: "Financial services",
      employedAt: "2026-07-01",
      daysToEmployment: 14,
    },
    actor: "Careers Demo User",
    occurredAt: NOW,
  });

  assert.equal(result.ok, true);
  assert.equal(beforeDashboard.metrics.employmentRate, 50);
  assert.equal(selectDashboardProjection(result.state).metrics.employmentRate, 100);
  assert.equal(beforeReport.metrics.employed, 1);
  assert.equal(
    selectReportProjection(result.state, {
      graduationYear: "all",
      faculty: "all",
      programme: "all",
    }).metrics.employed,
    2
  );
});

test("employed outcomes require complete placement details", () => {
  const initial = createSeedState();
  const result = executeUniversityCommand(initial, {
    type: "employment/update",
    role: "careers",
    outcome: { graduateId: "graduate-wei", status: "Employed" },
    actor: "Careers Demo User",
    occurredAt: NOW,
  });

  assert.equal(result.ok, false);
  assert.match(result.error, /Complete every employment detail/);
  assert.strictEqual(result.state, initial);
});

test("Pending and Disputed records accept valid decisions while terminal records do not", () => {
  const initial = createSeedState();
  const requested = registryDecision(
    initial,
    "verification-wei-course",
    "request-information",
    "Please provide the module transcript."
  );
  assert.equal(requested.ok, true);
  assert.equal(
    selectGraduateVerificationStatus(requested.state, "graduate-wei"),
    "Pending"
  );

  const terminalAttempt = registryDecision(
    initial,
    "verification-amir-certificate",
    "approve",
    "Attempt to reopen"
  );
  assert.equal(terminalAttempt.ok, false);
  assert.match(terminalAttempt.error, /terminal/);
  assert.strictEqual(terminalAttempt.state, initial);
});

test("rejection and information requests require an audit note", () => {
  const initial = createSeedState();

  for (const decision of ["reject", "request-information"]) {
    const result = registryDecision(
      initial,
      "verification-alex-degree",
      decision,
      "   "
    );
    assert.equal(result.ok, false);
    assert.match(result.error, /note|reason/i);
    assert.strictEqual(result.state, initial);
  }
});

test("approval requires complete evidence", () => {
  const initial = createSeedState();
  const incomplete = createUniversityDemoState({
    institutionName: initial.institutionName,
    graduates: initial.graduates,
    verificationRecords: initial.verificationRecords.map((record) =>
      record.id === "verification-alex-degree"
        ? { ...record, evidenceComplete: false }
        : record
    ),
    employmentOutcomes: initial.employmentOutcomes,
  });

  const result = registryDecision(
    incomplete,
    "verification-alex-degree",
    "approve",
    "Attempted approval"
  );
  assert.equal(result.ok, false);
  assert.match(result.error, /complete evidence/);
  assert.strictEqual(result.state, incomplete);
});

test("bulk approval rejects incompatible selections and approves compatible eligible records", () => {
  const initial = createSeedState();
  const incompatible = executeUniversityCommand(initial, {
    type: "verification/bulk-approve",
    role: "registry",
    recordIds: ["verification-alex-degree", "verification-wei-course"],
    actor: "Registry Demo User",
    occurredAt: NOW,
  });
  assert.equal(incompatible.ok, false);
  assert.match(incompatible.error, /same evidence type/);
  assert.strictEqual(incompatible.state, initial);

  const secondDegreeState = createUniversityDemoState({
    institutionName: initial.institutionName,
    graduates: initial.graduates,
    verificationRecords: [
      ...initial.verificationRecords,
      {
        id: "verification-wei-degree",
        graduateId: "graduate-wei",
        evidenceName: "Computer Science degree",
        evidenceType: "Degree",
        status: "Disputed",
        submittedAt: "2024-07-05T12:10:00Z",
        institutionRecord: "BSc Computer Science",
        evidenceComplete: true,
      },
    ],
    employmentOutcomes: initial.employmentOutcomes,
  });
  const approved = executeUniversityCommand(secondDegreeState, {
    type: "verification/bulk-approve",
    role: "registry",
    recordIds: ["verification-alex-degree", "verification-wei-degree"],
    actor: "Registry Demo User",
    occurredAt: NOW,
  });

  assert.equal(approved.ok, true);
  assert.deepEqual(
    approved.state.verificationRecords
      .filter((record) =>
        ["verification-alex-degree", "verification-wei-degree"].includes(record.id)
      )
      .map((record) => record.status),
    ["Verified", "Verified"]
  );
});
