import * as React from "react";
import { Trans } from "react-i18next";

import { PostReplyNotificationData } from "./use_notification";

interface PostReplyNotificationProps {
  data: PostReplyNotificationData;
}

const PostReplyNotification: React.FC<PostReplyNotificationProps> = (props) => {
  const { data: { creator } } = props;

  return (
    <p>
      <strong>
        <Trans i18nKey="notification-reply-title">
          Reply to your post
        </Trans>
      </strong>
      <br />
      <br />
      <Trans i18nKey="notification-reply-body">
        {creator.username} replied to your post.
      </Trans>
    </p>
  );
};

export default PostReplyNotification;
