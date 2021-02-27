import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import DashPlayer from "./player/dash_player";
import BlankVideo from "./blank_video";
import useInterval from "./use_interval";
import { UserVideoInteractionTracker } from "../video_interaction_tracker";
import { EmojiReaction } from "javascripts/util";

interface VideoProps {
  id: string;
  emojis?: Array<EmojiReaction>;
  onTimeUpdate?: (currentTime: number) => void;
  type?: "video" | "audio";
}

const Video: React.FC<VideoProps> = (props) => {
  const { t } = useTranslation();
  const { id, emojis, onTimeUpdate, type = "video" } = props;

  const totalPlayTime = useRef(0);
  const lastTimestamp = useRef(0);
  const viewCounted = useRef(false);

  const [ videoUrl, setVideoUrl ] = useState<string | undefined>(undefined);
  const [ availableSubtitles, setAvailableSubtitles ] = useState<Array<{ language: string, url: string }>>([]);
  const [ videoStatus, setVideoStatus ] = useState<string | undefined>();

  const fetchVideo = () => {
    fetch(`/media/${id}/status`).then((res) => {
      return res.json();
    }).then(({ status }) => {
      setVideoStatus(status);

      if (status == "done") {
        fetch(`/media/${id}/subtitles`).then((res) => {
          return res.json();
        }).then((data) => {
          setAvailableSubtitles(data.map((s: any) => {
            return {
              language: s.language,
              url: `/media/subtitles/${s.id}`
            };
          }));

          return fetch(`/media/${id}`);
        }).then(async (res) => {
          if (res.ok) {
            const data = await res.json();

            setVideoUrl(data.manifest);
          }
        });
      }
    });
  };

  const countView = (time: number, duration: number, isPlaying: boolean) => {
    if (viewCounted.current) {
      return;
    }

    if (duration < 30 && time >= duration) {
      viewCounted.current = true;
      fetch(`/media/${id}/view`, { method: "POST" });
    }

    if (isPlaying) {
      totalPlayTime.current += time - lastTimestamp.current;

      if (totalPlayTime.current >= 30) {
        viewCounted.current = true;
        fetch(`/media/${id}/view`, { method: "POST" });
      }
    }

    lastTimestamp.current = time;
  };

  const timeUpdate = (time: number, duration: number, isPlaying: boolean) => {
    countView(time, duration, isPlaying);
    onTimeUpdate?.(time);
  };

  useEffect(fetchVideo, [id]);
  useInterval(fetchVideo, (videoStatus == "processing") ? 3000 : null);

  if (videoStatus === "done") {
    return (
      <div>
        {videoUrl ? (
          <DashPlayer
            manifest={videoUrl}
            subtitles={availableSubtitles}
            videoId={id}
            emojis={emojis}
            onTimeUpdate={timeUpdate}
            type={type}
            videoInteractionTracker={new UserVideoInteractionTracker(`/media/${id}/interaction`)}
          />
        ) : (
          <BlankVideo />
        )}
      </div>
    );
  } else {
    return (
      <BlankVideo message={videoStatus && t(videoStatus)} />
    );
  }
};

export default Video;
