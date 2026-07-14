import Link from "next/link";
import { Bell, Briefcase, CheckCircle2, Sparkles, UserCircle2 } from "lucide-react";
import { notifications } from "@/data/notifications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeading } from "@/components/common/page-heading";
import type { NotificationType } from "@/types/notification";

const typeMeta: Record<NotificationType, { label: string; icon: typeof Bell }> = {
  application: { label: "Application", icon: Briefcase },
  match: { label: "Job match", icon: Sparkles },
  verification: { label: "Verification", icon: CheckCircle2 },
  profile: { label: "Profile", icon: UserCircle2 },
  system: { label: "System", icon: Bell },
};

export function NotificationsCenter() {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <PageHeading
        title="Notifications"
        description="Stay up to date with application updates, job matches, and account activity."
        action={
          <div className="flex items-center gap-2">
            {unreadCount > 0 ? (
              <Badge variant="secondary">{unreadCount} unread</Badge>
            ) : (
              <Badge variant="outline">All caught up</Badge>
            )}
            <Button asChild variant="outline">
              <Link href="/candidate/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle><h2>Recent activity</h2></CardTitle>
          <CardDescription><p>Your latest CareerOS notifications, newest first.</p></CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {notifications.map((notification, index) => {
              const Meta = typeMeta[notification.type];
              const Icon = Meta.icon;
              return (
                <li key={notification.id}>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full border">
                      <Icon />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3>{notification.title}</h3>
                        <Badge variant="outline">{Meta.label}</Badge>
                        {!notification.read ? <Badge>New</Badge> : null}
                        <small className="ml-auto">{notification.timestamp}</small>
                      </div>
                      <p>{notification.message}</p>
                    </div>
                  </div>
                  {index < notifications.length - 1 ? <Separator className="mt-4" /> : null}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}