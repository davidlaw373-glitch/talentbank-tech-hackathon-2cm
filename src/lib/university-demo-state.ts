import type {
  AcademicVerificationStatus,
  CredentialProjection,
  EmploymentOutcome,
  EmploymentStatus,
  Graduate,
  VerificationAuditAction,
  VerificationAuditEntry,
  VerificationDecision,
  VerificationRecord,
  UniversityRole,
} from "@/types/university";

export type UniversityDemoState = {
  institutionName: string;
  graduates: Graduate[];
  verificationRecords: VerificationRecord[];
  employmentOutcomes: EmploymentOutcome[];
  verificationAudit: VerificationAuditEntry[];
  activities: string[];
};

export type UniversityDemoSeed = {
  institutionName: string;
  graduates: readonly Graduate[];
  verificationRecords: readonly VerificationRecord[];
  employmentOutcomes: readonly EmploymentOutcome[];
  activities?: readonly string[];
};

export type GraduateAcademicPatch = Partial<
  Pick<
    Graduate,
    | "studentId"
    | "name"
    | "faculty"
    | "programme"
    | "graduationYear"
    | "profileCompletion"
    | "nextAction"
  >
>;

type CommandMetadata = {
  actor: string;
  occurredAt: string;
};

export type UniversityCommand =
  | ({
      type: "graduate/add";
      role: UniversityRole;
      graduate: Graduate;
    } & CommandMetadata)
  | {
      type: "graduate/update-academic";
      role: UniversityRole;
      graduateId: string;
      patch: GraduateAcademicPatch;
    }
  | {
      type: "graduate/delete";
      role: UniversityRole;
      graduateId: string;
    }
  | ({
      type: "employment/update";
      role: UniversityRole;
      outcome: EmploymentOutcome;
    } & CommandMetadata)
  | ({
      type: "verification/decide";
      role: UniversityRole;
      recordId: string;
      decision: VerificationDecision;
      note?: string;
    } & CommandMetadata)
  | ({
      type: "verification/bulk-approve";
      role: UniversityRole;
      recordIds: string[];
    } & CommandMetadata);

export type UniversityCommandResult =
  | {
      ok: true;
      state: UniversityDemoState;
      message: string;
    }
  | {
      ok: false;
      state: UniversityDemoState;
      error: string;
    };

export type EmploymentMetrics = {
  employed: number;
  seeking: number;
  unknown: number;
  knownOutcomes: number;
  laborForce: number;
  employmentRate: number;
  coverageRate: number;
  averageDaysToEmployment: number;
};

export type ReportFilters = {
  graduationYear: "all" | string | number;
  faculty: "all" | string;
  programme: "all" | string;
};

const outcomeOrder: EmploymentStatus[] = [
  "Employed",
  "Seeking",
  "Further study",
  "Not seeking",
  "Unknown",
];

const terminalVerificationStatuses = new Set<AcademicVerificationStatus>([
  "Verified",
  "Rejected",
]);

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function auditActionForSeed(
  status: AcademicVerificationStatus
): VerificationAuditAction {
  if (status === "Verified") return "Verified by Registry";
  if (status === "Rejected") return "Rejected by Registry";
  if (status === "Disputed") return "Dispute recorded";
  return "Evidence submitted";
}

function initialAuditForRecord(
  record: VerificationRecord
): VerificationAuditEntry[] {
  const entries: VerificationAuditEntry[] = [
    {
      id: `${record.id}-submitted`,
      recordId: record.id,
      action: "Evidence submitted",
      actor: "Graduate",
      occurredAt: record.submittedAt,
    },
  ];

  if (record.reviewer && record.reviewedAt) {
    entries.push({
      id: `${record.id}-reviewed`,
      recordId: record.id,
      action: auditActionForSeed(record.status),
      actor: record.reviewer,
      occurredAt: record.reviewedAt,
      note: record.note,
    });
  }

  return entries;
}

export function createUniversityDemoState(
  seed: UniversityDemoSeed
): UniversityDemoState {
  const verificationRecords = seed.verificationRecords.map((record) => ({
    ...record,
  }));

  return {
    institutionName: seed.institutionName,
    graduates: seed.graduates.map((graduate) => ({ ...graduate })),
    verificationRecords,
    employmentOutcomes: seed.employmentOutcomes.map((outcome) => ({ ...outcome })),
    verificationAudit: verificationRecords.flatMap(initialAuditForRecord),
    activities: [...(seed.activities ?? [])],
  };
}

