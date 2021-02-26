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

  const wrapperNode = useRef<HTMLDivElement>(null);
  const videoNode = useRef<HTMLVideoElement>(null);

  const [ isFullscreen, setFullscreen ] = useState(document.fullscreenElement != undefined);
  const [ isPlaying, setPlaying ] = useState(false);
  const [ progress, setProgress ] = useState(0);

  useEffect(() => {
    if (videoNode.current == null) {
      return;
    }

    setProgress(0);
    setPlaying(false);
    setFullscreen(false);

    const player = MediaPlayer().create();
    player.initialize(videoNode.current, manifest, false);

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

    const videoSeeked = () => {
      videoInteractionTracker?.onSeek(player.time());
    }

    const videoProgress = () => {
      setProgress(player.time() / player.duration());
    };

    document.addEventListener("fullscreenchange", fullscreenChange);

    videoNode.current.addEventListener("play", playbackStarted);
    videoNode.current.addEventListener("pause", playbackPaused);
    videoNode.current.addEventListener("timeupdate", videoProgress);
    videoNode.current.addEventListener("seeked", videoSeeked);

    return () => {
      document.removeEventListener("fullscreenchange", fullscreenChange);

      if (videoNode.current) {
        videoNode.current.removeEventListener("play", playbackStarted);
        videoNode.current.removeEventListener("pause", playbackPaused);
        videoNode.current.removeEventListener("timeupdate", videoProgress);
        videoNode.current.removeEventListener("seeked", videoSeeked);
      }

      player.reset();
    };
  }, [manifest]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      wrapperNode.current?.requestFullscreen();
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

  const seekPlayer = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.pageX - rect.left;

    const progress = x / rect.width;

    if (videoNode.current) {
      videoNode.current.currentTime = progress * videoNode.current.duration;
    }
  };

  return (
    <div ref={wrapperNode} style={{ position: "relative" }}>
      <video autoPlay={false} ref={videoNode} style={{ width: "100%", height: "100%" }}>
        {subtitles.map((s, i) => {
          return (
            <track key={i} src={s.url} label={s.language} srcLang={s.language} default={true} />
          );
        })}
      </video>
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 25, backgroundColor: "rgba(0, 0, 0, 0.7)", color: "#FFFFFF", display: "flex" }}>
        <span style={{ width: 50 }} onClick={togglePlayback} className="icon">
          <i className={classNames("fas", { "fa-pause": isPlaying, "fa-play": !isPlaying })} />
        </span>
        <div style={{ flexGrow: 1 }} onClick={seekPlayer}>
          <div style={{ height: "100%", width: `${progress * 100}%`, backgroundColor: "rgba(255, 255, 255, 0.7)"}} />
        </div>
        <span style={{ width: 50 }} onClick={toggleFullscreen} className="icon">
          <i className={classNames("fas", { "fa-compress": isFullscreen, "fa-expand": !isFullscreen })} />
        </span>
      </div>
    </div>
  );
};

export default DashPlayer;
