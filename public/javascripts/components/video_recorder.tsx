import * as React from "react";
import { useRef, useState } from "react";

interface VideoRecorderProps {
}

const VideoRecorder: React.FC<VideoRecorderProps> = () => {
  const [ videoFile, setVideoFile ] = useState<File>();
  const fileInput = useRef<HTMLInputElement>(null);

  const updateVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      console.log("Updating video file:", file);
      setVideoFile(file);
    }
  };

  return (
    <div>
      <h1 className="title">Record Video</h1>
      <input
        ref={fileInput}
        style={{ display: "none" }}
        type="file"
        accept="video/*"
        capture="environment"
        onChange={updateVideoFile}
      />

      {(videoFile) ? (
        <>
          <video src={URL.createObjectURL(videoFile)} controls={true} />
          <br/>
        </>
      ) : (
        null
      )}

      <button className="button is-info" onClick={() => fileInput.current?.click()}>
        Record
      </button>
    </div>
  );
};

export default VideoRecorder;
