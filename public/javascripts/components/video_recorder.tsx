import * as React from "react";
import { useRef, useState } from "react";

import { postFile } from "../util";

interface VideoRecorderProps {
}

const VideoRecorder: React.FC<VideoRecorderProps> = () => {
  const video = useRef<HTMLVideoElement>(null);

  const [ recorderStatus, setRecorderStatus ] = useState<"recording" | "stopped">();
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
      setRecorderStatus(undefined);
      setTimeout(() => setDisplayNotification(undefined), 3000);
    }
  };

  const closeNotification = () => {
    setDisplayNotification(undefined);
  };

  const startRecording = () => {
    setRecorderStatus("recording");

    navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then((stream) => {
      let stopped = false;
      let requestStop = false;

      if (video.current) {
        video.current.srcObject = stream;
        video.current.muted = true;
        video.current.onloadeddata = () => video.current?.play();

        video.current.onclick = () => {
          console.log("video clicked");
          requestStop = true;
        };
      }

      const chunks: Array<BlobPart> = [];
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
        videoBitsPerSecond: 5000000,
        audioBitsPerSecond: 256000
      });

      console.log("setting up recorder...");

      recorder.addEventListener("error", (e) => {
        console.error(e);
      });

      recorder.addEventListener("dataavailable", (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }

        if (requestStop == true && stopped == false) {
          console.log("stopping recorder...");

          recorder.stop();
          video.current?.pause();
          stream.getTracks().forEach((t) => t.stop());

          stopped = true;
        }
      });

      recorder.addEventListener("stop", () => {
        console.log("recorder stopped. starting file upload...");
        startUpload(new File(chunks, "video.webm"));
      });

      recorder.start(1000);
    });
  };

  return (
    <div className="columns" style={{ marginTop: 15 }}>
      <div className="column is-8 is-offset-2">
        <h1 className="title">Record Video</h1>

        {(total > 0) ? (
          <div className="progresscontainer">
            <progress className="progress is-primary" value={progress} max={total} />
          </div>
        ) : (recorderStatus) ? (
          <div>
            <video ref={video} />
            <p>
              Tap the video to stop recording and upload the video
            </p>
          </div>
        ) : (
          <button className="button is-info" onClick={startRecording}>
            Record
          </button>
        )}

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
