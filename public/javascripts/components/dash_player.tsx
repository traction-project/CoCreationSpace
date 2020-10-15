import * as React from "react";
import { useEffect, useRef, useState } from "react";
import videojs, { VideoJsPlayer } from "video.js";

import "videojs-contrib-dash";
import { PostType } from "./post";
import vjsReactionComments from "./videojs/reaction-comments";

interface DashPlayerProps {
  manifest: string;
  subtitles: Array<{ language: string, url: string }>;
  width: number;
  markers?: number[];
  comments?: PostType[];
  setPlayer?: (v: VideoJsPlayer) => void;
}

const DashPlayer: React.FC<DashPlayerProps> = (props) => {
  const playerNode = useRef<HTMLDivElement>(null);
  const videoNode = useRef<HTMLVideoElement>(null);
  const [ video, setVideo ] = useState<VideoJsPlayer>();
  const [ componentContainer, setComponentContainer ] = useState<vjsReactionComments>();
  const { manifest, width, subtitles, markers, setPlayer, comments } = props;

  useEffect(() => {
    if (videoNode === null) {
      return;
    }

    const player = videojs(videoNode.current, { width, autoplay: true, controls: true }, () => {
      player.src({
        src: manifest,
        type: "application/dash+xml"
      });

      setVideo(player);

      addComments(comments);

      if (markers) {
        player.on("loadedmetadata", () => {
          createMarkers(markers);
        });
      }

      setPlayer && setPlayer(player);
    });

    return () => {
      player.dispose();
    };
  }, [manifest]);

  useEffect(() => {
    addComments(comments);
    createMarkers(markers);
  }, [comments?.length]);

  const addComments = (comments?: PostType[]) => {
    if (video) {
      if (componentContainer) {
        video.removeChild(componentContainer);
      }
      const reactionContainer = new vjsReactionComments(video, { comments });
      video.addChild(reactionContainer);
      setComponentContainer(reactionContainer);
    }
  };

  const createMarkers = (seconds?: number[]) => {
    if (video && seconds) {
      seconds.map(second => {
        const marker = document.createElement("div");
        marker.style.width = `${second * 100 / video.duration()}%`;
        marker.className = "video-marker";

        playerNode.current?.querySelector(".vjs-progress-holder")?.appendChild(marker);
      });
    }
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
