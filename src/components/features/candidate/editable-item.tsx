"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

/**
 * Frame around an item that exposes Edit / Remove controls on hover/focus.
 * Owns its own ConfirmDialog state — the parent passes plain-language
 * copy via `confirmDialog` so the same component works for experience,
 * education, and project lists.
 */

type ConfirmCopy = {
  title: string;
  description?: React.ReactNode;
};

type EditableItemProps = {
  label: string;
  onEdit: () => void;
  onDelete: () => void;
  confirmDialog: ConfirmCopy;
  children: React.ReactNode;
};

export function EditableItem({
  label,
  onEdit,
  onDelete,
  confirmDialog,
  children,
}: EditableItemProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <div className="group relative rounded-lg border bg-card p-4">
      <div
        role="group"
        aria-label={`Actions for ${label}`}
        className="mb-3 flex items-center justify-end gap-2 sm:absolute sm:right-3 sm:top-3 sm:mb-0 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
      >
        <Button
          size="sm"
          variant="outline"
          onClick={onEdit}
          className="h-9 gap-1.5 px-3 text-sm"
          aria-label={`Edit ${label}`}
        >
          <Pencil className="h-3 w-3" aria-hidden />
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setConfirmOpen(true)}
          className="h-9 gap-1.5 px-3 text-sm text-destructive hover:bg-destructive/10"
          aria-label={`Remove ${label}`}
        >
          <Trash2 className="h-3 w-3" aria-hidden />
          Remove
        </Button>
      </div>
      <div className="sm:pr-32">{children}</div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete();
        }}
      />
    </div>
  );
}
