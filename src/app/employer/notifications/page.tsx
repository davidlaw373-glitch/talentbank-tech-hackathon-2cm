import { NotificationsCenter } from "@/components/features/notifications/notifications-center";
import { employerNotifications } from "@/data/notifications";

export default function EmployerNotificationsPage() {
  return (
    <NotificationsCenter
      source={employerNotifications}
      heading="Notifications"
      description="Hiring activity, interview updates, and talent pool alerts for your team."
      storageKey="careeros.notifications.employer"
    />
  );
}