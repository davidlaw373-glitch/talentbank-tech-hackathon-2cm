"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";

import { useToast } from "@/components/common/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DisputeStatus, UniversityDispute } from "@/types/university";

const DISPUTE_VARIANT: Record<
  DisputeStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Open: "destructive",
  "In review": "secondary",
  Resolved: "outline",
  Rejected: "outline",
};

export function DashboardBulkSyncButton() {
  const { push } = useToast();

  return (
    <Button
      onClick={() =>
        push({
          title: "Sync started — we'll email you when complete",
          description: "Graduate records are being refreshed in the background.",
          tone: "success",
        })
      }
    >
      <RefreshCw aria-hidden />
      Bulk sync
    </Button>
  );
}

export function RecentDisputeRow({
  dispute,
}: {
  dispute: UniversityDispute;
}) {
  return (
    <li>
      <Link
        href="/university/disputes"
        className="flex flex-wrap items-center justify-between gap-3 p-4"
        aria-label={`Open disputes and review ${dispute.graduateName}`}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
            {dispute.graduateInitials}
          </span>
          <div className="space-y-0.5">
            <p>{dispute.graduateName}</p>
            <p className="text-muted-foreground">
              {dispute.field} · {dispute.filedDate}
            </p>
          </div>
        </div>
        <Badge variant={DISPUTE_VARIANT[dispute.status]}>
          {dispute.status}
        </Badge>
      </Link>
    </li>
  );
}
