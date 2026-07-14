export type NotificationType = "application" | "match" | "verification" | "profile" | "system";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
};