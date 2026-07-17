"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  CircleCheck,
  Clock,
  Eye,
  Send,
  Undo2,
  Wallet,
} from "lucide-react";

import { employerOffers } from "@/data/employer";
import type { EmployerOffer, OfferDecision } from "@/types/employer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeading } from "@/components/common/page-heading";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/components/common/toast";

type TabValue = "Pending" | "Accepted" | "Declined" | "Expired";

const TABS: Array<{ value: TabValue; label: string }> = [
  { value: "Pending", label: "Pending" },
  { value: "Accepted", label: "Accepted" },
  { value: "Declined", label: "Declined" },
  { value: "Expired", label: "Expired" },
];

function decisionVariant(decision: OfferDecision) {
  switch (decision) {
    case "Pending":
      return "outline" as const;
    case "Accepted":
      return "default" as const;
    case "Declined":
      return "destructive" as const;
    case "Expired":
      return "secondary" as const;
  }
}

export default function EmployerOffersPage() {
  const { push } = useToast();
  const [offers, setOffers] = useState<EmployerOffer[]>(employerOffers);
  const [tab, setTab] = useState<TabValue>("Pending");

  const counts = useMemo(() => {
    return {
      Pending: offers.filter((o) => o.decision === "Pending").length,
      Accepted: offers.filter((o) => o.decision === "Accepted").length,
      Declined: offers.filter((o) => o.decision === "Declined").length,
      Expired: offers.filter((o) => o.decision === "Expired").length,
    };
  }, [offers]);

  const visible: EmployerOffer[] = offers.filter(
    (o) => o.decision === tab,
  );

  const onSendOffer = () => {
    push({
      title: "New offer composer opened",
      description: "Pick a candidate and draft terms to send.",
      tone: "info",
    });
  };

  const onSend = (offer: EmployerOffer) => {
    push({
      title: `Re-sent offer to ${offer.candidateName}`,
      description: `Subject line refreshed, copy preserved for ${offer.role}.`,
      tone: "success",
    });
  };

  const onRemind = (offer: EmployerOffer) => {
    push({
      title: `Reminder sent to ${offer.candidateName}`,
      description: "A nudge email will land in their inbox shortly.",
      tone: "success",
    });
  };

  const onWithdrawPending = (offer: EmployerOffer) => {
    setOffers((prev) => prev.filter((o) => o.id !== offer.id));
    push({
      title: `Withdrew offer to ${offer.candidateName}`,
      description: "Removed from the active pipeline.",
      tone: "info",
    });
  };

  const onWithdrawDeclined = (offer: EmployerOffer) => {
    push({
      title: `Withdrew declined offer to ${offer.candidateName}`,
      description: "Closing the record for this candidate.",
      tone: "info",
    });
  };

  const onView = (offer: EmployerOffer) => {
    push({
      title: `Opening ${offer.candidateName} offer`,
      description: `${offer.role} · ${offer.baseSalary} · start ${offer.startDate}`,
      tone: "info",
    });
  };

  return (
    <div className="space-y-8">
      <PageHeading
        title="Offer & rejection management"
        description="Track every offer out the door — sent, signed, declined, or expired."
        action={
          <Button onClick={onSendOffer}>
            <Send />
            Send offer
          </Button>
        }
      />

      {/* Summary tiles */}
      <section
        aria-label="Offer decision counts"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {[
          { label: "Pending", value: counts.Pending, icon: Clock },
          { label: "Accepted", value: counts.Accepted, icon: CircleCheck },
          { label: "Declined", value: counts.Declined, icon: CircleCheck },
          { label: "Expired", value: counts.Expired, icon: Clock },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-5">
                <span
                  aria-hidden
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-3xl font-semibold tracking-tight tabular-nums">
                    {s.value}
                  </p>
                  <p className="text-sm font-medium">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
        <TabsList aria-label="Filter offers by decision">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
              <span className="ml-2 text-xs text-muted-foreground tabular-nums">
                {counts[t.value]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>
                  {tab} · {visible.length} offer
                  {visible.length === 1 ? "" : "s"}
                </h2>
              </CardTitle>
              <CardDescription>
                What candidates need from you next, in one place.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <span
                    aria-hidden
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"
                  >
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      No {tab.toLowerCase()} offers right now
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Switch tabs or send a new offer to see it here.
                    </p>
                  </div>
                </div>
              ) : (
                <ul className="divide-y">
                  {visible.map((offer) => (
                    <OfferRow
                      key={offer.id}
                      offer={offer}
                      onSend={() => onSend(offer)}
                      onRemind={() => onRemind(offer)}
                      onWithdraw={() =>
                        offer.decision === "Pending"
                          ? onWithdrawPending(offer)
                          : onWithdrawDeclined(offer)
                      }
                      onView={() => onView(offer)}
                    />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OfferRow({
  offer,
  onSend,
  onRemind,
  onWithdraw,
  onView,
}: {
  offer: EmployerOffer;
  onSend: () => void;
  onRemind: () => void;
  onWithdraw: () => void;
  onView: () => void;
}) {
  return (
    <li
      className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold"
        >
          {offer.candidateInitials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {offer.candidateName}
          </p>
          <small className="block truncate text-muted-foreground">
            {offer.role} · {offer.baseSalary}
          </small>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge variant="outline">Start: {offer.startDate}</Badge>
            <Badge variant="secondary">
              Sent: {offer.sentDate}
            </Badge>
            <Badge variant="outline">{offer.matchScore}% match</Badge>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Badge variant={decisionVariant(offer.decision)}>
          {offer.decision}
        </Badge>
        <div className="flex flex-wrap items-center gap-2">
          {offer.decision === "Pending" ? (
            <>
              <Button variant="default" size="sm" onClick={onSend}>
                <Send />
                Send
              </Button>
              <Button variant="outline" size="sm" onClick={onRemind}>
                <Bell />
                Remind
              </Button>
              <Button variant="destructive" size="sm" onClick={onWithdraw}>
                <Undo2 />
                Withdraw
              </Button>
            </>
          ) : null}
          {offer.decision === "Accepted" ? (
            <Button variant="outline" size="sm" onClick={onView}>
              <Eye />
              View
            </Button>
          ) : null}
          {offer.decision === "Declined" ? (
            <Button variant="outline" size="sm" onClick={onWithdraw}>
              <Undo2 />
              Withdraw
            </Button>
          ) : null}
          {offer.decision === "Expired" ? (
            <Button variant="ghost" size="sm" onClick={onView}>
              <Eye />
              View
            </Button>
          ) : null}
        </div>
      </div>
    </li>
  );
}