function failure(
  state: UniversityDemoState,
  error: string
): UniversityCommandResult {
  return { ok: false, state, error };
}

function success(
  state: UniversityDemoState,
  message: string
): UniversityCommandResult {
  return { ok: true, state, message };
}

function requireRegistry(
  state: UniversityDemoState,
  role: UniversityRole
): UniversityCommandResult | null {
  return role === "registry"
    ? null
    : failure(state, "Registry access is required for academic records and verification.");
}

function requireCareers(
  state: UniversityDemoState,
  role: UniversityRole
): UniversityCommandResult | null {
  return role === "careers"
    ? null
    : failure(state, "Career Services access is required to update employment outcomes.");
}

function cleanGraduate(graduate: Graduate): Graduate {
  const name = graduate.name.trim();

  return {
    id: graduate.id,
    studentId: graduate.studentId.trim(),
    name,
    initials: initialsFor(name),
    faculty: graduate.faculty.trim(),
    programme: graduate.programme.trim(),
    graduationYear: graduate.graduationYear,
    profileCompletion: graduate.profileCompletion,
    nextAction: graduate.nextAction.trim() || "Review graduate record",
  };
}

function graduateValidationError(graduate: Graduate) {
  if (
    !graduate.id.trim() ||
    !graduate.studentId.trim() ||
    !graduate.name.trim() ||
    !graduate.faculty.trim() ||
    !graduate.programme.trim()
  ) {
    return "Enter a graduate name, student ID, faculty, and programme before saving.";
  }
  if (
    !Number.isInteger(graduate.graduationYear) ||
    graduate.graduationYear < 1900 ||
    graduate.graduationYear > 2100
  ) {
    return "Enter a valid graduation year.";
  }
  if (
    !Number.isFinite(graduate.profileCompletion) ||
    graduate.profileCompletion < 0 ||
    graduate.profileCompletion > 100
  ) {
    return "Profile completeness must be between 0 and 100.";
  }
  return null;
}

function addGraduate(
  state: UniversityDemoState,
  command: Extract<UniversityCommand, { type: "graduate/add" }>
): UniversityCommandResult {
  const permissionFailure = requireRegistry(state, command.role);
  if (permissionFailure) return permissionFailure;

  const graduate = cleanGraduate(command.graduate);
  const validationError = graduateValidationError(graduate);
  if (validationError) return failure(state, validationError);
  if (state.graduates.some((record) => record.id === graduate.id)) {
    return failure(state, "A graduate with this record ID already exists.");
  }
  if (
    state.graduates.some(
      (record) => record.studentId.toLocaleLowerCase() === graduate.studentId.toLocaleLowerCase()
    )
  ) {
    return failure(state, "A graduate with this student ID already exists.");
  }

  const verificationRecord: VerificationRecord = {
    id: `verification-${graduate.id}-degree`,
    graduateId: graduate.id,
    evidenceName: `${graduate.programme} degree`,
    evidenceType: "Degree",
    status: "Pending",
    submittedAt: command.occurredAt,
    institutionRecord: `${graduate.programme}, class of ${graduate.graduationYear}`,
    evidenceComplete: false,
  };
  const auditEntry: VerificationAuditEntry = {
    id: `${verificationRecord.id}-${command.occurredAt}-requested`,
    recordId: verificationRecord.id,
    action: "Verification requested",
    actor: command.actor,
    occurredAt: command.occurredAt,
    note: "Academic record added; supporting evidence remains pending.",
  };

  return success(
    {
      ...state,
      graduates: [graduate, ...state.graduates],
      verificationRecords: [verificationRecord, ...state.verificationRecords],
      employmentOutcomes: [
        { graduateId: graduate.id, status: "Unknown" },
        ...state.employmentOutcomes,
      ],
      verificationAudit: [...state.verificationAudit, auditEntry],
      activities: [
        `${graduate.name}'s academic record was added by ${command.actor}.`,
        ...state.activities,
      ],
    },
    `${graduate.name} was added with a pending degree verification.`
  );
}

