import * as React from "react";
import useNotification from "./use_notification";

interface NotificationCounterProps {
  userId: string;
}

const NotificationCounter: React.FC<NotificationCounterProps> = (props) => {
  const { userId } = props;
  const notifications = useNotification(userId);

  return (
    <div>
      <i className="far fa-bell" />
      &nbsp;{notifications.length} Notifications
    </div>
  );
};

export default NotificationCounter;
