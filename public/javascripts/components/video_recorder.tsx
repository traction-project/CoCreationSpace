import * as React from "react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { postFile, isMobile, isMedisRecorderSupported } from "../util";

interface VideoRecorderProps {
}

const VideoRecorder: React.FC<VideoRecorderProps> = () => {
  const video = useRef<HTMLVideoElement>(null);
  const { t } = useTranslation();

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

  const startRecording = async () => {
    setRecorderStatus("recording");

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: { ideal: 4096 },
        height: { ideal: 2160 }
      }
    });

    let stopped = false;
    let requestStop = false;
    const videoRef = video.current;

    if (!videoRef) {
      console.error("Video ref not available");
      return;
    }

    videoRef.srcObject = stream;
    videoRef.muted = true;
    videoRef.onloadeddata = () => video.current?.play();

    videoRef.onclick = () => {
      console.log("video clicked");
      requestStop = true;
    };

    await videoRef.requestFullscreen();

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
  };

  const renderRecorder = () => {
    return (
      (total > 0) ? (
        <div className="progresscontainer">
          <progress className="progress is-primary" value={progress} max={total} />
        </div>
      ) : (recorderStatus) ? (
        <div>
          <video ref={video} />
          <p className="has-text-centered">
            {t("Tap the video to stop recording and upload the video")}
          </p>
        </div>
      ) : (
        <button className="button is-info is-fullwidth" onClick={startRecording}>
          {t("Record")}
        </button>
      )
    );
  };

  return (
    <section className="hero is-fullheight-with-navbar">
      <div className="hero-body opera-background">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-6-tablet is-5-desktop is-5-widescreen">
              <div className="box">
                {(!isMobile()) ? (
                  <article className="message is-danger">
                    <div className="message-body">
                      {t("This page is only accessible on mobile devices!")}
                    </div>
                  </article>
                ) : (!isMedisRecorderSupported()) ? (
                  <article className="message is-danger">
                    <div className="message-body">
                      {t("Your browser cannot record video!")}
                    </div>
                  </article>
                ) : (
                  renderRecorder()
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoRecorder;
