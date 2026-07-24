"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * Confirmation dialog using the native <dialog> element (no new dependency).
 *
 * The HTMLDialogElement.showModal() API gives us focus trap and Esc-to-close
 * for free across modern browsers (Chrome 37+, Safari 15.4+, Firefox 98+).
 *
 * Use for destructive actions where one wrong click has real consequences:
 *   - withdraw / reject / close-job / sign-out
 *
 * For high-risk actions (close-job, reject-candidate) pass `requireTyping` to
 * force the user to type a confirmation phrase before the submit button enables.
 */

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  requireTyping?: string;
  /** Optional label for a free-text reason/note field shown above the actions. */
  noteLabel?: string;
  /** Controlled value for the reason/note field. Only rendered when `noteLabel` is set. */
  noteValue?: string;
  onNoteChange?: (value: string) => void;
  /** Require the note to be non-empty before the confirm button enables. */
  noteRequired?: boolean;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive = false,
  requireTyping,
  noteLabel,
  noteValue = "",
  onNoteChange,
  noteRequired = false,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = React.useState("");

  // Sync open state ↔ <dialog> show/close.
  React.useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && !node.open) {
      node.showModal();
    } else if (!open && node.open) {
      node.close();
      setTyped("");
    }
  }, [open]);

  // Handle native <dialog> close (Esc, form method="dialog" submit).
  React.useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    const onClose = () => {
      setTyped("");
      onOpenChange(false);
    };
    node.addEventListener("close", onClose);
    return () => node.removeEventListener("close", onClose);
  }, [onOpenChange]);

  const canConfirm =
    (!requireTyping || typed === requireTyping) &&
    (!noteRequired || noteValue.trim().length > 0);

  const handleConfirm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canConfirm) return;
    onConfirm();
    onOpenChange(false);
  };

  const titleId = React.useId();
  const descId = React.useId();

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className={cn(
        "max-w-md w-full p-6 rounded-lg shadow-xl",
        "bg-popover text-popover-foreground",
        "backdrop:bg-foreground/40 backdrop:backdrop-blur-sm",
        "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
        "border border-border",
      )}
    >
      <form method="dialog" onSubmit={handleConfirm} className="space-y-4">
        <h2 id={titleId} className="text-heading">
          {title}
        </h2>
        <div id={descId} className="text-body text-muted-foreground">
          {description}
        </div>

        {requireTyping && (
          <div className="space-y-1.5">
            <label
              htmlFor={`confirm-${titleId}`}
              className="block text-sm font-medium text-foreground"
            >
              Type{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                {requireTyping}
              </code>{" "}
              to confirm
            </label>
            <Input
              id={`confirm-${titleId}`}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        )}

        {noteLabel && (
          <div className="space-y-1.5">
            <label
              htmlFor={`note-${titleId}`}
              className="block text-sm font-medium text-foreground"
            >
              {noteLabel}
            </label>
            <Textarea
              id={`note-${titleId}`}
              value={noteValue}
              onChange={(e) => onNoteChange?.(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            variant={destructive ? "destructive" : "default"}
            size="default"
            disabled={!canConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </form>
    </dialog>
  );
}