function updateGraduateAcademic(
  state: UniversityDemoState,
  command: Extract<UniversityCommand, { type: "graduate/update-academic" }>
): UniversityCommandResult {
  const permissionFailure = requireRegistry(state, command.role);
  if (permissionFailure) return permissionFailure;

  const graduate = state.graduates.find(
    (record) => record.id === command.graduateId
  );
  if (!graduate) return failure(state, "Graduate record not found.");

  const candidate = cleanGraduate({
    ...graduate,
    studentId: command.patch.studentId ?? graduate.studentId,
    name: command.patch.name ?? graduate.name,
    faculty: command.patch.faculty ?? graduate.faculty,
    programme: command.patch.programme ?? graduate.programme,
    graduationYear: command.patch.graduationYear ?? graduate.graduationYear,
    profileCompletion:
      command.patch.profileCompletion ?? graduate.profileCompletion,
    nextAction: command.patch.nextAction ?? graduate.nextAction,
  });
  const validationError = graduateValidationError(candidate);
  if (validationError) return failure(state, validationError);
  if (
    state.graduates.some(
      (record) =>
        record.id !== candidate.id &&
        record.studentId.toLocaleLowerCase() === candidate.studentId.toLocaleLowerCase()
    )
  ) {
    return failure(state, "A graduate with this student ID already exists.");
  }

  return success(
    {
      ...state,
      graduates: state.graduates.map((record) =>
        record.id === candidate.id ? candidate : record
      ),
    },
    `${candidate.name}'s academic record was updated.`
  );
}

function deleteGraduate(
  state: UniversityDemoState,
  command: Extract<UniversityCommand, { type: "graduate/delete" }>
): UniversityCommandResult {
  const permissionFailure = requireRegistry(state, command.role);
  if (permissionFailure) return permissionFailure;

  const graduate = state.graduates.find(
    (record) => record.id === command.graduateId
  );
  if (!graduate) return failure(state, "Graduate record not found.");

  const removedVerificationIds = new Set(
    state.verificationRecords
      .filter((record) => record.graduateId === graduate.id)
      .map((record) => record.id)
  );

  return success(
    {
      ...state,
      graduates: state.graduates.filter((record) => record.id !== graduate.id),
      verificationRecords: state.verificationRecords.filter(
        (record) => record.graduateId !== graduate.id
      ),
      employmentOutcomes: state.employmentOutcomes.filter(
        (outcome) => outcome.graduateId !== graduate.id
      ),
      verificationAudit: state.verificationAudit.filter(
        (entry) => !removedVerificationIds.has(entry.recordId)
      ),
      activities: [
        `${graduate.name}'s graduate record was removed by Registry.`,
        ...state.activities,
      ],
    },
    `${graduate.name} was removed from graduate records.`
  );
}

function validEmployedOutcome(outcome: EmploymentOutcome) {
  return Boolean(
    outcome.employer?.trim() &&
      outcome.jobTitle?.trim() &&
      outcome.industry?.trim() &&
      outcome.employedAt?.trim() &&
      Number.isFinite(outcome.daysToEmployment) &&
      (outcome.daysToEmployment ?? -1) >= 0
  );
}

function cleanOutcome(outcome: EmploymentOutcome): EmploymentOutcome {
  if (outcome.status !== "Employed") {
    return { graduateId: outcome.graduateId, status: outcome.status };
  }

  return {
    graduateId: outcome.graduateId,
    status: "Employed",
    employer: outcome.employer?.trim(),
    jobTitle: outcome.jobTitle?.trim(),
    industry: outcome.industry?.trim(),
    employedAt: outcome.employedAt,
    daysToEmployment: outcome.daysToEmployment,
  };
}

function updateEmployment(
  state: UniversityDemoState,
  command: Extract<UniversityCommand, { type: "employment/update" }>
): UniversityCommandResult {
  const permissionFailure = requireCareers(state, command.role);
  if (permissionFailure) return permissionFailure;

  const graduate = state.graduates.find(
    (record) => record.id === command.outcome.graduateId
  );
  if (!graduate) return failure(state, "Graduate record not found.");
  if (
    command.outcome.status === "Employed" &&
    !validEmployedOutcome(command.outcome)
  ) {
    return failure(
      state,
      "Complete every employment detail before saving an employed outcome."
    );
  }

  const outcome = cleanOutcome(command.outcome);
  const existing = state.employmentOutcomes.some(
    (record) => record.graduateId === outcome.graduateId
  );
  const employmentOutcomes = existing
    ? state.employmentOutcomes.map((record) =>
        record.graduateId === outcome.graduateId ? outcome : record
      )
    : [...state.employmentOutcomes, outcome];

  return success(
    {
      ...state,
      employmentOutcomes,
      activities: [
        `${graduate.name}'s employment outcome was updated to ${outcome.status} by ${command.actor}.`,
        ...state.activities,
      ],
    },
    `${graduate.name}'s employment outcome was saved. All outcome metrics were recalculated.`
  );
}

