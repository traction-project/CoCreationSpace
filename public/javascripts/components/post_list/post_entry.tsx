import * as React from "react";
import { Link } from "react-router-dom";
import { PostType } from "../post";
import { useTranslation } from "react-i18next";

import UserLogo from "../user_logo";

interface PostEntryProps {
  post: PostType;
}

const PostEntry: React.FC<PostEntryProps> = (props) => {
  const { post } = props;
  const { t } = useTranslation();

  return (
    <div>
      <Link to={`/post/${post.id}`}>
        <div className="list-item">
          <div className="box" style={{width: "100%"}}>
            <article className="media">
              <UserLogo user={post.user}></UserLogo>
              <div className="media-content">
                <div className="content">
                  <p>
                    <strong className="post-title">{post.title ? post.title : "Post"}</strong>
                    <small className="list-item__date">{post.createdAt && new Date(post.createdAt).toLocaleDateString()}</small>
                    <br />
                    <br />
                    {post.dataContainer?.text_content}
                  </p>
                </div>
                { (post.dataContainer && post.dataContainer.multimedia && post.dataContainer.multimedia.length > 0) ?
                  <div className="list-item__files">
                    {post.dataContainer.multimedia.map((multimedia, index) => {
                      return (
                        <div key={index}>
                          <figure className="image is-24x24 list-item__files-item">
                            <img src="/images/docs.png" />
                          </figure>
                        </div>
                      );
                    })}
                  </div>
                  : null}
              </div>
              <div className="media-right number-comments">
                <i className="far fa-comment"></i>
                <p>{(post.comments && post.comments.length > 0) ? post.comments.length : 0} {(post.comments && post.comments.length == 1) ? t("Comment") : t("Comments") }</p>
              </div>
            </article>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PostEntry;
