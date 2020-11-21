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
          <small className="list-item__date">
            {post.createdAt && new Date(post.createdAt).toLocaleDateString()}&emsp;
            {post.createdAt && new Date(post.createdAt).toLocaleTimeString()}
          </small>

          <p className="mt-2">
            {post.dataContainer?.text_content}
          </p>

          <p className="mt-2">
            <i className="far fa-comment" />&nbsp;
            {post.comments?.length || 0}&nbsp;
            {t("Comment", { count: post.comments?.length || 0 })}
          </p>
        </div>
        {(post.dataContainer && post.dataContainer.multimedia && post.dataContainer.multimedia.length > 0) && (
          <div className="list-item__files">
            {post.dataContainer.multimedia.map((m, index) => {
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
