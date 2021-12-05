import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import Thumbnail from "../thumbnail";

interface NoteCollection {
  id: string;
  name: string;
  mediaItems: Array<{
    id: string,
    type: string
  }>;
}

interface NotesListProps {
}

const NotesList: React.FC<NotesListProps> = (props) => {
  const { t } = useTranslation();
  const [ notes, setNotes ] = useState<Array<NoteCollection>>([]);

  useEffect(() => {
    fetch("/notes/collections").then((res) => {
      return res.json();
    }).then((data) => {
      setNotes(data);
    });
  }, []);

  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-9">
            <h4 className="title is-3">{t("Notes")}</h4>

            {notes.map(({ id, name, mediaItems }) => {
              return (
                <article key={id} className={classNames("media", "is-clickable", "p-4", "is-highlighted", "notes-list-entry")}>
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
                        {mediaItems.length} {t("items in collection", { count: mediaItems.length })}
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
