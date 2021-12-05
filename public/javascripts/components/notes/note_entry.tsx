import * as React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";

import { NoteCollection } from "./notes_list";
import { MultimediaItem } from "../post/post";
import MediaPlayer from "../media_player";
import Image from "../image";
import File from "../file";
import Thumbnail from "../thumbnail";

interface NoteEntryProps {
}

const NoteEntry: React.FC<NoteEntryProps> = (props) => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { handleSubmit, register } = useForm();

  const [ noteCollection, setNoteCollection ] = useState<NoteCollection>();
  const [ selectedItem, setSelectedItem ] = useState<MultimediaItem>();
  const [ editDescription, setEditDescription ] = useState(false);

  useEffect(() => {
    fetch(`/notes/collection/${id}`).then((res) => {
      return res.json();
    }).then((data) => {
      setNoteCollection(data);
      setSelectedItem(data.mediaItems[0]);
    });
  }, [id]);

  const onDescriptionEdited = handleSubmit(async ({ description }) => {
    const res = await fetch(`/notes/collection/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description
      })
    });

    if (res.ok) {
      setNoteCollection({
        ...noteCollection!,
        description
      });

      setEditDescription(false);
    }
  });

  if (!noteCollection) {
    return null;
  }

  const { name, description, mediaItems } = noteCollection;

  return (
    <section className="section">
      <div className="container">
        <h4 className="title is-4">{name}</h4>
        <h5 className="subtitle is-5">
          {mediaItems.length} {t("items in collection", { count: mediaItems.length })}
        </h5>

        <div className="post-entry">
          <div className="columns is-centered">
            <div className="column">
              {(selectedItem) && (
                <div className="columns is-centered">
                  <div className="column" style={{ position: "relative" }}>
                    {(selectedItem.type == "video") ? (
                      <MediaPlayer
                        comments={[]}
                        emojis={[]}
                        id={selectedItem.id}
                      />
                    ) : (selectedItem.type == "audio") ? (
                      <MediaPlayer
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

              <hr/>

              <h6 className="title is-6">
                  Description
              </h6>

              {(!editDescription) ? (
                <div>
                  <p>{description}</p>
                  <hr/>
                  <a onClick={() => setEditDescription(true)}>
                    {t("Edit description")}
                  </a>
                </div>
              ) : (
                <div>
                  <div className="field">
                    <div className="control">
                      <textarea className="textarea" {...register("description", { value: description })} />
                    </div>
                  </div>
                  <div className="field is-grouped">
                    <div className="control">
                      <button className="button is-info" onClick={onDescriptionEdited}>
                        Save
                      </button>
                    </div>
                    <div className="control">
                      <button className="button is-info is-light" onClick={() => setEditDescription(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
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
