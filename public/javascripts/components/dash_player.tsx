import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { MediaPlayer } from "dashjs";
import classNames from "classnames";

import { PostType } from "./post/post";
import { activateSubtitleTrack, EmojiReaction } from "../util";
import { VideoInteractionTracker } from "../video_interaction_tracker";
import TranslationButton from "./videojs/translation_button";

interface TimelineEmoji extends EmojiReaction {
  progressPosition: number;
}

interface Subtitles {
  language: string;
  url: string;
}

interface DashPlayerProps {
  manifest: string;
  subtitles: Array<Subtitles>;
  width?: number;
  comments?: PostType[];
  emojis?: EmojiReaction[];
  videoId: string;
  onTimeUpdate?: (currentTime: number, duration: number, isPlaying: boolean) => void;
  videoInteractionTracker?: VideoInteractionTracker;
}

const DashPlayer: React.FC<DashPlayerProps> = (props) => {
  const { manifest, videoId, videoInteractionTracker, emojis, onTimeUpdate } = props;

  const wrapperNode = useRef<HTMLDivElement>(null);
  const videoNode = useRef<HTMLVideoElement>(null);

  const [ isFullscreen, setFullscreen ] = useState(document.fullscreenElement != undefined);
  const [ isPlaying, setPlaying ] = useState(false);
  const [ progress, setProgress ] = useState(0);
  const [ timelineEmojis, setTimelineEmojis ] = useState<Array<TimelineEmoji>>([]);
  const [ animatedEmojis, setAnimatedEmojis ] = useState<Array<EmojiReaction>>([]);
  const [ subtitles, setSubtitles ] = useState<Array<Subtitles>>([]);

  const placeEmojis = () => {
    if (emojis) {
      setTimelineEmojis(emojis.map((emoji) => {
        return {
          ...emoji,
          progressPosition: emoji.second * 100 / videoNode.current?.duration!
        };
      }));
    }
  };

  const updateAnimatedEmojis = () => {
    if (emojis) {
      const time = videoNode.current?.currentTime!;

      setAnimatedEmojis(emojis.filter(({ second }) => {
        return time >= second - 0.25 && time <= second + 0.25;
      }));
    }
  };

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
    };

    const videoEnded = () => {
      videoInteractionTracker?.onEnd(player.time());
    };

    const videoProgress = () => {
      onTimeUpdate?.(player.time(), player.duration(), !player.isPaused());
      setProgress(player.time() / player.duration());
    };

    document.addEventListener("fullscreenchange", fullscreenChange);

    videoNode.current.addEventListener("play", playbackStarted);
    videoNode.current.addEventListener("pause", playbackPaused);
    videoNode.current.addEventListener("timeupdate", videoProgress);
    videoNode.current.addEventListener("seeked", videoSeeked);
    videoNode.current.addEventListener("ended", videoEnded);

    videoNode.current?.addEventListener("loadedmetadata", placeEmojis);
    videoNode.current?.addEventListener("timeupdate", updateAnimatedEmojis);

    return () => {
      document.removeEventListener("fullscreenchange", fullscreenChange);

      if (videoNode.current) {
        videoNode.current.removeEventListener("play", playbackStarted);
        videoNode.current.removeEventListener("pause", playbackPaused);
        videoNode.current.removeEventListener("timeupdate", videoProgress);
        videoNode.current.removeEventListener("seeked", videoSeeked);
        videoNode.current.removeEventListener("ended", videoEnded);
      }

      player.reset();
    };
  }, [manifest]);

  useEffect(() => {
    placeEmojis();
    updateAnimatedEmojis();
  }, [emojis]);

  useEffect(() => {
    setSubtitles(props.subtitles.map((s, i) => (i == 0) ? { ...s, active: true } : s));
  }, [props.subtitles]);

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

  const handleTranslationSuccess = (languageCode: string, subtitleId: string) => {
    setSubtitles([
      {
        language: languageCode,
        url: `/media/subtitles/${subtitleId}`
      }
    ]);

    if (videoNode.current) {
      activateSubtitleTrack(videoNode.current, languageCode);
    }
  };

  return (
    <div ref={wrapperNode} style={{ position: "relative" }}>
      <video autoPlay={false} ref={videoNode} style={{ width: "100%", height: "100%" }}>
        {subtitles.map((s, i) => {
          return (
            <track key={s.url} src={s.url} label={s.language} srcLang={s.language} />
          );
        })}
      </video>

      <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 24, backgroundColor: "rgba(0, 0, 0, 0.7)", color: "#FFFFFF", display: "flex" }}>
        <span style={{ width: 50, cursor: "pointer" }} onClick={togglePlayback} className="icon">
          <i className={classNames("fas", { "fa-pause": isPlaying, "fa-play": !isPlaying })} />
        </span>

        <div style={{ position: "relative", flexGrow: 1, cursor: "pointer", borderLeft: "1px solid #555555", borderRight: "1px solid #555555" }} onClick={seekPlayer}>
          <div style={{ position: "absolute", height: "100%", width: `${progress * 100}%`, backgroundColor: "rgba(255, 255, 255, 0.7)"}} />

          {timelineEmojis.map(({ progressPosition, emoji }, i) => {
            return (
              <span key={i} className="video-marker" style={{ left: `${progressPosition}%`}}>{emoji}</span>
            );
          })}
        </div>

        <TranslationButton
          videoId={videoId}
          onTranslationSuccess={handleTranslationSuccess}
        />

        <span style={{ width: 40, cursor: "pointer" }} onClick={toggleFullscreen} className="icon">
          <i className={classNames("fas", { "fa-compress": isFullscreen, "fa-expand": !isFullscreen })} />
        </span>

        {animatedEmojis.map(({emoji, second}) => {
          return (
            <span key={second} className="emoji-animation">{emoji}</span>
          );
        })}
      </div>
    </div>
  );
};

export default DashPlayer;
