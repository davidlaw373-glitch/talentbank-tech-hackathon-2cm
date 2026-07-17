import { NotificationsCenter } from "@/components/features/notifications/notifications-center";
import { universityNotifications } from "@/data/notifications";

export default function UniversityNotificationsPage() {
  return (
    <NotificationsCenter
      source={universityNotifications}
      heading="Notifications"
      description="Credential syncs, dispute activity, graduate updates, and report readiness."
    />
  );
}