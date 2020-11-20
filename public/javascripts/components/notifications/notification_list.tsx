import * as React from "react";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import classNames from "classnames";

import { Notification } from "./use_notification";

interface NotificationListProps {
}

const NotificationList: React.FC<NotificationListProps> = (props) => {
  const history = useHistory();
  const { t } = useTranslation();
  const [ notifications, setNotifications ] = useState<Array<Notification>>([]);

  useEffect(() => {
    fetch("/notifications").then((res) => {
      return res.json();
    }).then((data) => {
      setNotifications(data.map((notification: any) => {
        return {
          ...notification,
          createdAt: new Date(notification.createdAt)
        };
      }));
    });
  }, []);

  const deleteNotification = (id: string) => {
    return async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

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

  const markSeenAndGoToPost = (notificationId: string, postId: string) => {
    return async () => {
      const res = await fetch(`/notifications/${notificationId}/seen`, {
        method: "POST"
      });

      if (res.ok) {
        const res = await fetch(`/posts/id/${postId}/parent`);
        const data = await res.json();

        history.push(`/post/${data.id}`);
      }
    };
  };

  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-6-widescreen is-10-tablet">
            <h4 className="title is-4">{t("Notifications")}</h4>

            {notifications.map(({ id, data: { topic, post, creator }, createdAt, seen }, i) => {
              return (
                <article key={i} className={classNames("media", "is-clickable", "p-4", { "is-highlighted": !seen })} onClick={markSeenAndGoToPost(id, post.id)}>
                  <figure className="media-left">
                    <p className="image is-64x64">
                      <img src={creator.image} />
                    </p>
                  </figure>
                  <div className="media-content">
                    <div className="content">
                      <p>
                        <strong>
                          {(post.title != null) ? (
                            <Trans i18nKey="notification-title">
                              New post in topic {{ topicTitle: topic.title }}
                            </Trans>
                          ) : (
                            <Trans i18nKey="notification-comment">
                              New comment in topic {{ topicTitle: topic.title }}
                            </Trans>
                          )}
                        </strong>
                        <br />
                        <br />
                        {(post.title != null) ? (
                          <Trans i18nKey="notification-text">
                            A new post titled <i>{{ postTitle: post.title}}</i> was submitted to the topic <i>{{ topicTitle: topic.title}}</i>
                          </Trans>
                        ) : (
                          <Trans i18nKey="notification-text-comment">
                            A new comment was submitted to the topic <i>{{ topicTitle: topic.title}}</i>
                          </Trans>
                        )}
                      </p>
                      <p className="mt-2">
                        <small>{creator.username}</small>&emsp;<small>{createdAt.toLocaleDateString()} {createdAt.toLocaleTimeString()}</small>
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
