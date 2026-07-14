import type { LucideIcon } from "lucide-react";
import {
  Check,
  Circle,
  Clock,
  CalendarClock,
  Send,
  PartyPopper,
} from "lucide-react";

import type { ApplicationStatus, VerificationStatus } from "@/types/candidate";

/**
 * Single source of truth for mapping domain statuses to a Badge variant, a
 * human label, and a supporting icon. Rendering the icon alongside the label
 * keeps status legible without relying on color alone (WCAG color-not-only).
 */
export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "success"
  | "warning"
  | "outline";

export type StatusTone = {
  label: string;
  variant: BadgeVariant;
  icon: LucideIcon;
};

/** Job match score → fit label + tone. Strong fit reads as a positive signal. */
export function matchTone(score: number): { label: string; variant: BadgeVariant } {
  if (score >= 90) return { label: "Strong fit", variant: "success" };
  if (score >= 80) return { label: "Good fit", variant: "secondary" };
  if (score >= 70) return { label: "Possible", variant: "outline" };
  return { label: "Stretch", variant: "outline" };
}

export const APPLICATION_STATUS_TONE: Record<ApplicationStatus, StatusTone> = {
  Submitted: { label: "Submitted", variant: "outline", icon: Send },
  "In review": { label: "In review", variant: "outline", icon: Clock },
  Interview: { label: "Interview", variant: "secondary", icon: CalendarClock },
  Offer: { label: "Offer", variant: "success", icon: PartyPopper },
};

export const VERIFICATION_TONE: Record<VerificationStatus, StatusTone> = {
  Verified: { label: "Verified", variant: "success", icon: Check },
  Pending: { label: "Pending", variant: "warning", icon: Clock },
  "Not started": { label: "Not started", variant: "outline", icon: Circle },
};
