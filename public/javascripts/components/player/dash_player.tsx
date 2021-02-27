import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { MediaPlayer } from "dashjs";

import { PostType } from "../post/post";
import { activateSubtitleTrack, disableSubtitles, EmojiReaction } from "../../util";
import { VideoInteractionTracker } from "../../video_interaction_tracker";
import TranslationButton from "./translation_button";
import ControlBarToggle from "./control_bar_toggle";
import SeekBar from "./seek_bar";
import TimeCode from "./time_code";

export interface TimelineEmoji extends EmojiReaction {
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
  type?: "video" | "audio";
}

const DashPlayer: React.FC<DashPlayerProps> = (props) => {
  const { manifest, videoId, videoInteractionTracker, emojis, onTimeUpdate, type = "video" } = props;

  const wrapperNode = useRef<HTMLDivElement>(null);
  const videoNode = useRef<HTMLVideoElement>(null);

  const [ isFullscreen, setFullscreen ] = useState(document.fullscreenElement != undefined);
  const [ isPlaying, setPlaying ] = useState(false);
  const [ progress, setProgress ] = useState(0);
  const [ time, setTime ] = useState(0);
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

      setTime(player.time());
      setProgress(player.time() / player.duration());
    };

    document.addEventListener("fullscreenchange", fullscreenChange);

    videoNode.current.addEventListener("play", playbackStarted);
    videoNode.current.addEventListener("pause", playbackPaused);
    videoNode.current.addEventListener("timeupdate", videoProgress);
    videoNode.current.addEventListener("seeked", videoSeeked);
    videoNode.current.addEventListener("ended", videoEnded);

    videoNode.current.addEventListener("loadedmetadata", placeEmojis);
    videoNode.current.addEventListener("timeupdate", updateAnimatedEmojis);

    return () => {
      document.removeEventListener("fullscreenchange", fullscreenChange);

      if (videoNode.current) {
        videoNode.current.removeEventListener("play", playbackStarted);
        videoNode.current.removeEventListener("pause", playbackPaused);
        videoNode.current.removeEventListener("timeupdate", videoProgress);
        videoNode.current.removeEventListener("seeked", videoSeeked);
        videoNode.current.removeEventListener("ended", videoEnded);
        videoNode.current.removeEventListener("loadedmetadata", placeEmojis);
        videoNode.current.removeEventListener("timeupdate", updateAnimatedEmojis);
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

  const seekPlayer = (progress: number) => {
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
      videoInteractionTracker?.onTrackChanged(videoNode.current.currentTime, languageCode);
      activateSubtitleTrack(videoNode.current, languageCode);
    }
  };

  const handleDisableSubtitles = () => {
    if (videoNode.current) {
      videoInteractionTracker?.onTrackChanged(videoNode.current.currentTime, "");
      disableSubtitles(videoNode.current);
    }
  };

  return (
    <div ref={wrapperNode} className="dash-player">
      {(type == "video") ? (
        <video autoPlay={false} ref={videoNode}>
          {subtitles.map((s, i) => {
            return (
              <track key={s.url} src={s.url} label={s.language} srcLang={s.language} />
            );
          })}
        </video>
      ) : (
        <audio autoPlay={false} ref={videoNode}>
          {subtitles.map((s, i) => {
            return (
              <track key={s.url} src={s.url} label={s.language} srcLang={s.language} />
            );
          })}
        </audio>
      )}

      <div className="controlbar">
        <ControlBarToggle
          onButtonToggled={togglePlayback}
          isToggled={isPlaying}
          icons={["fa-pause", "fa-play"]}
        />

        <SeekBar
          progress={progress}
          onSeek={seekPlayer}
          timelineEmojis={timelineEmojis}
        />

        <TimeCode time={time} />

        <TranslationButton
          videoId={videoId}
          onTranslationSuccess={handleTranslationSuccess}
          onSubtitlesDisabled={handleDisableSubtitles}
        />

        <ControlBarToggle
          onButtonToggled={toggleFullscreen}
          isToggled={isFullscreen}
          icons={["fa-compress", "fa-expand"]}
        />

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
