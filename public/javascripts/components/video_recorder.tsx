import * as React from "react";

interface VideoRecorderProps {
}

const VideoRecorder: React.FC<VideoRecorderProps> = () => {
  return (
    <div>
      <h1 className="title">Record Video</h1>
      <input type="file" accept="video/*" capture="environment" />
    </div>
  );
};

export default VideoRecorder;
