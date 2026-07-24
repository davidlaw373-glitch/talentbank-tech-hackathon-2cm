"use client";

import { Edit3, Save, X } from "lucide-react";

import type { UniversityProfile } from "@/types/university";
import { Button } from "@/components/ui/button";

type InstitutionProfileHeaderProps = {
  profile: UniversityProfile;
  editing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
};

export function InstitutionProfileHeader({
  profile,
  editing,
  onEdit,
  onSave,
  onCancel,
}: InstitutionProfileHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-2">
        <p className="text-caption">Institution profile</p>
        <h1 className="text-heading">{profile.institutionName}</h1>
        <p className="text-body text-muted-foreground">{profile.tagline}</p>
      </div>
      {editing ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={onCancel}>
            <X />
            Cancel
          </Button>
          <Button onClick={onSave}>
            <Save />
            Save changes
          </Button>
        </div>
      ) : (
        <Button onClick={onEdit}>
          <Edit3 />
          Edit profile
        </Button>
      )}
    </header>
  );
}
