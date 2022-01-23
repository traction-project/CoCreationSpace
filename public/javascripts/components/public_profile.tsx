import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import classNames from "classnames";

import { UserType } from "./user_logo";
import { PostType } from "./post/post";
import { Link } from "react-router-dom";

interface PublicUserType extends UserType {
  posts: Array<PostType>;
  groups: Array<{ id: string, name: string }>;
  interests: Array<{ id: string, title: string }>;
  followers: Array<{ id: string, username: string }>;
}

interface PublicProfileProps {
}

const PublicProfile: React.FC<PublicProfileProps> = (props) => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [ user, setUser ] = useState<PublicUserType>();

  useEffect(() => {
    fetch(`/users/profile/${id}`).then((res) => {
      return res.json();
    }).then((data) => {
      setUser(data);
    });
  }, []);

  if (!user) {
    return null;
  }

  const navigateTo = (destination: string) => {
    return () => {
      navigate(destination);
    };
  };

  const numPosts = user.posts.filter((p) => p.parentPostId == null).length;
  const numComments = user.posts.filter((p) => p.parentPostId != null).length;
  const numMedia = user.posts.reduce((sum, p) => sum + (p.dataContainer?.mediaItems?.length || 0), 0);

  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Profile</h1>
        <h2 className="subtitle">{user.username}</h2>

        <hr/>

        <div className="columns is-vcentered">
          <div className="column is-2">
            <div className="box-flex">
              <figure style={{ width: "min-content" }}>
                <span className="image is-128x128">
                  <img src={user.image} alt="Logo" />
                </span>
              </figure>
            </div>
          </div>

          <div className="column is-7 is-offset-1">
            <nav style={{ display: "flex", backgroundColor: "#FAFAFA", padding: "1rem", marginBottom: "1rem", borderRadius: 4 }}>
              <div style={{ flexGrow: 1 }}>
                <div>
                  <p className="heading">{t("Posts")}</p>
                  <p className="subtitle">{numPosts}</p>
                </div>
              </div>
              <div style={{ flexGrow: 1 }}>
                <div>
                  <p className="heading">{t("Comments")}</p>
                  <p className="subtitle">{numComments}</p>
                </div>
              </div>
              <div style={{ flexGrow: 1 }}>
                <div>
                  <p className="heading">{t("Media Items")}</p>
                  <p className="subtitle">{numMedia}</p>
                </div>
              </div>
              <div style={{ flexGrow: 1 }}>
                <div>
                  <p className="heading">{t("Followers")}</p>
                  <p className="subtitle">{user.followers.length}</p>
                </div>
              </div>
            </nav>

            <h5 className="title is-5">{t("Groups")}</h5>

            {user.groups.map(({ id, name }) => {
              return (
                <span
                  key={id}
                  className={classNames("tag", "is-large", "is-primary", "non-clickable")}
                >
                  {name}
                </span>
              );
            })}

            <h5 className="title is-5">{t("Interests")}</h5>

            {user.interests.map(({ id, title }) => {
              return (
                <span
                  key={id}
                  className={classNames("tag", "is-large", "is-primary", "non-clickable")}
                >
                  {title}
                </span>
              );
            })}
          </div>
        </div>

        <hr/>

        <div className="columns">
          <div className="column">
            <h5 className="title is-5">{t("Latest Posts")}</h5>

            <div>
              {user.posts.filter((p) => p.parentPostId == null).map((post, index) => {
                return (
                  <article key={index} className="media is-clickable post-entry" onClick={navigateTo(`/post/${post.id}`)}>
                    <div className="media-content">
                      <div className="content">
                        <strong className="post-title">{post.title ? post.title : t("Post")}</strong>
                        <small className="list-item__date">
                          {post.createdAt && new Date(post.createdAt).toLocaleDateString()}&emsp;
                          {post.createdAt && new Date(post.createdAt).toLocaleTimeString()}&emsp;
                          in <i>{post.thread?.topic?.userGroup?.name || "Unknown"}</i>
                        </small>

                        <p className="mt-2">
                          <i className="far fa-comment" />&nbsp;
                          {post.comments?.length || 0}&nbsp;
                          {t("Comment", { count: post.comments?.length || 0 })}
                        </p>
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
              })}
            </div>

            <br/>

            <Link className="button is-info" to={`/?user=${user.id}`}>
              {t("Show all")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PublicProfile;
