"use client";

import { useState } from "react";

import { universityProfile as seedProfile } from "@/data/university";
import type { UniversityProfile } from "@/types/university";
import { useToast } from "@/components/common/toast";
import { InstitutionProfileHeader } from "./institution-profile-header";
import { InstitutionProfileStats } from "./institution-profile-stats";
import { InstitutionProfileBasics } from "./institution-profile-basics";
import { InstitutionProfilePrograms } from "./institution-profile-programs";

export function InstitutionProfile() {
  const { push } = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UniversityProfile>(seedProfile);
  const [saved, setSaved] = useState<UniversityProfile>(seedProfile);

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
