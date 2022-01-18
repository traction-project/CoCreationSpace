import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { useHistory } from "react-router-dom";
import classNames from "classnames";

import Thumbnail from "../thumbnail";
import { MultimediaItem } from "../post/post";

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
  const history = useHistory();

  const [ notes, setNotes ] = useState<Array<NoteCollection>>([]);

  useEffect(() => {
    fetch("/notes/collections").then((res) => {
      return res.json();
    }).then((data) => {
      setNotes(data);
    });
  }, []);

  const navigateTo = (destination: string) => {
    return () => {
      history.push(destination);
    };
  };

  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-9">
            <h4 className="title is-4">{t("Favourites")}</h4>
            <hr/>

            {notes.map(({ id, name, mediaItems }) => {
              const mediaItemCount = mediaItems.length;

              return (
                <article
                  key={id}
                  className={classNames("media", "is-clickable", "p-4", "is-highlighted", "notes-list-entry")}
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
