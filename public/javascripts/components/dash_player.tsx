import * as React from "react";
import { useEffect, useRef, useState } from "react";
import videojs, { VideoJsPlayer } from "video.js";

import vjsTooltip from "./videojs/tooltip";
import "videojs-contrib-dash";
import { PostType } from "./post";

interface DashPlayerProps {
  manifest: string;
  subtitles: Array<{ language: string, url: string }>;
  width: number;
  comments?: PostType[];
  getPlayer?: (v: VideoJsPlayer) => void;
}

const DashPlayer: React.FC<DashPlayerProps> = (props) => {
  const playerNode = useRef<HTMLDivElement>(null);
  const videoNode = useRef<HTMLVideoElement>(null);
  const [ player, setPlayer ] = useState<VideoJsPlayer>();
  const { manifest, width, subtitles, comments, getPlayer } = props;

  useEffect(() => {
    if (videoNode === null) {
      return;
    }

    const video = videojs(videoNode.current, { width, autoplay: true, controls: true }, () => {initPlayer(video);});
    setPlayer(video);
    getPlayer && getPlayer(video);

    return () => {
      player && player.dispose();
    };
  }, [manifest]);

  useEffect(() => {
    if (player) {
      const markers = getMarkers();
      createMarkers(player, markers);
      if (comments) {
        player.off("timeupdate");
        player.on("timeupdate", handlePlayerTimeUpdated);
      }
    }
  }, [comments?.length, player]);

  const initPlayer = (video: VideoJsPlayer) => {
    if (video) {
      video.src({
        src: manifest,
        type: "application/dash+xml"
      });

      const markers = getMarkers();
      if (markers) {
        video.on("loadedmetadata", () => {
          createMarkers(video, markers);
        });
      }

      video.play();
    }
  };

  const handlePlayerTimeUpdated = () => {
    console.log(comments);
    if (player && comments) {
      const time = player.currentTime();
      const timeRounded = Math.floor(time);
      const comment = comments.filter((comment) => comment.second && (Math.floor(comment.second) === timeRounded));
      if (comment.length > 0) {
        addTooltip(player, comment[0]);
      }
    }
  };

  const addTooltip = (video: VideoJsPlayer,reaction: PostType): void => {
    if (video && reaction.dataContainer?.text_content) {
      const currentTooltip = video.getChildById("vjsTooltip");

      if (currentTooltip) {
        video.removeChild(currentTooltip);
      }
      const tooltip = new vjsTooltip(video, { username: reaction.user.username, text: reaction.dataContainer.text_content});
      video.addChild(tooltip);
      setTimeout(() => video && video.removeChild(tooltip), 3000);
    }
  };

  const getMarkers = () => {
    let markers = comments?.map(comment => comment.second);
    markers = markers?.filter(marker => marker !== undefined);
    return markers;
  };

  const createMarkers = (video: VideoJsPlayer, seconds?: (number | undefined)[]) => {
    if (video && seconds) {
      seconds.map(second => {
        if (second) {
          const marker = document.createElement("i");
          marker.classList.add("fas");
          marker.classList.add("fa-comment");
          marker.classList.add("video-marker");
          marker.style.left = `${second * 100 / video.duration()}%`;
          playerNode.current?.querySelector(".vjs-progress-holder")?.appendChild(marker);
        }
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
