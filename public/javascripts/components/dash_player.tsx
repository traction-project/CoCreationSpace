import * as React from "react";
import { useEffect, useRef, useState } from "react";
import videojs, { VideoJsPlayer } from "video.js";
import classNames from "classnames";

import "videojs-contrib-dash";

import { PostType } from "./post/post";
import { EmojiReaction } from "../util";
import { addEmojiAnimation, addTooltip, createMarkers } from "./videojs/util";
import { Marker } from "./videojs/types";
import TranslationButton from "./videojs/translation_button";
import { VideoInteractionTracker } from "../video_interaction_tracker";

interface DashPlayerProps {
  manifest: string;
  subtitles: Array<{ language: string, url: string }>;
  width?: number;
  comments?: PostType[];
  emojis?: EmojiReaction[];
  videoId?: string;
  getPlayer?: (v: VideoJsPlayer) => void;
  onTimeUpdate?: (currentTime: number, duration: number, isPlaying: boolean) => void;
  videoInteractionTracker?: VideoInteractionTracker;
}

const DashPlayer: React.FC<DashPlayerProps> = (props) => {
  const playerNode = useRef<HTMLDivElement>(null);
  const videoNode = useRef<HTMLVideoElement>(null);
  const [ player, setPlayer ] = useState<VideoJsPlayer>();
  const [ currentTime, setCurrentTime ] = useState<number>(0);
  const [ currentTimeRounded, setCurrentTimeRounded ] = useState<number>(0);
  const { manifest, width, subtitles, comments, getPlayer, emojis, videoId, onTimeUpdate, videoInteractionTracker } = props;

  useEffect(() => {
    if (videoNode === null) {
      return;
    }

    const video = videojs(videoNode.current, {
      width,
      autoplay: false,
      controls: true,
      controlBar: {
        pictureInPictureToggle: false
      } as any
    }, () => {
      initPlayer(video);
    });

    setPlayer(video);
    getPlayer && getPlayer(video);

    return () => {
      player && player.dispose();
    };
  }, [manifest]);

  useEffect(() => {
    if (player) {
      const markers = getMarkers();
      createMarkers(player, markers, playerNode);

      if (comments || emojis) {
        player.off("timeupdate");
        player.on("timeupdate", handlePlayerTimeUpdated);
      }
    }
  }, [comments?.length, player, emojis]);

  useEffect(() => {
    const timeRounded = Math.floor(currentTime);

    if (currentTimeRounded !== timeRounded) {
      setCurrentTimeRounded(timeRounded);
      addReactions(timeRounded);
    }
  }, [currentTime]);

  const initPlayer = (video: VideoJsPlayer) => {
    if (video) {
      video.src({
        src: manifest,
        type: "application/dash+xml"
      });

      const markers = getMarkers();
      if (markers) {
        video.on("loadedmetadata", () => {
          createMarkers(video, markers, playerNode);
        });
      }

      if (videoId) {
        const translationButton = new TranslationButton(video, videoId, {});
        video.controlBar.addChild(translationButton);
      }

      if (videoInteractionTracker) {
        video.on("play", () => videoInteractionTracker.onPlay(video.currentTime()));
        video.on("pause", () => videoInteractionTracker.onPause(video.currentTime()));
        video.on("seeked", () => videoInteractionTracker.onSeek(video.currentTime()));
        video.on("ended", () => videoInteractionTracker.onEnd(video.currentTime()));
        video.on("fullscreenchange", () => videoInteractionTracker.onFullscreen(video.currentTime()));
      }
    }
  };

  const handlePlayerTimeUpdated = () => {
    if (player) {
      setCurrentTime(player.currentTime());
      onTimeUpdate?.(player.currentTime(), player.duration(), !player.paused());
    }
  };

  const addReactions = (timeRounded: number) => {
    if (player) {
      if (comments) {
        const comment = comments.filter((comment) => comment.second && (Math.floor(comment.second) === timeRounded));

        if (comment.length > 0) {
          addTooltip(player, comment[0]);
        }
      }

      if (emojis) {
        const items = emojis.filter((item) => item.second && (Math.floor(item.second) === timeRounded));

        if (items.length > 0) {
          items.forEach((item, index) => {
            setTimeout(() => addEmojiAnimation(player, item), index * 100);
          });
        }
      }
    }
  };

  const getMarkers = (): Marker[] => {
    let secondsComment = comments?.map(comment => comment.second);
    secondsComment = secondsComment?.filter(second => second !== undefined);

    const markersComment: Marker[] = secondsComment ?
      secondsComment?.map(second => { return { type: "comment", second: second ? second : 0 }; })
      : [];

    const markersEmojis: Marker[] = emojis ?
      emojis?.map(item => { return { type: "emoji", second: item.second, emoji: item.emoji }; })
      : [];

    const markers: Marker[] = [
      ...markersComment,
      ...markersEmojis
    ];

    return markers;
  };

  return (
    <div ref={playerNode} data-vjs-player>
      <video autoPlay={false} disablePictureInPicture={true} ref={videoNode} className={classNames("video-js", "vjs-16-9", "vjs-big-play-centered", { "vjs-fill": width == undefined })}>
        {subtitles.map((s, i) => {
          return (
            <track key={i} src={s.url} label={s.language} srcLang={s.language} default={true} />
          );
        })}
      </video>
    </div>
  );
};

export default DashPlayer;
