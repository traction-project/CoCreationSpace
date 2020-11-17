import * as React from "react";
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";

import { postFile, ResponseUploadType } from "../util";
import Dropzone from "./dropzone";
import Video from "./video";
import ProgressRing from "./progress_ring";

const ENTER_KEY = 13;

interface VideoUploadProps {
}

const VideoUpload: React.FC<VideoUploadProps> = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const { handleSubmit, register } = useForm();

  const [ multimedia, setMultimedia ] = useState<string>();
  const [ progress, setProgress ] = useState<number>(0);
  const [ total, setTotal ] = useState<number>(0);
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

  const startUpload = async (file: File) => {
    try {
      const response: string = await postFile("/video/upload", file, (progress) => {
        setProgress(progress.loaded);
        setTotal(progress.total);
      });

      const responseJson: ResponseUploadType = JSON.parse(response);
      setMultimedia(responseJson.id);
      setDisplayNotification("success");
    } catch {
      setDisplayNotification("error");
    } finally {
      setTotal(0);
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
      multimedia: [multimedia],
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
    const tagsFiltered = tags.filter(tag => tag !== tagToRemove);
    setTags(tagsFiltered);
  };

  const handleKeyInputTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === ENTER_KEY && e.currentTarget.value) {
      const value = e.currentTarget.value;

      if (tags.indexOf(value) === -1) {
        setTags([...tags, value]);
      }

      e.currentTarget.value = "";
    }
  };


  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-8">
            {(total > 0) ? (
              <ProgressRing radius={160} stroke={15} progress={progress} total={total} />
            ) : (multimedia) ? (
              <Video id={multimedia}></Video>
            ) : (
              <Dropzone size={["100%", 300]} onFileDropped={startUpload} />
            )}
          </div>
        </div>

        <hr/>

        <div className="columns is-centered">
          <div className="column is-10">
            {(total > 0 || multimedia) && (
              <form onSubmit={handleFormSubmission}>
                <div className="field">
                  <label className="label">{t("Title")}</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      placeholder={`${t("Add title")}...`}
                      name="title"
                      ref={register}
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
                  <label className="label">Topic</label>
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
                          placeholder={`${t("Add tag")}...`}
                          onKeyDown={handleKeyInputTag}
                        />
                      </div>
                      <div className="control">
                        <a className="button is-info">
                          {t("Add")}
                        </a>
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
                    <button type="submit" className="button is-link is-fullwidth">
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
