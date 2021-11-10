import * as React from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { PostType } from "../post/post";
import UserLogo from "../user_logo";

interface PostEntryProps {
  post: PostType;
}

const PostEntry: React.FC<PostEntryProps> = (props) => {
  const { post } = props;
  const { t } = useTranslation();
  const history = useHistory();

  const navigateTo = (destination: string) => {
    return () => {
      history.push(destination);
    };
  };

  const filterByTag = (tagId: string) => {
    return (e: React.MouseEvent<HTMLSpanElement>) => {
      e.stopPropagation();
      history.push({ search: `?tag=${tagId}` });
    };
  };

  return (
    <article className="media is-clickable post-entry" onClick={navigateTo(`/post/${post.id}`)}>
      <UserLogo user={post.user} hideName />

      <div className="media-content">
        <div className="content">
          <strong className="post-title">{post.title ? post.title : t("Post")}</strong>
          <small className="list-item__date">
            {post.createdAt && new Date(post.createdAt).toLocaleDateString()}&emsp;
            {post.createdAt && new Date(post.createdAt).toLocaleTimeString()}&emsp;
            in <i>{post.thread.topic.userGroup.name}</i> by <i>{post.user.username}</i>
          </small>

          <p className="mt-2">
            <i className="far fa-comment" />&nbsp;
            {post.comments?.length || 0}&nbsp;
            {t("Comment", { count: post.comments?.length || 0 })}
          </p>
        </div>

        <div>
          {post.tags?.map((t, i) => {
            return (
              <span key={i} className="tag is-light" onClick={filterByTag(t.id)}>
                {t.name}
              </span>
            );
          })}
        </div>

        {(post.dataContainer && post.dataContainer.mediaItems && post.dataContainer.mediaItems.length > 0) && (
          <div className="list-item__files">
            {post.dataContainer.mediaItems.map((m, index) => {
              return (
                <div key={index}>
                  <figure className="image is-24x24 list-item__files-item mr-2">
                    <img src={`/images/file-${m.type}-solid.png`} />
                  </figure>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
};

export default PostEntry;
