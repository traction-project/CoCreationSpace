import * as React from "react";
import { useState, ChangeEvent } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { postFile, ResponseUploadType } from "../util";
import Dropzone from "./dropzone";
import Video from "./video";
import ProgressRing from "./progress_ring";

interface VideoUploadProps {
}

const VideoUpload: React.FC<VideoUploadProps> = () => {
  const history = useHistory();
  const { t } = useTranslation();

  const [ title, setTitle ] = useState<string>();
  const [ multimedia, setMultimedia ] = useState<string>();
  const [ progress, setProgress ] = useState<number>(0);
  const [ total, setTotal ] = useState<number>(0);
  const [ displayNotification, setDisplayNotification] = useState<"success" | "error">();
  const [ summary, setSummary ] = useState<string>("");
  const [ tags, setTags ] = useState<Array<string>>([]);

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

  const handleClickButton = () => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const body = {
      title,
      text: summary,
      multimedia: [multimedia],
      tags: tags.map((tag) => { return { tag_name: tag }; } )
    };
    fetch("/posts", {
      headers,
      method: "POST",
      body: JSON.stringify(body)
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          const err = new Error("HTTP status code: " + res.status);
          throw err;
        }
      })
      .then(_ => {
        history.push("/userPosts");
      })
      .catch(_ => setDisplayNotification("error"))
      .finally(() => setTimeout(() => setDisplayNotification(undefined), 3000));
  };

  const handleClickRemoveTag = (tagToRemove: string) => {
    const tagsFiltered = tags.filter(tag => tag !== tagToRemove);
    setTags(tagsFiltered);
  };

  const handleKeyInputTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const enterCode = 13;
    if (e.keyCode === enterCode && e.currentTarget.value) {
      const value = e.currentTarget.value;
      if (tags.indexOf(value) === -1 ) {
        setTags([...tags, value]);
      }
    }
  };

  const handleChangeInputTitle = (text: string) => {
    setTitle(text);
  };

  return (
    <div className="columns" style={{ marginTop: 15 }}>
      <div className="column is-8 is-offset-2">
        <div className="container">
          {(total > 0) ? (
            <ProgressRing radius={160} stroke={15} progress={progress} total={total}></ProgressRing>
          ) : (multimedia) ? (
            <Video id={multimedia}></Video>
          ) : (
            <Dropzone size={["100%", 300]} onFileDropped={startUpload} />
          )}
        </div>

        {(total > 0 || multimedia) ? (
          <React.Fragment>
            <br />
            <div className="columns">
              <div className="column is-2">
                <h1 className="title-2">{t("Title")}</h1>
                <hr/>
                <input type="text" placeholder={`${t("Add title")}...`} className="searcher-tag" onChange={(e) => handleChangeInputTitle(e.currentTarget.value)}/>
              </div>
            </div>
            <br/>
            <div className="columns">
              <div className="column">
                <h1 className="title-2">{t("Tags")}</h1>
                <hr/>
                <input type="text" placeholder={`${t("Add tag")}...`} className="searcher-tag" onKeyDown={handleKeyInputTag}/>
                <ul className="list-tags">
                  { tags ?
                    tags.map((tag, index) => {
                      return (
                        <li key={index} className="tag">{tag}<a className="delete" onClick={(_) => handleClickRemoveTag(tag)}></a></li>);
                    })
                    : null}
                </ul>
              </div>
              <div className="column">
                <h1 className="title-2">{t("Text")}</h1>
                <hr/>
                <textarea placeholder={`${t("Write summary")}...`} className="summary" onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSummary(e.currentTarget.value)}></textarea>
              </div>
            </div>
            <button className="btn" onClick={handleClickButton} disabled={(summary && multimedia) ? false : true}>
              {t("Create content")}
            </button>
          </React.Fragment>
        ) : (
          null
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
  );
};

export default VideoUpload;
