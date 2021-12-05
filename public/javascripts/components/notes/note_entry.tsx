import * as React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { NoteCollection } from "./notes_list";
import { MultimediaItem } from "../post/post";
import MediaPlayerWithToolbar from "../media_player_with_toolbar";
import Image from "../image";
import File from "../file";
import Thumbnail from "../thumbnail";

interface NoteEntryProps {
}

const NoteEntry: React.FC<NoteEntryProps> = (props) => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const [ noteCollection, setNoteCollection ] = useState<NoteCollection>();
  const [ selectedItem, setSelectedItem ] = useState<MultimediaItem>();

  useEffect(() => {
    fetch(`/notes/collection/${id}`).then((res) => {
      return res.json();
    }).then((data) => {
      setNoteCollection(data);
      setSelectedItem(data.mediaItems[0]);
    });
  }, [id]);

  if (!noteCollection) {
    return null;
  }

  const { name, mediaItems } = noteCollection;

  return (
    <section className="section">
      <div className="container">
        <h4 className="title is-4">{name}</h4>
        <h5 className="subtitle is-5">
          {mediaItems.length} {t("items in collection", { count: mediaItems.length })}
        </h5>

        <div className="post-entry">
          <div className="columns is-centered">
            <div className="column is-9">
              {(selectedItem) && (
                <div className="columns is-centered">
                  <div className="column is-8-desktop is-10-tablet" style={{ position: "relative" }}>
                    {(selectedItem.type == "video") ? (
                      <MediaPlayerWithToolbar
                        comments={[]}
                        emojis={[]}
                        id={selectedItem.id}
                      />
                    ) : (selectedItem.type == "audio") ? (
                      <MediaPlayerWithToolbar
                        id={selectedItem.id}
                        comments={[]}
                        emojis={[]}
                        type="audio"
                      />
                    ) : (selectedItem.type == "image") ? (
                      <Image id={selectedItem.id} />
                    ) : (
                      <File id={selectedItem.id} />
                    )}
                  </div>
                </div>
              )}

              {(mediaItems && mediaItems.length > 1) && (
                <div style={{ display: "flex", backgroundColor: "#F5F5F5", overflowX: "scroll" }}>
                  {mediaItems.map((mediaItem, index) => {
                    return (
                      <div
                        key={index}
                        className="is-clickable"
                        style={{ flexShrink: 0 }}
                        onClick={setSelectedItem.bind(null, mediaItem)}
                      >
                        <Thumbnail
                          id={mediaItem.id}
                          type={mediaItem.type}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NoteEntry;
