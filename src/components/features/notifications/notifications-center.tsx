"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  Briefcase,
  Check,
  CheckCircle2,
  FileText,
  Filter,
  GraduationCap,
  Search,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  UserPlus,
} from "lucide-react";

import type { NotificationItem, NotificationType } from "@/types/notification";
import { useNotificationReadState } from "@/hooks/use-notification-read-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const typeMeta: Record<
  NotificationType,
  {
    label: string;
    icon: typeof Bell;
    tone: "default" | "secondary" | "outline";
  }
> = {
  application: { label: "Application", icon: Briefcase, tone: "secondary" },
  match: { label: "Match", icon: Sparkles, tone: "default" },
  verification: { label: "Verified", icon: CheckCircle2, tone: "secondary" },
  profile: { label: "Profile", icon: UserCircle2, tone: "outline" },
  system: { label: "System", icon: Bell, tone: "outline" },
  candidate: { label: "Candidate", icon: UserPlus, tone: "default" },
  interview: { label: "Interview", icon: Briefcase, tone: "secondary" },
  offer: { label: "Offer", icon: CheckCircle2, tone: "default" },
  credential: { label: "Credential", icon: ShieldCheck, tone: "secondary" },
  graduate: { label: "Graduate", icon: GraduationCap, tone: "default" },
  dispute: { label: "Dispute", icon: FileText, tone: "outline" },
  report: { label: "Report", icon: FileText, tone: "secondary" },
};

function NotificationRow({
  notification,
  read,
  onToggleRead,
}: {
  notification: NotificationItem;
  read: boolean;
  onToggleRead: () => void;
}) {
  const meta = typeMeta[notification.type];
  const Icon = meta.icon;
  return (
    <li>
      <div
        className={cn(
          "relative flex items-start gap-3 overflow-hidden rounded-lg border p-4 transition-colors",
          !read
            ? "border-highlight/40 bg-highlight-soft/60"
            : "border-border bg-card",
        )}
      >
        {/* Color stripe on the leading edge — semantic cue that this is new */}
        {!read ? (
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-1 bg-highlight"
          />
        ) : null}
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            !read
              ? "bg-highlight text-highlight-foreground"
              : "bg-muted text-muted-foreground",
          )}
          aria-hidden
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                "truncate text-base font-semibold",
                read && "text-muted-foreground",
              )}
            >
              {notification.title}
            </p>
            <Badge variant={meta.tone} className="shrink-0">
              {meta.label}
            </Badge>
            {!read && (
              <Badge variant="default" className="shrink-0">
                New
              </Badge>
            )}
            <span className="ml-auto text-xs text-muted-foreground">
              {notification.timestamp}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {notification.message}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleRead}
              aria-label={read ? "Mark as unread" : "Mark as read"}
            >
              <Check />
              {read ? "Mark unread" : "Mark read"}
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
}

export function NotificationsCenter({
  source,
  heading,
  description,
  storageKey,
}: {
  source: NotificationItem[];
  heading: string;
  description: string;
  /** Per-role storage key — keeps read state isolated and shared with the shell bell. */
  storageKey: string;
}) {
  const { isRead, toggle, markAll, unreadCount } = useNotificationReadState(
    source,
    { storageKey },
  );
  const [tab, setTab] = useState<"all" | "unread" | "read">("all");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    return source.filter((n) => {
      const read = isRead(n);
      if (tab === "unread" && read) return false;
      if (tab === "read" && !read) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [source, isRead, tab, query]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Notifications
          </p>
          <h1 className="text-display">{heading}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 ? (
            <Badge variant="default" className="gap-1">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-highlight-foreground"
              />
              {unreadCount} unread
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3 w-3" aria-hidden />
              All caught up
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={markAll}
            disabled={unreadCount === 0}
          >
            Mark all read
          </Button>
        </div>
      </header>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as typeof tab)}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">
                  Unread
                  {unreadCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 h-4 min-w-4 px-1 text-[10px]"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="read">Read</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-72">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notifications"
                className="pl-9"
                aria-label="Search notifications"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {list.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 p-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Filter className="h-5 w-5 text-muted-foreground" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-medium">No notifications match</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {tab === "unread"
                  ? "You're all caught up."
                  : "Try a different search."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {list.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              read={isRead(n)}
              onToggleRead={() => toggle(n.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}