function decisionStatus(decision: VerificationDecision) {
  if (decision === "approve") return "Verified" as const;
  if (decision === "reject") return "Rejected" as const;
  return "Pending" as const;
}

function decisionAuditAction(
  decision: VerificationDecision
): VerificationAuditAction {
  if (decision === "approve") return "Approved";
  if (decision === "reject") return "Rejected";
  return "More information requested";
}

function decisionIdSuffix(decision: VerificationDecision) {
  if (decision === "approve") return "approved";
  if (decision === "reject") return "rejected";
  return "information-requested";
}

function decideVerification(
  state: UniversityDemoState,
  command: Extract<UniversityCommand, { type: "verification/decide" }>
): UniversityCommandResult {
  const permissionFailure = requireRegistry(state, command.role);
  if (permissionFailure) return permissionFailure;

  const record = state.verificationRecords.find(
    (candidate) => candidate.id === command.recordId
  );
  if (!record) return failure(state, "Verification record not found.");
  if (terminalVerificationStatuses.has(record.status)) {
    return failure(
      state,
      `${record.status} verification records are terminal and read-only in this MVP.`
    );
  }
  if (command.decision === "approve" && !record.evidenceComplete) {
    return failure(state, "Approval requires complete evidence.");
  }

  const note = command.note?.trim() ?? "";
  if (command.decision === "reject" && !note) {
    return failure(state, "Add a rejection reason before rejecting this evidence.");
  }
  if (command.decision === "request-information" && !note) {
    return failure(state, "Add a note before requesting more information.");
  }

  const status = decisionStatus(command.decision);
  const savedNote =
    note ||
    (command.decision === "approve"
      ? "Approved after Registry review."
      : undefined);
  const updatedRecord: VerificationRecord = {
    ...record,
    status,
    reviewer: command.actor,
    reviewedAt: command.occurredAt,
    note: savedNote,
  };
  const auditEntry: VerificationAuditEntry = {
    id: `${record.id}-${command.occurredAt}-${decisionIdSuffix(command.decision)}`,
    recordId: record.id,
    action: decisionAuditAction(command.decision),
    actor: command.actor,
    occurredAt: command.occurredAt,
    note: savedNote,
  };
  const graduate = state.graduates.find(
    (candidate) => candidate.id === record.graduateId
  );
  const actionCopy =
    command.decision === "approve"
      ? "approved"
      : command.decision === "reject"
        ? "rejected"
        : "returned for more information";

  return success(
    {
      ...state,
      verificationRecords: state.verificationRecords.map((candidate) =>
        candidate.id === record.id ? updatedRecord : candidate
      ),
      verificationAudit: [...state.verificationAudit, auditEntry],
      activities: [
        `${graduate?.name ?? "A graduate"}'s ${record.evidenceName} was ${actionCopy} by ${command.actor}.`,
        ...state.activities,
      ],
    },
    `${record.evidenceName} was ${actionCopy}.`
  );
}

