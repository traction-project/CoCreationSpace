import * as React from "react";
import { useRef, useState } from "react";

import { postFile } from "../util";

interface VideoRecorderProps {
}

const VideoRecorder: React.FC<VideoRecorderProps> = () => {
  const [ videoFile, setVideoFile ] = useState<File>();
  const fileInput = useRef<HTMLInputElement>(null);

  const [ progress, setProgress ] = useState<number>(0);
  const [ total, setTotal ] = useState<number>(0);
  const [ displayNotification, setDisplayNotification] = useState<"success" | "error">();

  const startUpload = async (file: File) => {
    try {
      await postFile("/video/upload", file, (progress) => {
        setProgress(progress.loaded);
        setTotal(progress.total);
      });

      setDisplayNotification("success");
    } catch {
      setDisplayNotification("error");
    } finally {
      setTotal(0);
      setVideoFile(undefined);
      setTimeout(() => setDisplayNotification(undefined), 3000);
    }
  };

  const closeNotification = () => {
    setDisplayNotification(undefined);
  };

  const updateVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      console.log("Updating video file:", file);
      setVideoFile(file);
    }
  };

  return (
    <div className="columns" style={{ marginTop: 15 }}>
      <div className="column is-8 is-offset-2">
        <h1 className="title">Record Video</h1>
        <input
          ref={fileInput}
          style={{ display: "none" }}
          type="file"
          accept="video/*"
          capture="environment"
          onChange={updateVideoFile}
        />

        <div style={{ width: "80vw", marginLeft: "10vw" }}>
          {(total > 0) ? (
            <div className="progresscontainer">
              <progress className="progress is-primary" value={progress} max={total} />
            </div>
          ) : (videoFile) ? (
            <button className="button is-info is-fullwidth" onClick={startUpload.bind(null, videoFile)}>
              Upload
            </button>
          ) : (
            <button className="button is-info is-fullwidth" onClick={() => fileInput.current?.click()}>
              Record
            </button>
          )}
        </div>

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

export default VideoRecorder;
