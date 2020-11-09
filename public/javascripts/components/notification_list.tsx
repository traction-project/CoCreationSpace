import * as React from "react";
import { useEffect, useState } from "react";
import { Trans } from "react-i18next";

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

        {notifications.map(({ data: { topic, post }}, i) => {
          return (
            <div className="box" key={i}>
              <h5 className="title is-5">
                <Trans i18nKey="notification-title">
                  New post in topic {{ topicTitle: topic.title }}
                </Trans>
              </h5>
              <p>
                <Trans i18nKey="notification-text">
                  A new post titled <i>{{ postTitle: post.title}}</i> was submitted to the topic <i>{{ topicTitle: topic.title}}</i>
                </Trans>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationList;