function bulkApproveVerification(
  state: UniversityDemoState,
  command: Extract<UniversityCommand, { type: "verification/bulk-approve" }>
): UniversityCommandResult {
  const permissionFailure = requireRegistry(state, command.role);
  if (permissionFailure) return permissionFailure;

  const recordIds = [...new Set(command.recordIds)];
  if (recordIds.length === 0) {
    return failure(state, "Select at least one eligible verification record.");
  }
  const selected = recordIds.map((recordId) =>
    state.verificationRecords.find((record) => record.id === recordId)
  );
  if (selected.some((record) => !record)) {
    return failure(state, "One or more selected verification records were not found.");
  }
  const records = selected.filter(
    (record): record is VerificationRecord => Boolean(record)
  );
  if (records.some((record) => terminalVerificationStatuses.has(record.status))) {
    return failure(
      state,
      "Verified and Rejected verification records are terminal and cannot be approved again."
    );
  }
  if (new Set(records.map((record) => record.evidenceType)).size !== 1) {
    return failure(state, "Selected records must share the same evidence type.");
  }
  if (records.some((record) => !record.evidenceComplete)) {
    return failure(state, "Every selected record must have complete evidence.");
  }

  const approvedIds = new Set(recordIds);
  const note = "Approved in a batch Registry review.";
  const auditEntries: VerificationAuditEntry[] = records.map((record) => ({
    id: `${record.id}-${command.occurredAt}-approved-in-batch`,
    recordId: record.id,
    action: "Approved in batch",
    actor: command.actor,
    occurredAt: command.occurredAt,
    note,
  }));

  return success(
    {
      ...state,
      verificationRecords: state.verificationRecords.map((record) =>
        approvedIds.has(record.id)
          ? {
              ...record,
              status: "Verified",
              reviewer: command.actor,
              reviewedAt: command.occurredAt,
              note,
            }
          : record
      ),
      verificationAudit: [...state.verificationAudit, ...auditEntries],
      activities: [
        `${records.length} compatible verification records were approved in batch by ${command.actor}.`,
        ...state.activities,
      ],
    },
    `${records.length} verification record${records.length === 1 ? " was" : "s were"} approved.`
  );
}

export function executeUniversityCommand(
  state: UniversityDemoState,
  command: UniversityCommand
): UniversityCommandResult {
  switch (command.type) {
    case "graduate/add":
      return addGraduate(state, command);
    case "graduate/update-academic":
      return updateGraduateAcademic(state, command);
    case "graduate/delete":
      return deleteGraduate(state, command);
    case "employment/update":
      return updateEmployment(state, command);
    case "verification/decide":
      return decideVerification(state, command);
    case "verification/bulk-approve":
      return bulkApproveVerification(state, command);
    default: {
      const exhaustiveCommand: never = command;
      return exhaustiveCommand;
    }
  }
}

export function normalizeEmploymentOutcomes(
  graduateRecords: readonly Pick<Graduate, "id">[],
  outcomes: readonly EmploymentOutcome[]
): EmploymentOutcome[] {
  const outcomesByGraduateId = new Map(
    outcomes.map((outcome) => [outcome.graduateId, outcome])
  );

  return graduateRecords.map(
    (graduate) =>
      outcomesByGraduateId.get(graduate.id) ?? {
        graduateId: graduate.id,
        status: "Unknown",
      }
  );
}

export function calculateEmploymentMetrics(
  outcomes: readonly EmploymentOutcome[]
): EmploymentMetrics {
  const employed = outcomes.filter((outcome) => outcome.status === "Employed");
  const seeking = outcomes.filter((outcome) => outcome.status === "Seeking");
  const unknown = outcomes.filter((outcome) => outcome.status === "Unknown");
  const knownOutcomes = outcomes.length - unknown.length;
  const laborForce = employed.length + seeking.length;
  const timedPlacements = employed.filter(
    (outcome) => outcome.daysToEmployment !== undefined
  );

  return {
    employed: employed.length,
    seeking: seeking.length,
    unknown: unknown.length,
    knownOutcomes,
    laborForce,
    employmentRate:
      laborForce === 0 ? 0 : Math.round((employed.length / laborForce) * 100),
    coverageRate:
      outcomes.length === 0
        ? 0
        : Math.round((knownOutcomes / outcomes.length) * 100),
    averageDaysToEmployment:
      timedPlacements.length === 0
        ? 0
        : Math.round(
            timedPlacements.reduce(
              (sum, outcome) => sum + (outcome.daysToEmployment ?? 0),
              0
            ) / timedPlacements.length
          ),
  };
}

export function selectNormalizedEmploymentOutcomes(
  state: UniversityDemoState
) {
  return normalizeEmploymentOutcomes(state.graduates, state.employmentOutcomes);
}

export function selectEmploymentOutcome(
  state: UniversityDemoState,
  graduateId: string
): EmploymentOutcome {
  return (
    state.employmentOutcomes.find(
      (outcome) => outcome.graduateId === graduateId
    ) ?? { graduateId, status: "Unknown" }
  );
}

