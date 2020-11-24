import * as React from "react";
import { useTranslation } from "react-i18next";
import useNotification from "./use_notification";

interface NotificationCounterProps {
  userId: string;
  hideText?: boolean;
}

const NotificationCounter: React.FC<NotificationCounterProps> = (props) => {
  const { userId, hideText } = props;
  const { t } = useTranslation();
  const notifications = useNotification(userId);

  const unseenNotifications = notifications.filter((n) => {
    return !n.seen;
  });

  return (
    <div>
      {(hideText) || (
        <>
          <i className="far fa-bell" />
          &nbsp;
        </>
      )}
      {unseenNotifications.length} {(hideText) || t("Notification", { count: unseenNotifications.length })}
    </div>
  );
};

export default NotificationCounter;
