"use client";

import { useState } from "react";
import { BadgeCheck, Plus, Trash2 } from "lucide-react";

import { useToast } from "@/components/common/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import type { Evidence, VerificationStatus } from "@/types/profile";

type ProfileVerificationCardProps = {
  items: Evidence[];
  onChange: (next: Evidence[]) => void;
};

const STATUS_ORDER: VerificationStatus[] = [
  "Not started",
  "Pending",
  "Verified",
];

function nextStatus(current: VerificationStatus): VerificationStatus {
  const idx = STATUS_ORDER.indexOf(current);
  return STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
}

function statusBadgeVariant(status: VerificationStatus) {
  return status === "Verified" ? "secondary" : "outline";
}

export function ProfileVerificationCard({
  items,
  onChange,
}: ProfileVerificationCardProps) {
  const { push } = useToast();
  const [pendingRemove, setPendingRemove] = useState<Evidence | null>(null);

  function add() {
    const id = `ev-${Date.now()}`;
    onChange([
      ...items,
      { id, name: "New evidence item", type: "Other", status: "Not started" },
    ]);
    push({ title: "Add evidence form opened", tone: "info" });
  }

  function toggleStatus(id: string) {
    onChange(
      items.map((it) =>
        it.id === id ? { ...it, status: nextStatus(it.status) } : it,
      ),
    );
  }

  function requestVerification(item: Evidence) {
    push({
      title: "Verification requested",
      description: item.name,
      tone: "info",
    });
  }

  function remove(id: string) {
    onChange(items.filter((it) => it.id !== id));
    push({
      title: "Evidence removed",
      description: "You can re-add it anytime.",
      tone: "info",
    });
  }

  return (
    <Card id="verification">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>
            <h2>Verification and supporting evidence</h2>
          </CardTitle>
          <CardDescription>
            Click a status badge to cycle through Not started → Pending →
            Verified.
          </CardDescription>
        </div>
        <Button size="sm" onClick={add}>
          <Plus />
          Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <BadgeCheck
                  className="h-5 w-5 text-muted-foreground"
                  aria-hidden
                />
              </div>
              <div>
                <p className="text-sm font-medium">No evidence added</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Issued credentials strengthen your match score.
                </p>
              </div>
              <Button size="sm" onClick={add}>
                <Plus />
                Add evidence
              </Button>
            </CardContent>
          </Card>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="group flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.type}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleStatus(item.id)}
                aria-label={`Status: ${item.status}. Click to change.`}
                className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <Badge
                  variant={statusBadgeVariant(item.status)}
                  className={cn(
                    "cursor-pointer",
                    item.status === "Not started" && "text-muted-foreground",
                  )}
                >
                  {item.status}
                </Badge>
              </button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => requestVerification(item)}
              >
                Request verification
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
                aria-label={`Delete evidence: ${item.name}`}
                onClick={() => setPendingRemove(item)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>

      <ConfirmDialog
        open={pendingRemove !== null}
        onOpenChange={(open) => !open && setPendingRemove(null)}
        title="Remove this evidence?"
        description={
          pendingRemove ? (
            <>
              <strong>{pendingRemove.name}</strong> will be removed from your
              profile. You can add it back later.
            </>
          ) : null
        }
        confirmLabel="Remove evidence"
        destructive
        onConfirm={() => {
          if (pendingRemove) remove(pendingRemove.id);
          setPendingRemove(null);
        }}
      />
    </Card>
  );
}
