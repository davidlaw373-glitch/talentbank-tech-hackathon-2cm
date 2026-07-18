"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Briefcase,
  Check,
  CheckCircle2,
  Filter,
  Search,
  Sparkles,
  UserCircle2,
} from "lucide-react";

import { notifications } from "@/data/notifications";
import type { NotificationItem, NotificationType } from "@/types/notification";
import { EmptyState } from "@/components/common/empty-state";
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
  { label: string; icon: typeof Bell; tone: "default" | "secondary" | "outline" }
> = {
  application: { label: "Application", icon: Briefcase, tone: "secondary" },
  match: { label: "Job match", icon: Sparkles, tone: "default" },
  verification: { label: "Verification", icon: CheckCircle2, tone: "secondary" },
  profile: { label: "Profile", icon: UserCircle2, tone: "outline" },
  system: { label: "System", icon: Bell, tone: "outline" },
};

function NotificationRow({
  notification,
  read,
  onOpen,
  onToggleRead,
}: {
  notification: NotificationItem;
  read: boolean;
  onOpen: () => void;
  onToggleRead: () => void;
}) {
  const Meta = typeMeta[notification.type];
  const Icon = Meta.icon;
  return (
    <li>
      <Link
        href={notification.href}
        onClick={onOpen}
        className={cn(
          "group flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          !read && "border-primary/30 bg-primary/5"
        )}
      >
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            !read
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
          aria-hidden
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                "truncate text-sm font-medium",
                read && "text-muted-foreground"
              )}
            >
              {notification.title}
            </p>
            <Badge variant={Meta.tone} className="shrink-0">
              {Meta.label}
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
        </div>
        <div className="flex shrink-0 items-center gap-1 self-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleRead();
            }}
            aria-label={read ? "Mark as unread" : "Mark as read"}
            className="h-8 w-8 text-muted-foreground"
          >
            <Check aria-hidden />
          </Button>
          <ArrowRight
            className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground"
            aria-hidden
          />
        </div>
      </Link>
    </li>
  );
}

export function NotificationsCenter() {
  const [readState, setReadState] = useState<Record<string, boolean>>(
    Object.fromEntries(notifications.map((n) => [n.id, n.read]))
  );
  const [tab, setTab] = useState<"all" | "unread" | "read">("all");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    return notifications.filter((n) => {
      const isRead = readState[n.id] ?? n.read;
      if (tab === "unread" && isRead) return false;
      if (tab === "read" && !isRead) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [readState, tab, query]);

  const unreadCount = useMemo(
    () =>
      notifications.filter((n) => !(readState[n.id] ?? n.read)).length,
    [readState]
  );

  const markAll = () => {
    const next = { ...readState };
    for (const n of notifications) next[n.id] = true;
    setReadState(next);
  };

  const toggle = (id: string) => {
    setReadState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const markRead = (id: string) => {
    setReadState((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Notifications
          </p>
          <h1>Notifications</h1>
          <p className="text-muted-foreground">
            Updates about your applications, new job matches, and account
            activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 ? (
            <Badge variant="secondary">{unreadCount} unread</Badge>
          ) : (
            <Badge variant="outline">All caught up</Badge>
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

      {/* Filters */}
      <Card>
        <CardContent className="p-5">
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
                      className="ml-1 h-4 min-w-4 px-1 text-[11px]"
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

      {/* List */}
      {list.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No notifications match"
          description={
            tab === "unread" ? "You're all caught up." : "Try a different search."
          }
        />
      ) : (
        <ul className="space-y-3">
          {list.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              read={readState[n.id] ?? n.read}
              onOpen={() => markRead(n.id)}
              onToggleRead={() => toggle(n.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
