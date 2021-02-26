import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { MediaPlayer } from "dashjs";
import classNames from "classnames";

import { PostType } from "./post/post";
import { EmojiReaction } from "../util";
import { VideoInteractionTracker } from "../video_interaction_tracker";

interface DashPlayerProps {
  manifest: string;
  subtitles: Array<{ language: string, url: string }>;
  width?: number;
  comments?: PostType[];
  emojis?: EmojiReaction[];
  videoId?: string;
  onTimeUpdate?: (currentTime: number, duration: number, isPlaying: boolean) => void;
  videoInteractionTracker?: VideoInteractionTracker;
}

const DashPlayer: React.FC<DashPlayerProps> = (props) => {
  const { manifest, subtitles, videoInteractionTracker } = props;

  const playerNode = useRef<HTMLDivElement>(null);
  const videoNode = useRef<HTMLVideoElement>(null);

  const [ isFullscreen, setFullscreen ] = useState(document.fullscreenElement != undefined);
  const [ isPlaying, setPlaying ] = useState(false);

  useEffect(() => {
    if (videoNode.current == null) {
      return;
    }

    const player = MediaPlayer().create();
    player.initialize(videoNode.current, manifest, false);

    if (videoInteractionTracker) {
      player.on("seeked", () => videoInteractionTracker.onSeek(player.time()));
      player.on("ended", () => videoInteractionTracker.onEnd(player.time()));
    }

    const fullscreenChange = () => {
      videoInteractionTracker?.onFullscreen(player.time());
      setFullscreen(document.fullscreenElement != undefined);
    };

    const playbackStarted = () => {
      videoInteractionTracker?.onPlay(player.time());
      setPlaying(true);
    };

    const playbackPaused = () => {
      videoInteractionTracker?.onPause(player.time());
      setPlaying(false);
    };

    document.addEventListener("fullscreenchange", fullscreenChange);
    videoNode.current.addEventListener("play", playbackStarted);
    videoNode.current.addEventListener("pause", playbackPaused);

    return () => {
      document.removeEventListener("fullscreenchange", fullscreenChange);
      videoNode.current?.removeEventListener("play", playbackStarted);
      videoNode.current?.removeEventListener("pause", playbackPaused);

      player.reset();
    };
  }, [manifest]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      playerNode.current?.requestFullscreen();
    }
  };

  const togglePlayback = () => {
    if (!videoNode.current) {
      return;
    }

    if (videoNode.current.paused) {
      videoNode.current.play();
    } else {
      videoNode.current.pause();
    }
  };

  return (
    <div ref={playerNode} style={{ position: "relative" }}>
      <video autoPlay={false} ref={videoNode} style={{ width: "100%", height: "100%" }}>
        {subtitles.map((s, i) => {
          return (
            <track key={i} src={s.url} label={s.language} srcLang={s.language} default={true} />
          );
        })}
      </video>
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 50, backgroundColor: "rgba(0, 0, 0, 0.7)", color: "#FFFFFF" }}>
        <span onClick={togglePlayback} className="icon">
          <i className={classNames("fas", { "fa-pause": isPlaying, "fa-play": !isPlaying })} />
        </span>
        &emsp;
        <span onClick={toggleFullscreen} className="icon">
          <i className={classNames("fas", { "fa-compress": isFullscreen, "fa-expand": !isFullscreen })} />
        </span>
      </div>
    </div>
  );
};

export default DashPlayer;
