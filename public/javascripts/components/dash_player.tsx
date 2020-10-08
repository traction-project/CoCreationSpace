import * as React from "react";
import { useEffect, useRef } from "react";
import videojs, { VideoJsPlayer } from "video.js";

import "videojs-contrib-dash";

interface DashPlayerProps {
  manifest: string;
  subtitles: Array<{ language: string, url: string }>;
  width: number;
  markers?: number[];
  setPlayer?: (v: VideoJsPlayer) => void;
}

const DashPlayer: React.FC<DashPlayerProps> = (props) => {
  const playerNode = useRef<HTMLDivElement>(null);
  const videoNode = useRef<HTMLVideoElement>(null);
  const { manifest, width, subtitles, markers, setPlayer } = props;

  useEffect(() => {
    if (videoNode === null) {
      return;
    }

    const player = videojs(videoNode.current, { width, autoplay: true, controls: true }, () => {
      player.src({
        src: manifest,
        type: "application/dash+xml"
      });

      if (markers) {
        player.on("loadedmetadata", () => {
          createMarkers(player, markers);
        });
      }

      setPlayer && setPlayer(player);
    });

    return () => {
      player.dispose();
    };
  }, [manifest]);


  const createMarkers = (player: VideoJsPlayer, seconds: number[]) => {
    seconds.map(second => {
      const marker = document.createElement("div");
      marker.style.width = `${second * 100 / player.duration()}%`;
      marker.className = "video-marker";

      playerNode.current?.querySelector(".vjs-progress-holder")?.appendChild(marker);
    });
  };

  return (
    <div>
      <div ref={playerNode} data-vjs-player>
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
