import * as React from "react";
import { useRef } from "react";

interface VideoRecorderProps {
}

const VideoRecorder: React.FC<VideoRecorderProps> = () => {
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <div>
      <h1 className="title">Record Video</h1>
      <input
        ref={fileInput}
        style={{ display: "none" }}
        type="file"
        accept="video/*"
        capture="environment"
      />

      <button className="button is-info" onClick={() => fileInput.current?.click()}>
        Record
      </button>
    </div>
  );
};

export default VideoRecorder;
