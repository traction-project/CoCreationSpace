import * as React from "react";
import { useEffect, useRef, useState } from "react";

import { PostType } from "../post/post";
import { activateSubtitleTrack, disableSubtitles, EmojiReaction, supportsDash } from "../../util";
import { VideoInteractionTracker } from "../../video_interaction_tracker";
import TranslationButton from "./translation_button";
import ControlBarToggle from "./control_bar_toggle";
import SeekBar from "./seek_bar";
import TimeCode from "./time_code";
import AudioVisualiser from "./audio_visualiser";

export interface TimelineEmoji extends EmojiReaction {
  progressPosition: number;
}

export interface TimelineComment extends PostType {
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
  startTime?: number;
}

const DashPlayer: React.FC<DashPlayerProps> = (props) => {
  const { manifest, videoId, videoInteractionTracker, emojis, comments, onTimeUpdate, type = "video", startTime = 0 } = props;

  const wrapperNode = useRef<HTMLDivElement>(null);
  const videoNode = useRef<HTMLVideoElement>(null);

  const [ isFullscreen, setFullscreen ] = useState(document.fullscreenElement != undefined);
  const [ isPlaying, setPlaying ] = useState(false);
  const [ progress, setProgress ] = useState(0);
  const [ time, setTime ] = useState(0);
  const [ subtitles, setSubtitles ] = useState<Array<Subtitles>>([]);

  const [ timelineEmojis, setTimelineEmojis ] = useState<Array<TimelineEmoji>>([]);
  const [ animatedEmojis, setAnimatedEmojis ] = useState<Array<EmojiReaction>>([]);
  const [ timelineComments, setTimelineComments ] = useState<Array<TimelineComment>>([]);

  const placeMarkers = () => {
    if (emojis) {
      setTimelineEmojis(emojis.map((emoji) => {
        return {
          ...emoji,
          progressPosition: emoji.second * 100 / videoNode.current?.duration!
        };
      }));
    }

    if (comments) {
      setTimelineComments(comments.map((comment) => {
        return {
          ...comment,
          progressPosition: comment.second! * 100 / videoNode.current?.duration!
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

    let player: any | undefined;

    if (supportsDash()) {
      import("dashjs").then(({ MediaPlayer }) => {
        player = MediaPlayer().create();
        player.initialize(videoNode.current!, manifest, false);

        console.log("Setting up DASH player");
      });
    } else {
      const hlsManifest = manifest.replace(/\.mpd$/, ".m3u8");
      videoNode.current.src = hlsManifest;

      console.log("Setting up HLS player with manifest", hlsManifest);
    }

    const fullscreenChange = () => {
      videoInteractionTracker?.onFullscreen(videoNode.current?.currentTime || 0);
      setFullscreen(document.fullscreenElement != undefined);
    };

    const playbackStarted = () => {
      videoInteractionTracker?.onPlay(videoNode.current?.currentTime || 0);
      setPlaying(true);
    };

    const playbackPaused = () => {
      videoInteractionTracker?.onPause(videoNode.current?.currentTime || 0);
      setPlaying(false);
    };

    const videoSeeked = () => {
      videoInteractionTracker?.onSeek(videoNode.current?.currentTime || 0);
    };

    const videoEnded = () => {
      videoInteractionTracker?.onEnd(videoNode.current?.currentTime || 0);
    };

    const videoProgress = () => {
      onTimeUpdate?.(
        videoNode.current?.currentTime || 0,
        videoNode.current?.duration || 0,
        !videoNode.current?.paused
      );

      setTime(videoNode.current?.currentTime || 0);
      setProgress(
        (videoNode.current?.currentTime || 0) / (videoNode.current?.duration || 1)
      );
    };

    document.addEventListener("fullscreenchange", fullscreenChange);

    videoNode.current.addEventListener("play", playbackStarted);
    videoNode.current.addEventListener("pause", playbackPaused);
    videoNode.current.addEventListener("timeupdate", videoProgress);
    videoNode.current.addEventListener("seeked", videoSeeked);
    videoNode.current.addEventListener("ended", videoEnded);

    videoNode.current.addEventListener("loadedmetadata", placeMarkers);
    videoNode.current.addEventListener("timeupdate", updateAnimatedEmojis);

    return () => {
      document.removeEventListener("fullscreenchange", fullscreenChange);

      if (videoNode.current) {
        videoNode.current.removeEventListener("play", playbackStarted);
        videoNode.current.removeEventListener("pause", playbackPaused);
        videoNode.current.removeEventListener("timeupdate", videoProgress);
        videoNode.current.removeEventListener("seeked", videoSeeked);
        videoNode.current.removeEventListener("ended", videoEnded);
        videoNode.current.removeEventListener("loadedmetadata", placeMarkers);
        videoNode.current.removeEventListener("timeupdate", updateAnimatedEmojis);
      }

      player?.reset();
    };
  }, [manifest]);

  useEffect(() => {
    placeMarkers();
    updateAnimatedEmojis();
  }, [emojis, comments]);

  useEffect(() => {
    if (videoNode.current) {
      videoNode.current.currentTime = startTime;
    }
  }, [startTime]);

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
        <video autoPlay={false} ref={videoNode} onClick={togglePlayback}>
          {subtitles.map((s, i) => {
            return (
              <track key={s.url} src={s.url} label={s.language} srcLang={s.language} />
            );
          })}
        </video>
      ) : (
        <>
          <AudioVisualiser audioRef={videoNode} />
          <audio autoPlay={false} ref={videoNode}>
            {subtitles.map((s, i) => {
              return (
                <track key={s.url} src={s.url} label={s.language} srcLang={s.language} />
              );
            })}
          </audio>
        </>
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
          timelineComments={timelineComments}
        />

        <TimeCode
          time={time}
          duration={videoNode.current?.duration}
        />

        {(subtitles.length > 0) && (
          <TranslationButton
            videoId={videoId}
            onTranslationSuccess={handleTranslationSuccess}
            onSubtitlesDisabled={handleDisableSubtitles}
          />
        )}

        {(type == "video") && (
          <ControlBarToggle
            onButtonToggled={toggleFullscreen}
            isToggled={isFullscreen}
            icons={["fa-compress", "fa-expand"]}
          />
        )}

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
