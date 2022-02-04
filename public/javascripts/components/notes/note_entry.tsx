import * as React from "react";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { useForm } from "react-hook-form";

import { NoteCollection } from "./notes_list";
import { MultimediaItem } from "../post/post";
import MediaPlayer from "../media_player";
import Image from "../image";
import File from "../file";
import Thumbnail from "../thumbnail";
import DeleteIcon from "../post/delete_icon";

interface NoteEntryProps {
}

const NoteEntry: React.FC<NoteEntryProps> = (props) => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { handleSubmit, register } = useForm();

  const [ noteCollection, setNoteCollection ] = useState<NoteCollection>();
  const [ selectedItem, setSelectedItem ] = useState<MultimediaItem>();
  const [ editDescription, setEditDescription ] = useState(false);
  const [ editName, setEditName ] = useState(false);

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

  const onNameEdited = handleSubmit(async ({ name }) => {
    const res = await fetch(`/notes/collection/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name
      })
    });

    if (res.ok) {
      setNoteCollection({
        ...noteCollection!,
        name
      });

      setEditName(false);
    }
  });

  const onMediaItemDeleted = async (mediaItemId: string) => {
    const res = await fetch(`/notes/remove/${id}/${mediaItemId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name
      })
    });

    if (res.ok) {
      setNoteCollection({
        ...noteCollection!,
        mediaItems: noteCollection!.mediaItems.filter((m) => m.id != mediaItemId)
      });
    }
  };

  if (!noteCollection) {
    return null;
  }

  const { name, description, mediaItems } = noteCollection;
  const mediaItemCount = mediaItems.length;

  return (
    <section className="section">
      <div className="container">
        <h4 className="title is-4">
          {(editName) ? (
            <div className="field has-addons">
              <div className="control">
                <input
                  className="input"
                  type="text"
                  defaultValue={name}
                  placeholder="Name"
                  {...register("name", {
                    required: true,
                    value: name
                  })}
                />
              </div>
              <div className="control">
                <a className="button is-info" style={{ fontWeight: "normal" }} onClick={onNameEdited}>
                  {t("Save")}
                </a>
              </div>
            </div>
          ) : (
            <>
              {name}
              <button className="button is-small is-pulled-right" onClick={() => setEditName(true)}>
                {t("Edit")}
              </button>
            </>
          )}
        </h4>
        <h5 className="subtitle is-5">
          <Trans i18nKey="collection-count" count={mediaItems.length}>
            {{ mediaItemCount }} items in collection
          </Trans>
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

                    <p className="has-text-centered mt-2">
                      {selectedItem.file}
                    </p>

                    <DeleteIcon onClick={() => onMediaItemDeleted(selectedItem.id)}/>
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
                  <br/>
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

              <hr/>

              <Link
                className="button is-info"
                to="/upload"
                state={{ mediaItems, title: name }}
              >
                {t("Share as post")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NoteEntry;
