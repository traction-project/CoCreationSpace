import * as React from "react";
import { useTranslation } from "react-i18next";
import useNotification from "./use_notification";

interface NotificationCounterProps {
  userId: string;
}

const NotificationCounter: React.FC<NotificationCounterProps> = (props) => {
  const { userId } = props;
  const { t } = useTranslation();
  const notifications = useNotification(userId);

  const unseenNotifications = notifications.filter((n) => {
    return !n.seen;
  });

  return (
    <div>
      <i className="far fa-bell" />&nbsp;
      {unseenNotifications.length} {t("Notification", { count: unseenNotifications.length })}
    </div>
  );
};

export default NotificationCounter;
