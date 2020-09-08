import * as React from "react";
import { useState, ChangeEvent } from "react";

import { postFile, ResponseUploadType } from "../util";
import Dropzone from "./dropzone";
import Video from "./video";
import { useHistory } from "react-router-dom";

interface VideoUploadProps {
}

const VideoUpload: React.FC<VideoUploadProps> = () => {
  const history = useHistory();
  const [ multimedia, setMultimedia ] = useState<number>();
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

  return (
    <div className="columns" style={{ marginTop: 15 }}>
      <div className="column is-8 is-offset-2">
        <h1 className="title">Upload Video</h1>
        {(total > 0) ? (
          <div className="progresscontainer">
            <progress className="progress is-primary" value={progress} max={total} />
          </div>
        ) : ( multimedia ? 
          
          (<Video id={multimedia}></Video>)
          : (
            <Dropzone size={["100%", 300]} onFileDropped={startUpload} />
          )
        )}

        { (total > 0 || multimedia) ?
          (
            <React.Fragment>
              <br />
              <div className="columns">
                <div className="column">
                  <input type="text" placeholder="Add tag..." className="searcher-tag" onKeyDown={handleKeyInputTag}/>
                  <ul className="list-tags">
                    { tags ?
                      tags.map((tag, index) => {
                        return ( 
                          <li key={index} className="list-tags__item">{tag}<a className="delete" onClick={(_) => handleClickRemoveTag(tag)}></a></li>);
                      })
                      : null}
                  </ul>
                </div>
                <div className="column">
                  <textarea placeholder="Write summary..." className="summary" onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSummary(e.currentTarget.value)}></textarea>
                </div>
              </div>

              <button onClick={handleClickButton} disabled={(summary && multimedia) ? false : true}>Add content</button>  
            </React.Fragment>
          ) 
          : null} 
        {(displayNotification == "success") ? (
          <div className="notification is-success fixed-notification">
            <button className="delete" onClick={closeNotification}></button>
            File successfully uploaded
          </div>
        ) : (displayNotification == "error") ? (
          <div className="notification is-error fixed-notification">
            <button className="delete" onClick={closeNotification}></button>
            Could not upload file
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default VideoUpload;
