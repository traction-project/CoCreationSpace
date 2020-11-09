import * as React from "react";
import { useEffect, useState } from "react";

import { NotificationData } from "./use_notification";

interface Notification {
  data: NotificationData,
  seen: boolean;
}

interface NotificationListProps {
}

const NotificationList: React.FC<NotificationListProps> = (props) => {
  const [ notifications, setNotifications ] = useState<Array<Notification>>([]);

  useEffect(() => {
    fetch("/notifications").then((res) => {
      return res.json();
    }).then((data) => {
      setNotifications(data);
    });
  }, []);

  return (
    <div className="columns" style={{ marginTop: 15 }}>
      <div className="column is-6 is-offset-3">
        <h3 className="title is-3">Notifications</h3>

        {notifications.map((notification, i) => {
          return (
            <div className="box" key={i}>
              <h5 className="title is-5">
                New post in topic {notification.data.topic.title}
              </h5>
              <p>
                A new post titled <i>{notification.data.post.title}</i> was submitted to the topic <i>{notification.data.topic.title}</i>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationList;
