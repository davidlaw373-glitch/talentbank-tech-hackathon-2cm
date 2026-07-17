"use client";

import { useState } from "react";
import { Check, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/common/toast";

export function ProfileEditToggle() {
  const { push } = useToast();
  const [editing, setEditing] = useState(false);

  const toggle = () => {
    setEditing((prev) => {
      const next = !prev;
      push({
        title: next ? "Edit mode enabled" : "Edit mode disabled",
        description: next
          ? "Edit mode is a demo — changes won't persist."
          : "Reverted to view mode.",
        tone: next ? "info" : "success",
      });
      return next;
    });
  };

  return (
    <Button
      variant={editing ? "default" : "outline"}
      aria-pressed={editing}
      aria-label={editing ? "Exit edit mode" : "Edit company profile"}
      onClick={toggle}
    >
      {editing ? <Check /> : <Pencil />}
      {editing ? "Done editing" : "Edit"}
    </Button>
  );
}
