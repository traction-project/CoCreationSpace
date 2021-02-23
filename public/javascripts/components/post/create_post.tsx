import * as React from "react";
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";

import { getFilesFromList, postFile, ResponseUploadType } from "../../util";
import Dropzone from "../dropzone";
import Video from "../video";
import ProgressBox from "../progress_box";
import BlankVideo from "../blank_video";
import Image from "../image";

interface FileUpload {
  status: "progressing" | "failed" | "done";
  total: number;
  progress: number;
  filename: string;
  id?: string;
  type?: string;
}

interface CreatePostProps {
  file?: File;
}

const CreatePost: React.FC<CreatePostProps> = ({ file }) => {
  const history = useHistory();
  const { t } = useTranslation();
  const { handleSubmit, register, setValue, getValues, watch } = useForm();

  const [ fileUploads, setFileUploads ] = useState<Array<FileUpload>>([]);
  const [ displayNotification, setDisplayNotification] = useState<"success" | "error">();
  const [ tags, setTags ] = useState<Array<string>>([]);
  const [ topics, setTopics ] = useState<Array<[string, string]>>([]);

  useEffect(() => {
    fetch("/topics/all").then((res) => {
      return res.json();
    }).then((topics) => {
      setTopics(topics.map((t: { id: string, title: string }) => {
        return [t.id, t.title];
      }));
    });
  }, []);

  useEffect(() => {
    if (file) {
      startUpload(file);
    }
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
    const body = {
      title,
      text: description,
      multimedia: fileUploads.map((u) => u.id),
      tags: tags.map((tag) => { return { tag_name: tag }; } ),
      topicId: topic
    };

    try {
      const res = await fetch("/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const post = await res.json();
        history.push(`/post/${post.id}`);
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

    const tagsToAdd = value.split(",").map((t) => {
      return t.trim();
    }).filter((t) => {
      return tags.indexOf(t) == -1;
    });

    setTags(tags.concat(tagsToAdd));
  };

  const renderMediaItem = (id: string, type: string) => {
    if (type == "video") {
      return (
        <Video id={id} />
      );
    } else {
      return (
        <Image id={id} />
      );
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
                <div className="column" key={i}>
                  {(upload.status == "progressing") ? (
                    <ProgressBox progress={upload.progress} total={upload.total} />
                  ) : (upload.status == "failed") ? (
                    <BlankVideo message="failed" />
                  ) : (
                    renderMediaItem(upload.id!, upload.type!)
                  )}
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
                    name="title"
                    required={true}
                    ref={register({
                      required: true
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
                    name="description"
                    ref={register({
                      required: true
                    })}
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">{t("Topic")}</label>
                <div className="control">
                  <div className="select">
                    <select name="topic" ref={register}>
                      {topics.map(([id, name]) => {
                        return (
                          <option key={id} value={id}>{name}</option>
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
                        name="tagName"
                        placeholder={`${t("Add tag")}...`}
                        ref={register}
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
                    className="button is-link is-fullwidth"
                    disabled={watch("title")?.length == 0 || watch("description")?.length == 0 || fileUploads.length == 0 || fileUploads.some((u) => u.status == "progressing")}
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