export function selectGraduateVerificationStatus(
  state: UniversityDemoState,
  graduateId: string
): AcademicVerificationStatus {
  const statuses = state.verificationRecords
    .filter((record) => record.graduateId === graduateId)
    .map((record) => record.status);

  if (statuses.includes("Disputed")) return "Disputed";
  if (statuses.includes("Pending")) return "Pending";
  if (statuses.includes("Verified")) return "Verified";
  if (statuses.includes("Rejected")) return "Rejected";
  return "Pending";
}

export function selectCredentialProjection(
  state: UniversityDemoState,
  graduateId: string
): CredentialProjection | null {
  const graduate = state.graduates.find((record) => record.id === graduateId);
  const degreeRecord = state.verificationRecords
    .filter(
      (record) =>
        record.graduateId === graduateId && record.evidenceType === "Degree"
    )
    .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt))[0];

  if (!graduate || !degreeRecord) return null;

  return {
    graduateId,
    candidateName: graduate.name,
    qualification: degreeRecord.evidenceName,
    institution: state.institutionName,
    verificationStatus: degreeRecord.status,
    trustLabel:
      degreeRecord.status === "Verified" ? "University verified" : null,
  };
}

export function selectVerificationAudit(
  state: UniversityDemoState,
  recordId: string
) {
  return state.verificationAudit
    .filter((entry) => entry.recordId === recordId)
    .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt));
}

function distribution(values: Array<string | undefined>) {
  const counts = new Map<string, number>();
  values.forEach((value) => {
    if (value?.trim()) counts.set(value, (counts.get(value) ?? 0) + 1);
  });
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort(
      (left, right) =>
        right.count - left.count || left.label.localeCompare(right.label)
    );
}

export function selectDashboardProjection(state: UniversityDemoState) {
  const normalizedEmploymentOutcomes = selectNormalizedEmploymentOutcomes(state);
  const metrics = calculateEmploymentMetrics(normalizedEmploymentOutcomes);
  const outcomesByGraduateId = new Map(
    normalizedEmploymentOutcomes.map((outcome) => [outcome.graduateId, outcome])
  );

  return {
    metrics,
    normalizedEmploymentOutcomes,
    pendingVerificationCount: state.verificationRecords.filter(
      (record) => record.status === "Pending"
    ).length,
    verificationQueue: state.verificationRecords.filter(
      (record) => record.status === "Pending" || record.status === "Disputed"
    ),
    outcomeDistribution: outcomeOrder.map((status) => ({
      status,
      count: normalizedEmploymentOutcomes.filter(
        (outcome) => outcome.status === status
      ).length,
    })),
    careersTasks: state.graduates
      .filter((graduate) =>
        ["Seeking", "Unknown"].includes(
          outcomesByGraduateId.get(graduate.id)?.status ?? "Unknown"
        )
      )
      .slice(0, 3)
      .map(({ id, name, nextAction }) => ({ id, name, nextAction })),
    registryTasks: state.graduates
      .filter((graduate) =>
        ["Pending", "Disputed"].includes(
          selectGraduateVerificationStatus(state, graduate.id)
        )
      )
      .slice(0, 3)
      .map(({ id, name, nextAction }) => ({ id, name, nextAction })),
  };
}

export function selectReportProjection(
  state: UniversityDemoState,
  filters: ReportFilters
) {
  const scopedGraduates = state.graduates.filter(
    (graduate) =>
      (filters.graduationYear === "all" ||
        graduate.graduationYear === Number(filters.graduationYear)) &&
      (filters.faculty === "all" || graduate.faculty === filters.faculty) &&
      (filters.programme === "all" || graduate.programme === filters.programme)
  );
  const scopedOutcomes = normalizeEmploymentOutcomes(
    scopedGraduates,
    state.employmentOutcomes
  );
  const employedOutcomes = scopedOutcomes.filter(
    (outcome) => outcome.status === "Employed"
  );
  const metrics = calculateEmploymentMetrics(scopedOutcomes);

  return {
    scopedGraduates,
    scopedOutcomes,
    metrics,
    missingOutcomeCount: scopedGraduates.length - metrics.knownOutcomes,
    roles: distribution(employedOutcomes.map((outcome) => outcome.jobTitle)),
    industries: distribution(
      employedOutcomes.map((outcome) => outcome.industry)
    ),
    employers: distribution(employedOutcomes.map((outcome) => outcome.employer)),
  };
}
