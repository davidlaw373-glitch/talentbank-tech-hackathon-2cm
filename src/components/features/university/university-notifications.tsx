"use client";

import { useState } from "react";
import { BellRing, Check, CheckCheck, Inbox } from "lucide-react";

import { universityNotifications } from "@/data/university";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UniversityNotification } from "@/types/university";

type NotificationCategory = UniversityNotification["category"];
type NotificationFilter = "All" | "Unread" | NotificationCategory;

const categories: NotificationCategory[] = [
  "Verification",
  "Dispute",
  "Employment",
  "Import",
  "Demand",
];
const notificationFilters: NotificationFilter[] = ["All", "Unread", ...categories];

const categoryTone: Record<
  NotificationCategory,
  "default" | "secondary" | "outline"
> = {
  Verification: "secondary",
  Dispute: "outline",
  Employment: "default",
  Import: "outline",
  Demand: "secondary",
};

export function UniversityNotifications() {
  const [readState, setReadState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      universityNotifications.map((notification) => [
        notification.id,
        notification.read,
      ])
    )
  );
  const [filter, setFilter] = useState<NotificationFilter>("All");

  const unreadCount = universityNotifications.filter(
    (notification) => !(readState[notification.id] ?? notification.read)
  ).length;

  function markAllRead() {
    setReadState(
      Object.fromEntries(
        universityNotifications.map((notification) => [notification.id, true])
      )
    );
  }

  function markRead(id: string) {
    setReadState((current) => ({ ...current, [id]: true }));
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Notification center
          </p>
          <h1>Keep university work moving</h1>
          <p className="max-w-2xl text-muted-foreground">
            Review verification, dispute, employment, import, and employer
            demand updates in one focused queue.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={markAllRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck aria-hidden />
          Mark all read
        </Button>
      </section>

      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as NotificationFilter)}
      >
        <Card>
          <CardContent className="p-4 sm:p-5">
            <TabsList
              className="flex h-auto w-full flex-wrap justify-start gap-1"
              aria-label="Filter notifications"
            >
              <TabsTrigger value="All">All</TabsTrigger>
              <TabsTrigger value="Unread">
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
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </CardContent>
        </Card>

        {notificationFilters.map((notificationFilter) => (
          <TabsContent key={notificationFilter} value={notificationFilter}>
            <NotificationList
              notifications={filterNotifications(notificationFilter, readState)}
              readState={readState}
              onMarkRead={markRead}
              onShowAll={() => setFilter("All")}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function filterNotifications(
  filter: NotificationFilter,
  readState: Record<string, boolean>
) {
  return universityNotifications.filter((notification) => {
    const read = readState[notification.id] ?? notification.read;

    if (filter === "Unread") return !read;
    if (filter === "All") return true;
    return notification.category === filter;
  });
}

function NotificationList({
  notifications,
  readState,
  onMarkRead,
  onShowAll,
}: {
  notifications: UniversityNotification[];
  readState: Record<string, boolean>;
  onMarkRead: (id: string) => void;
  onShowAll: () => void;
}) {
  return (
    <section className="space-y-3" aria-label="University notifications">
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center sm:p-12">
            <Inbox
              className="mx-auto h-5 w-5 text-muted-foreground"
              aria-hidden
            />
            <p className="mt-3 text-sm font-medium">
              No notifications match this filter
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your queue is clear for this view.
            </p>
            <Button
              className="mt-4"
              variant="outline"
              size="sm"
              onClick={onShowAll}
            >
              Show all notifications
            </Button>
          </CardContent>
        </Card>
      ) : (
        notifications.map((notification) => {
          const read = readState[notification.id] ?? notification.read;

          return (
            <Card
              key={notification.id}
              className={read ? "" : "border-foreground/20"}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <BellRing className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{notification.title}</p>
                      <Badge variant={categoryTone[notification.category]}>
                        {notification.category}
                      </Badge>
                      {!read && <Badge>New</Badge>}
                      <time
                        className="w-full text-xs text-muted-foreground sm:ml-auto sm:w-auto"
                        dateTime={notification.timestamp}
                      >
                        {new Intl.DateTimeFormat("en-MY", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          timeZone: "Asia/Kuala_Lumpur",
                        }).format(new Date(notification.timestamp))}
                      </time>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    {!read && (
                      <Button
                        className="mt-4"
                        variant="outline"
                        size="sm"
                        onClick={() => onMarkRead(notification.id)}
                      >
                        <Check aria-hidden />
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </section>
  );
}
