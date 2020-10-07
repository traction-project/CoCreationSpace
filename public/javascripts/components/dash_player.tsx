import * as React from "react";
import { useEffect, useRef } from "react";
import videojs, { VideoJsPlayer } from "video.js";

import "videojs-contrib-dash";

interface DashPlayerProps {
  manifest: string;
  subtitles: Array<{ language: string, url: string }>;
  width: number;
  setPlayer?: (v: VideoJsPlayer, m: string) => void;
}

const DashPlayer: React.FC<DashPlayerProps> = (props) => {
  const videoNode = useRef<HTMLVideoElement>(null);
  const { manifest, width, subtitles, setPlayer } = props;

  useEffect(() => {
    if (videoNode === null) {
      return;
    }

    const player = videojs(videoNode.current, { width, autoplay: true, controls: true }, () => {
      setPlayer && setPlayer(player, manifest);
    });

    return () => {
      player.dispose();
    };
  }, [manifest]);

  return (
    <div>
      <div data-vjs-player>
        <video ref={videoNode} className="video-js">
          {subtitles.map((s, i) => {
            return (
              <track key={i} src={s.url} label={s.language} srcLang={s.language} default={true} />
            );
          })}
        </video>
      </div>
    </div>
  );
};

export default DashPlayer;
