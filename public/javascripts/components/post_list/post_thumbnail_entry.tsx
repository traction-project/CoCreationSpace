import * as React from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { PostType } from "../post/post";
import UserLogo from "../user_logo";
import Thumbnail from "../thumbnail";

interface PostThumbnailEntryProps {
  post: PostType;
}

const PostThumbnailEntry: React.FC<PostThumbnailEntryProps> = (props) => {
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

          <div className="m-4" style={{ display: "flex", flexWrap: "wrap" }}>
            {(post.dataContainer?.multimedia && post.dataContainer.multimedia.length > 0) && (
              post.dataContainer.multimedia.map(({ id, type }) => {
                return (
                  <Thumbnail key={id} id={id} type={type} />
                );
              })
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostThumbnailEntry;