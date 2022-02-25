import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { PostType } from "../post/post";
import UserLogo from "../user_logo";
import FavouriteToggle from "../post/favourite_toggle";

interface PostEntryProps {
  post: PostType;
}

const PostEntry: React.FC<PostEntryProps> = (props) => {
  const { post } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();

  const filterByTag = (tagId: string) => {
    return (e: React.MouseEvent<HTMLSpanElement>) => {
      e.stopPropagation();
      navigate({ search: `?tag=${tagId}` });
    };
  };

  const entryClicked = () => {
    if (post.published) {
      navigate(`/post/${post.id}`);
    } else {
      navigate("/upload", { state: { id: post.id } });
    }
  };

  return (
    <article className="media is-clickable post-entry" onClick={entryClicked}>
      <UserLogo user={post.user} hideName />

      <div className="media-content">
        <div className="content">
          <strong className="post-title">
            {post.title ? post.title : t("Post")}
            &nbsp;
            <FavouriteToggle
              postId={post.id}
              favourite={post.favourites.length > 0}
            />
          </strong>
          <small>
            {post.createdAt && new Date(post.createdAt).toLocaleDateString()}&emsp;
            {post.createdAt && new Date(post.createdAt).toLocaleTimeString()}&emsp;
            in <i>{post.thread.topic.userGroup.name}</i> by <i>{post.user.username}</i>
          </small>

          {(post.published) && (
            <p className="mt-2">
              <i className="far fa-comment" />&nbsp;
              {post.commentCount || 0}&nbsp;
              {t("Comment", { count: post.commentCount || 0 })}
            </p>
          )}
        </div>

        <div>
          {(!post.published) && (
            <span className="tag is-warning non-clickable mr-2">
              {t("Draft")}
            </span>
          )}

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
