import * as React from "react";
import { useEffect, useRef } from "react";
import { MediaPlayer } from "dashjs";

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
  const playerNode = useRef<HTMLDivElement>(null);
  const videoNode = useRef<HTMLVideoElement>(null);

  const { manifest, subtitles, videoInteractionTracker } = props;

  useEffect(() => {
    if (videoNode.current === null) {
      return;
    }

    const player = MediaPlayer().create();
    player.initialize(videoNode.current, manifest, false);

    if (videoInteractionTracker) {
      player.on("play", () => videoInteractionTracker.onPlay(player.time()));
      player.on("pause", () => videoInteractionTracker.onPause(player.time()));
      player.on("seeked", () => videoInteractionTracker.onSeek(player.time()));
      player.on("ended", () => videoInteractionTracker.onEnd(player.time()));
      player.on("fullscreenchange", () => videoInteractionTracker.onFullscreen(player.time()));
    }

    return () => {
      player && player.reset();
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
        <span onClick={togglePlayback}>Play/Pause</span>
        &emsp;
        <span onClick={toggleFullscreen}>Fullscreen</span>
      </div>
    </div>
  );
};

export default DashPlayer;
