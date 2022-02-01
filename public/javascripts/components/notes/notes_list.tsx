import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { useNavigate } from "react-router-dom";
import classNames from "classnames";

import Thumbnail from "../thumbnail";
import { MultimediaItem, PostType } from "../post/post";

export interface NoteCollection {
  id: string;
  name: string;
  description: string;
  mediaItems: Array<MultimediaItem>;
}

interface NotesListProps {
}

const NotesList: React.FC<NotesListProps> = (props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [ notes, setNotes ] = useState<Array<NoteCollection>>();
  const [ posts, setPosts ] = useState<Array<PostType>>();

  useEffect(() => {
    fetch("/notes/collections").then((res) => {
      return res.json();
    }).then((data) => {
      setNotes(data);
    });

    fetch("/users/favourites").then((res) => {
      return res.json();
    }).then((data) => {
      setPosts(data);
    });
  }, []);

  const navigateTo = (destination: string) => {
    return () => {
      navigate(destination);
    };
  };

  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-9">
            <h4 className="title is-4">{t("Favourite Posts")}</h4>
            <hr/>

            {(posts?.length == 0) && (
              <p>{t("You have no favourite posts yet")}</p>
            )}

            {posts?.map((post, index) => {
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

            <h4 style={{ marginTop: "2em" }} className="title is-4">{t("Favourite Media Collections")}</h4>
            <hr/>

            {(notes?.length == 0) && (
              <p>{t("You haven't created any collections yet")}</p>
            )}

            {notes?.map(({ id, name, mediaItems }) => {
              const mediaItemCount = mediaItems.length;

              return (
                <article
                  key={id}
                  className={classNames("media", "is-clickable", "p-4", "post-entry")}
                  onClick={navigateTo(`/note/${id}`)}
                >
                  <figure className="media-left">
                    <p className="image is-64x64">
                      {(mediaItems.length > 0) && (
                        <Thumbnail
                          id={mediaItems[0].id}
                          type={mediaItems[0].type}
                          height={64}
                          padding={0}
                        />
                      )}
                    </p>
                  </figure>
                  <div className="media-content">
                    <div className="content">
                      <p>
                        <strong>
                          {name}
                        </strong>
                        <br />
                        <br />
                        <Trans i18nKey="collection-count" count={mediaItems.length}>
                          {{mediaItemCount}} items in collection
                        </Trans>
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotesList;
