import { NotificationsCenter } from "@/components/features/notifications/notifications-center";
import { getEmployerNotifications } from "@/data/notifications";

export default function EmployerNotificationsPage() {
  return (
    <NotificationsCenter
      source={getEmployerNotifications()}
      heading="Notifications"
      description="Hiring activity, interview updates, and talent pool alerts for your team."
      storageKey="careeros.notifications.employer"
    />
  );
}