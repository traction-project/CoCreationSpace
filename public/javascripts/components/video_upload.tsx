import * as React from "react";
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";

import { postFile, ResponseUploadType } from "../util";
import Dropzone from "./dropzone";
import Video from "./video";
import ProgressBox from "./progress_box";

interface FileUpload {
  status: "progressing" | "failed" | "done";
  total: number;
  progress: number;
  filename: string;
  id?: string;
  type?: string;
}

interface VideoUploadProps {
  file?: File;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ file }) => {
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

      const response: string = await postFile("/video/upload", file, (progress) => {
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
        history.push("/userPosts");
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
    if (value.length > 0 && tags.indexOf(value) === -1) {
      setTags([...tags, value]);
    }
  };

  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-8 has-overflow">
            {(fileUploads.length == 0) ? (
              <Dropzone
                size={["100%", 300]}
                onFilesDropped={(files) => files.forEach(startUpload)}
              />
            ) : (
              fileUploads.map((upload) => {
                return (upload.status == "progressing") ? (
                  <ProgressBox progress={upload.progress} total={upload.total} />
                ) : (
                  <Video id={upload.id}></Video>
                );
              })
            )}
          </div>
        </div>

        <div className="columns is-centered">
          <div className="column is-10">
            {(fileUploads.length > 0) && (
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
                      ref={register}
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
                      disabled={watch("title")?.length == 0 || fileUploads.some((u) => u.status == "progressing")}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </form>
            )}

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

export default VideoUpload;
