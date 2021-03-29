import * as React from "react";
import { Trans } from "react-i18next";

import { InterestNotificationData } from "./use_notification";

interface InterestNotificationProps {
  data: InterestNotificationData;
}

const InterestNotification: React.FC<InterestNotificationProps> = (props) => {
  const { data: { topic, post } } = props;

  return (
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
  );
};

export default InterestNotification;
