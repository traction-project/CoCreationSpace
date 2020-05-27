import * as React from "react";
import { useEffect, useRef } from "react";
import videojs from "video.js";

import "videojs-contrib-dash";

interface DashPlayerProps {
  manifest: string;
  subtitlePath?: string;
  width: number;
}

const DashPlayer: React.FC<DashPlayerProps> = (props) => {
  const videoNode = useRef<HTMLVideoElement>(null);
  const { manifest, width, subtitlePath } = props;

  useEffect(() => {
    if (videoNode === null) {
      return;
    }

    const player = videojs(videoNode.current, { width, autoplay: true, controls: true }, () => {
      console.log("Video player ready");

      player.src({
        src: manifest,
        type: "application/dash+xml"
      });

      player.play();
    });

    return () => {
      player.dispose();
    };
  });

  return (
    <div>
      <div data-vjs-player>
        <video ref={videoNode} className="video-js">
          {(subtitlePath) ? (
            <track src={subtitlePath} label="English" srcLang="en" default={true} />
          ) : (
            null
          )}
        </video>
      </div>
    </div>
  );
};

export default DashPlayer;
