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

  return (
    <article className="media is-clickable" onClick={navigateTo(`/post/${post.id}`)}>
      <UserLogo user={post.user} />

      <div className="media-content">
        <div className="content">
          <strong className="post-title">{post.title ? post.title : t("Post")}</strong>
          <small className="list-item__date">{post.createdAt && new Date(post.createdAt).toLocaleDateString()}</small>

          <p className="mt-4">
            <i className="far fa-comment" />&nbsp;
            {(post.comments && post.comments.length > 0) ? post.comments.length : 0}&nbsp;
            {(post.comments && post.comments.length == 1) ? t("Comment") : t("Comments") }
          </p>
        </div>
        {(post.dataContainer && post.dataContainer.multimedia && post.dataContainer.multimedia.length > 0) && (
          <div className="list-item__files">
            {post.dataContainer.multimedia.map((_, index) => {
              return (
                <div key={index}>
                  <figure className="image is-24x24 list-item__files-item">
                    <img src="/images/docs.png" />
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
