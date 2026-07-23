import { NotificationsCenter } from "@/components/features/notifications/notifications-center";
import { getUniversityNotifications } from "@/data/notifications";

export default function UniversityNotificationsPage() {
  return (
    <NotificationsCenter
      source={getUniversityNotifications()}
      heading="Notifications"
      description="Credential syncs, dispute activity, graduate updates, and report readiness."
      storageKey="careeros.notifications.university"
    />
  );
}