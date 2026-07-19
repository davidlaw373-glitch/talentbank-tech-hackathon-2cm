"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BellRing, Check, CheckCheck, Filter, Search } from "lucide-react";
import { employerNotificationItems, type EmployerNotification } from "@/data/employer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categoryTone: Record<EmployerNotification["category"], "default" | "secondary" | "outline"> = {
  Application: "secondary",
  Interview: "default",
  Offer: "default",
  Talent: "outline",
};

export function EmployerNotificationsCenter() {
  const [readState, setReadState] = useState<Record<string, boolean>>(() => Object.fromEntries(employerNotificationItems.map((item) => [item.id, item.read])));
  const [tab, setTab] = useState<"all" | "unread" | "read">("all");
  const [query, setQuery] = useState("");

  const unreadCount = employerNotificationItems.filter((item) => !(readState[item.id] ?? item.read)).length;
  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return employerNotificationItems.filter((item) => {
      const read = readState[item.id] ?? item.read;
      return (tab === "all" || (tab === "read" ? read : !read)) && (!normalized || `${item.title} ${item.message}`.toLowerCase().includes(normalized));
    });
  }, [query, readState, tab]);

  function markAllRead() { setReadState(Object.fromEntries(employerNotificationItems.map((item) => [item.id, true]))); }

  return <div className="space-y-8">
    <section className="flex flex-wrap items-start justify-between gap-4"><div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Notification center</p><h1>Stay ahead of every next step</h1><p className="max-w-2xl text-muted-foreground">A focused queue for new applications, interviews, offer decisions, and people to reconnect with.</p></div><Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0}><CheckCheck />Mark all read</Button></section>

    <Card><CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}><TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="unread">Unread{unreadCount > 0 && <Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 text-[10px]">{unreadCount}</Badge>}</TabsTrigger><TabsTrigger value="read">Read</TabsTrigger></TabsList></Tabs><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notifications" aria-label="Search notifications" /></div></CardContent></Card>

    <section className="space-y-3" aria-label="Notifications">{visibleItems.length === 0 ? <Card><CardContent className="p-12 text-center"><Filter className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden /><p className="mt-3 text-sm font-medium">No notifications match</p><p className="mt-1 text-xs text-muted-foreground">Try another filter or search.</p></CardContent></Card> : visibleItems.map((item) => {
      const read = readState[item.id] ?? item.read;
      return <Card key={item.id} className={read ? "" : "border-foreground/20"}><CardContent className="p-5"><div className="flex items-start gap-3"><div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted"><BellRing className="h-4 w-4" aria-hidden /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium">{item.title}</p><Badge variant={categoryTone[item.category]}>{item.category}</Badge>{!read && <Badge variant="default">New</Badge>}<span className="ml-auto text-xs text-muted-foreground">{item.timestamp}</span></div><p className="mt-1 text-sm text-muted-foreground">{item.message}</p><div className="mt-4 flex flex-wrap gap-2"><Button asChild size="sm"><Link href={item.href}>Open task</Link></Button><Button variant="outline" size="sm" onClick={() => setReadState((current) => ({ ...current, [item.id]: !read }))}><Check />{read ? "Mark unread" : "Mark read"}</Button></div></div></div></CardContent></Card>;
    })}</section>
  </div>;
}
