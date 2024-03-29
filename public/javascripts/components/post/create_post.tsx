import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { useForm } from "react-hook-form";

import { getFilesFromList, parseTags, postFile, ResponseUploadType } from "../../util";
import Dropzone from "../dropzone";
import ProgressBox from "../progress_box";
import BlankVideo from "../blank_video";
import UploadedMediaItem from "./uploaded_media_item";
import { PostType, MultimediaItem } from "./post";
import { getPostId } from "../../services/post.service";

interface FileUpload {
  status: "progressing" | "failed" | "done";
  total: number;
  progress: number;
  filename: string;
  id?: string;
  type?: string;
}

interface CreatePostProps {
}

const CreatePost: React.FC<CreatePostProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { handleSubmit, register, setValue, getValues, watch, reset } = useForm();

  // Load preloaded items from location.state
  const { mediaItems, title, id: existingPostId } = (location.state) ? (
    location.state as Partial<{ mediaItems: Array<MultimediaItem>, title: string, id: string }>
  ) : (
    { mediaItems: [], title: null, id: null }
  );

  const preloadedMediaItems: Array<FileUpload> = (mediaItems || []).map(({ id, type, file }) => {
    return {
      status: "done",
      total: 0, progress: 0, filename: file,
      id, type
    };
  });

  const [ fileUploads, setFileUploads ] = useState<Array<FileUpload>>(preloadedMediaItems);
  const [ displayNotification, setDisplayNotification] = useState<"success" | "error">();
  const [ tags, setTags ] = useState<Array<string>>([]);
  const [ topics, setTopics ] = useState<Array<[string, string, string]>>([]);
  const saveAsDraft = useRef(false);

  useEffect(() => {
    fetch("/topics/group").then((res) => {
      return res.json();
    }).then((topics) => {
      setTopics(topics.map((t: { id: string, title: string, userGroup: { name: string } }) => {
        return [t.id, t.title, t.userGroup.name];
      }));

      reset({ "topic": topics[0].id }, { keepDirty: true });
    }).then(() => {
      // If existingPostId has a value, load post from server
      if (existingPostId != null) {
        getPostId(existingPostId).then((res) => {
          return res.json();
        }).then((post: PostType) => {
          console.log(post);

          setTags(post.tags?.map((t: { name: string}) => t.name) || []);
          setFileUploads(post.dataContainer?.mediaItems?.map(({ id, type }) => {
            return {
              id, type,
              status: "done",
              total: 0, progress: 0, filename: ""
            };
          }) || []);

          reset({
            "title": post.title,
            "description": post.dataContainer?.textContent,
            "topic": post.thread.topic.id
          });
        });
      }
    });
  }, []);

  const startUpload = async (file: File) => {
    try {
      setFileUploads((uploads) => [ ...uploads, {
        status: "progressing",
        filename: file.name,
        total: 0,
        progress: 0
      }]);

      const response: string = await postFile("/media/upload", file, (progress) => {
        setFileUploads((uploads) => uploads.map((upload) => {
          if (file.name == upload.filename) {
            return {
              ...upload,
              total: progress.total,
              progress: progress.loaded
            };
          }

          return upload;
        }));
      });

      const responseJson: ResponseUploadType = JSON.parse(response);

      setFileUploads((uploads) => uploads.map((upload) => {
        if (file.name == upload.filename) {
          return {
            ...upload,
            status: "done",
            id: responseJson.id,
            type: responseJson.type
          };
        }

        return upload;
      }));

      setDisplayNotification("success");
    } catch {
      setFileUploads((uploads) => uploads.map((upload) => {
        if (file.name == upload.filename) {
          return {
            ...upload,
            status: "failed"
          };
        }

        return upload;
      }));

      setDisplayNotification("error");
    } finally {
      setTimeout(() => setDisplayNotification(undefined), 3000);
    }
  };

  const closeNotification = () => {
    setDisplayNotification(undefined);
  };

  const handleFormSubmission = handleSubmit(async ({ title, description, topic }) => {
    console.log("Submit:", title, description, topic, saveAsDraft.current);

    // Get and parse remaining values from tag form field
    const tagsToAdd = parseTags(getValues("tagName")).filter((t) => {
      // Only add tags which aren't in the list already
      return tags.indexOf(t) == -1;
    });

    const body = {
      title,
      description,
      multimedia: fileUploads.map((u) => u.id),
      tags: tags.concat(tagsToAdd).map((tag) => { return { name: tag }; } ),
      topicId: topic,
      published: !saveAsDraft.current
    };

    try {
      // If existingPostId has a value, submit data to edit endpoint
      const endpoint = (existingPostId != null) ? (
        `/posts/${existingPostId}/edit`
      ) : (
        "/posts"
      );

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const post = await res.json();

        if (!saveAsDraft.current) {
          navigate(`/post/${post.id}`);
        } else {
          navigate("/drafts");
        }
      } else {
        throw new Error("HTTP status code: " + res.status);
      }
    } catch (err) {
      console.error(err);

      setDisplayNotification("error");
      setTimeout(() => {
        setDisplayNotification(undefined);
      }, 3000);
    }
  });

  const handleClickRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addTag = (value: string) => {
    if (value.length == 0) {
      return;
    }

    // Split tags using comma
    const tagsToAdd = parseTags(value).filter((t) => {
      // Only add tags which aren't in the list already
      return tags.indexOf(t) == -1;
    });

    setTags(tags.concat(tagsToAdd));
  };

  const deleteUploadedItem = (id: string) => {
    const index = fileUploads.findIndex((f) => f.id == id);

    if (index >= 0) {
      const uploads = fileUploads.slice();
      uploads.splice(index, 1);

      setFileUploads(uploads);
    } else {
      console.warn("Item with ID", id, "not found");
    }
  };

  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered is-multiline">
          {(fileUploads.length == 0) ? (
            <div className="column is-8">
              <Dropzone
                size={["100%", 300]}
                onFilesDropped={(files) => files.forEach(startUpload)}
              />
            </div>
          ) : (
            fileUploads.map((upload, i) => {
              return (
                <div className="column is-8" key={upload.id || i}>
                  {(upload.status == "progressing") ? (
                    <ProgressBox progress={upload.progress} total={upload.total} />
                  ) : (upload.status == "failed") ? (
                    <BlankVideo message="failed" />
                  ) : (
                    <UploadedMediaItem
                      key={upload.id!}
                      id={upload.id!}
                      type={upload.type!}
                      onDelete={deleteUploadedItem}
                    />
                  )}

                  <p className="has-text-centered mt-2">
                    {upload.filename}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {(fileUploads.length > 0) && (
          <div className="columns is-centered">
            <div className="column" style={{ display: "flex", justifyContent: "center" }}>
              <div className="file">
                <label className="file-label">
                  <input
                    className="file-input"
                    type="file"
                    multiple={true}
                    name="resume"
                    onChange={(e) => {
                      getFilesFromList(e.target.files).forEach((f) => startUpload(f));
                    }}
                  />
                  <span className="file-cta">
                    <span className="file-icon">
                      <i className="fas fa-upload"></i>
                    </span>
                    &nbsp;
                    <span className="file-label">
                      {t("Add more files")}…
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {(fileUploads.length > 0 && !fileUploads.some((upload) => upload.status == "progressing")) && (
          <div className="columns is-centered">
            <div className="column is-10">
              <article className="message is-info">
                <div className="message-body">
                  <Trans i18nKey="processing-message">
                    All files have finished uploading. You can add more files or simply hit <strong>Submit</strong> after you have completed the form below.
                    Any videos that are still processing will be processed in the background.
                  </Trans>
                </div>
              </article>
            </div>
          </div>
        )}

        <div className="columns is-centered">
          <div className="column is-10">
            <form onSubmit={handleFormSubmission}>
              <div className="field">
                <label className="label">{t("Title")}</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    placeholder={`${t("Add title")}...`}
                    onKeyDown={(e) => (e.key == "Enter") && e.preventDefault()}
                    required={true}
                    {...register("title", {
                      required: true,
                      value: title
                    })}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">{t("Description")}</label>
                <div className="control">
                  <textarea
                    placeholder={`${t("Description")}...`}
                    className="textarea"
                    {...register("description")}
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">{t("Topic")}</label>
                <div className="control">
                  <div className="select">
                    <select {...register("topic")}>
                      {topics.map(([id, name, group]) => {
                        return (
                          <option key={id} value={id}>{name} ({group})</option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="label">{t("Tags")}</label>

                <div className="control">
                  <div className="field has-addons">
                    <div className="control">
                      <input
                        className="input"
                        type="text"
                        onKeyDown={(e) => {
                          if (e.key == "Enter") {
                            e.preventDefault();

                            addTag(getValues("tagName"));
                            setValue("tagName", "");
                          }
                        }}
                        placeholder={`${t("Add tag")}...`}
                        {...register("tagName")}
                      />
                    </div>
                    <div className="control">
                      <button
                        type="button"
                        className="button is-info"
                        onClick={() => {
                          addTag(getValues("tagName"));
                          setValue("tagName", "");
                        }}
                      >
                        {t("Add")}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="list-tags">
                  {(tags.length > 0) ? (
                    <ul>
                      {tags.map((tag, index) => {
                        return (
                          <li key={index} className="tag is-medium is-primary">
                            {tag} <a className="delete" onClick={handleClickRemoveTag.bind(null, tag)}></a>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p>{t("No tags added yet")}</p>
                  )}
                </div>
              </div>

              <div className="field pt-4">
                <div className="control">
                  <button
                    type="submit"
                    className="button is-info is-fullwidth"
                    onClick={() => {
                      saveAsDraft.current = true;
                    }}
                    disabled={watch("title")?.length == 0 || fileUploads.some((u) => u.status == "progressing")}
                  >
                    {t("Save as draft")}
                  </button>
                </div>
              </div>

              <div className="field">
                <div className="control">
                  <button
                    type="submit"
                    className="button is-info is-fullwidth"
                    onClick={() => {
                      saveAsDraft.current = false;
                    }}
                    disabled={watch("title")?.length == 0 || fileUploads.some((u) => u.status == "progressing")}
                  >
                    {t("Submit")}
                  </button>
                </div>
              </div>
            </form>

            {(displayNotification == "success") ? (
              <div className="notification is-success fixed-notification">
                <button className="delete" onClick={closeNotification}></button>
                {t("File successfully uploaded")}
              </div>
            ) : (displayNotification == "error") ? (
              <div className="notification is-error fixed-notification">
                <button className="delete" onClick={closeNotification}></button>
                {t("Could not upload file")}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreatePost;
