import * as React from "react";
import { Trans } from "react-i18next";

import { PostSubscriberNotificationData } from "./use_notification";

interface PostSubscriberNotificationProps {
  data: PostSubscriberNotificationData;
}

const PostSubscriberNotification: React.FC<PostSubscriberNotificationProps> = (props) => {
  const { data: { creator } } = props;
  const { username } = creator;

  return (
    <p>
      <strong>
        <Trans i18nKey="notification-subscriber-title">
          A user you subscribed to has created a new post
        </Trans>
      </strong>
      <br />
      <br />
      <Trans i18nKey="notification-subscriber-body">
        {{username}} has created a new post.
      </Trans>
    </p>
  );
};

export default PostSubscriberNotification;
