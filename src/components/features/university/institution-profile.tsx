"use client";

import { useEffect, useRef, useState } from "react";

import { universityProfile as seedProfile } from "@/lib/university-helpers";
import { onboardingStorageKey } from "@/lib/onboarding-store";
import type { UniversityProfile } from "@/types/university";
import type { UniversityDraft } from "@/types/onboarding";
import { useToast } from "@/components/common/toast";
import { InstitutionProfileHeader } from "./institution-profile-header";
import { InstitutionProfileStats } from "./institution-profile-stats";
import { InstitutionProfileBasics } from "./institution-profile-basics";
import { InstitutionProfilePrograms } from "./institution-profile-programs";

/**
 * Reconcile a partial persisted draft with the canonical shape. Older
 * versions of the wizard (or someone mid-flow that errored out) can leave
 * fields missing or the wrong type in localStorage; defensive defaults
 * keep `applyUniversityOverlay` from dereferencing `undefined`.
 */
function normalizeUniversityDraft(value: unknown): UniversityDraft {
  const candidate = (value ?? {}) as Partial<UniversityDraft>;
  return {
    institutionName: candidate.institutionName ?? "",
    type: candidate.type === "Private" ? "Private" : "Public",
    city: candidate.city ?? "",
    country: candidate.country ?? "",
    founded: candidate.founded ?? "",
    tagline: candidate.tagline ?? "",
    about: candidate.about ?? "",
    topPrograms: Array.isArray(candidate.topPrograms) ? candidate.topPrograms : [],
    activeCohorts: candidate.activeCohorts ?? "",
    totalStudents: candidate.totalStudents ?? "",
    credentialTypes: Array.isArray(candidate.credentialTypes)
      ? candidate.credentialTypes
      : [],
    verificationTurnaround: candidate.verificationTurnaround ?? "",
  };
}

function isEmptyUniversityDraft(draft: UniversityDraft): boolean {
  return (
    draft.institutionName === "" &&
    draft.city === "" &&
    draft.country === "" &&
    draft.founded === "" &&
    draft.tagline === "" &&
    draft.about === "" &&
    draft.topPrograms.length === 0 &&
    draft.activeCohorts === "" &&
    draft.totalStudents === "" &&
    draft.credentialTypes.length === 0 &&
    draft.verificationTurnaround === ""
  );
}

function readPersistedUniversityDraft(): UniversityDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(onboardingStorageKey("university"));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      parsed.version !== 1 ||
      !parsed.draft
    ) {
      return null;
    }
    const draft = normalizeUniversityDraft(parsed.draft);
    if (isEmptyUniversityDraft(draft)) return null;
    return draft;
  } catch {
    return null;
  }
}

function applyUniversityOverlay(
  seed: UniversityProfile,
  draft: UniversityDraft,
): UniversityProfile {
  const merged: UniversityProfile = { ...seed };
  if (draft.institutionName) merged.institutionName = draft.institutionName;
  if (draft.type) merged.type = draft.type;
  if (draft.city) merged.city = draft.city;
  if (draft.country) merged.country = draft.country;
  const foundedNum = Number(draft.founded);
  if (draft.founded && Number.isFinite(foundedNum) && foundedNum > 0) {
    merged.founded = foundedNum;
  }
  if (draft.tagline) merged.tagline = draft.tagline;
  if (draft.about) merged.about = draft.about;
  if (draft.topPrograms.length > 0) merged.topPrograms = draft.topPrograms;
  const cohortsNum = Number(draft.activeCohorts);
  if (draft.activeCohorts && Number.isFinite(cohortsNum) && cohortsNum > 0) {
    merged.activeCohorts = cohortsNum;
  }
  const studentsNum = Number(draft.totalStudents);
  if (draft.totalStudents && Number.isFinite(studentsNum) && studentsNum >= 0) {
    merged.totalStudents = studentsNum;
  }
  return merged;
}

export function InstitutionProfile() {
  const { push } = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UniversityProfile>(seedProfile);
  const [saved, setSaved] = useState<UniversityProfile>(seedProfile);

  // One-time overlay of any persisted onboarding draft after mount.
  // Deferred to a timer so the initial paint is stable before the overlay
  // merges in.
  const overlayAppliedRef = useRef(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (overlayAppliedRef.current) return;
      overlayAppliedRef.current = true;
      const persisted = readPersistedUniversityDraft();
      if (!persisted) return;
      const merged = applyUniversityOverlay(seedProfile, persisted);
      setDraft(merged);
      setSaved(merged);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const setField = <K extends keyof UniversityProfile>(
    key: K,
    value: UniversityProfile[K],
  ) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const save = () => {
    setSaved(draft);
    setEditing(false);
    push({
      title: "Institution profile updated",
      description: `${draft.institutionName} · changes visible to employer partners.`,
      tone: "success",
    });
  };

  const cancel = () => {
    setDraft(saved);
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <InstitutionProfileHeader
        profile={saved}
        editing={editing}
        onEdit={() => setEditing(true)}
        onSave={save}
        onCancel={cancel}
      />

      <InstitutionProfileStats profile={saved} />

      <InstitutionProfileBasics
        draft={draft}
        saved={saved}
        editing={editing}
        onChange={setField}
      />

      <InstitutionProfilePrograms
        programs={saved.topPrograms}
        editing={editing}
        onAddProgram={(value) =>
          setDraft((d) => ({
            ...d,
            topPrograms: [...d.topPrograms, value],
          }))
        }
        onRemoveProgram={(value) =>
          setDraft((d) => ({
            ...d,
            topPrograms: d.topPrograms.filter((p) => p !== value),
          }))
        }
        onSavePrograms={() =>
          setSaved((s) => ({ ...s, topPrograms: draft.topPrograms }))
        }
      />
    </div>
  );
}
