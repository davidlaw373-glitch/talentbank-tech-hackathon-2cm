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
import { VerifiedCredentialList } from "@/components/features/candidate/verified-credential-list";
import type { CredentialView } from "@/components/features/candidate/credential-derivations";
import type { Evidence } from "@/types/profile";

type ProfileVerificationCardProps = {
  /** University-issued, read-only credentials. */
  credentials: CredentialView[];
  /** Candidate-added supporting evidence (editable, never self-verifiable). */
  items: Evidence[];
  onChange: (next: Evidence[]) => void;
};

/**
 * Candidate evidence can only ever be "Not started" or "Pending". Only the
 * university (via the credentials table) can mark something "Verified", so a
 * self-declared "Verified" from legacy data is displayed downgraded.
 */
function candidateStatusLabel(status: Evidence["status"]): string {
  if (status === "Pending") return "Awaiting review";
  if (status === "Verified") return "Confirmation required";
  return "Not started";
}

export function ProfileVerificationCard({
  credentials,
  items,
  onChange,
}: ProfileVerificationCardProps) {
  const { push } = useToast();
  const [pendingRemove, setPendingRemove] = useState<Evidence | null>(null);

  function add() {
    const id = Date.now();
    onChange([
      ...items,
      { id, name: "New evidence item", type: "Other", status: "Not started" },
    ]);
    push({ title: "Add evidence form opened", tone: "info" });
  }

  function requestVerification(item: Evidence) {
    onChange(
      items.map((it) =>
        it.id === item.id ? { ...it, status: "Pending" } : it,
      ),
    );
    push({
      title: "Verification requested",
      description: `${item.name} sent to your university for review.`,
      tone: "info",
    });
  }

  function remove(id: number) {
    onChange(items.filter((it) => it.id !== id));
    push({
      title: "Evidence removed",
      description: "You can re-add it anytime.",
      tone: "info",
    });
  }

  return (
    <div id="verification" className="space-y-4">
      {/* University-issued credentials — read-only, institution-owned. */}
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>University-issued credentials</h2>
          </CardTitle>
          <CardDescription>
            Pushed and verified by your institution. These carry more weight
            with employers than anything self-reported — and only your
            university can change them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VerifiedCredentialList items={credentials} />
        </CardContent>
      </Card>

      {/* Candidate-added supporting evidence — editable, but can only reach
          "Pending" (a review request). It can never be self-verified. */}
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>
              <h2>Supporting evidence you added</h2>
            </CardTitle>
            <CardDescription>
              Request a review to send an item to your university. Verification
              is granted by the institution, not by you.
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
                    Request verification to strengthen your match score.
                  </p>
                </div>
                <Button size="sm" onClick={add}>
                  <Plus />
                  Add evidence
                </Button>
              </CardContent>
            </Card>
          ) : (
            items.map((item) => {
              const pending = item.status === "Pending";
              return (
                <div
                  key={item.id}
                  className="group flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                  </div>
                  <Badge variant="outline" className="text-muted-foreground">
                    {candidateStatusLabel(item.status)}
                  </Badge>
                  {pending ? (
                    <span className="text-xs text-muted-foreground">
                      With your university
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => requestVerification(item)}
                    >
                      Request verification
                    </Button>
                  )}
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
              );
            })
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
