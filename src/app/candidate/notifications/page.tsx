import { NotificationsCenter } from "@/components/features/notifications/notifications-center";
import { getCandidateNotifications } from "@/data/notifications";

export default function CandidateNotificationsPage() {
  return (
    <NotificationsCenter
      source={getCandidateNotifications()}
      heading="Notifications"
      description="Updates about your applications, new job matches, and account activity."
      storageKey="careeros.notifications.candidate"
    />
  );
}