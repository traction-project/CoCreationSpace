import * as React from "react";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { NotificationData } from "./use_notification";

interface Notification {
  id: string;
  data: NotificationData;
  seen: boolean;
}

interface NotificationListProps {
}

const NotificationList: React.FC<NotificationListProps> = (props) => {
  const { t } = useTranslation();
  const [ notifications, setNotifications ] = useState<Array<Notification>>([]);

  useEffect(() => {
    fetch("/notifications").then((res) => {
      return res.json();
    }).then((data) => {
      setNotifications(data);
    });
  }, []);

  const deleteNotification = (id: string) => {
    return async () => {
      const res = await fetch(`/notifications/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setNotifications(notifications.filter((n) => {
          return n.id != id;
        }));
      }
    };
  };

  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-6-widescreen is-10-tablet">
            <h4 className="title is-4">{t("Notifications")}</h4>

            {notifications.map(({ id, data: { topic, post }}, i) => {
              return (
                <article key={i} className="media">
                  <figure className="media-left">
                    <p className="image is-64x64">
                      <img src="https://bulma.io/images/placeholders/128x128.png" />
                    </p>
                  </figure>
                  <div className="media-content">
                    <div className="content">
                      <p>
                        <strong>
                          <Trans i18nKey="notification-title">
                            New post in topic {{ topicTitle: topic.title }}
                          </Trans>
                        </strong>
                        <br />
                        <br />
                        <Trans i18nKey="notification-text">
                          A new post titled <i>{{ postTitle: post.title}}</i> was submitted to the topic <i>{{ topicTitle: topic.title}}</i>
                        </Trans>
                        <br/>
                        <small>by @johnsmith</small> <small>31m ago</small>
                      </p>
                    </div>
                  </div>
                  <div className="media-right">
                    <button className="delete" onClick={deleteNotification(id)} />
                  </div>
                </article>
              );
            })}

          </div>
        </div>
      </div>
    </section>
  );
};

export default NotificationList;
