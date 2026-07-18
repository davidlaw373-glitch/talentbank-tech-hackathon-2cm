"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NotificationBellProps = {
  href: string;
  /** Aria label for screen readers (always required for icon-only buttons). */
  label?: string;
  /** Number of unread notifications; pass 0 to render no badge. */
  unreadCount: number;
};

/**
 * The bell button in the top nav. Single source of truth so the unread
 * count, the icon-only button labelling, and the badge geometry stay
 * consistent across all 3 role shells.
 */
export function NotificationBell({
  href,
  label = "View notifications",
  unreadCount,
}: NotificationBellProps) {
  const hasBadge = unreadCount > 0;
  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      aria-label={
        hasBadge ? `${label} (${unreadCount} unread)` : label
      }
    >
      <Link href={href} className="relative">
        <Bell aria-hidden />
        {hasBadge ? (
          <span
            aria-hidden
            className={cn(
              "absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold tabular-nums text-background",
            )}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
