import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import DashPlayer from "./dash_player";
import { PostType } from "./post/post";
import { EmojiReaction } from "../util";
import BlankVideo from "./blank_video";
import useInterval from "./use_interval";
import { UserVideoInteractionTracker } from "../video_interaction_tracker";

interface VideoProps {
  id?: string;
  markers?: number[];
  comments?: PostType[];
  emojis?: EmojiReaction[];
}

const Video: React.FC<VideoProps> = (props) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { id: idAttribute, comments, emojis } = props;
  const idVideo = idAttribute ? idAttribute : id;

  const totalPlayTime = useRef(0);
  const lastTimestamp = useRef(0);
  const viewCounted = useRef(false);

  const [ videoUrl, setVideoUrl ] = useState<string | undefined>(undefined);
  const [ availableSubtitles, setAvailableSubtitles ] = useState<Array<{ language: string, url: string }>>([]);
  const [ videoStatus, setVideoStatus ] = useState<string | undefined>();

  const fetchVideo = () => {
    fetch(`/media/${idVideo}/status`).then((res) => {
      return res.json();
    }).then(({ status }) => {
      setVideoStatus(status);

      if (status == "done") {
        fetch(`/media/${idVideo}/subtitles`).then((res) => {
          return res.json();
        }).then((data) => {
          setAvailableSubtitles(data.map((s: any) => {
            return {
              language: s.language,
              url: `/media/subtitles/${s.id}`
            };
          }));

          return fetch(`/media/${idVideo}`);
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
      fetch(`/media/${idVideo}/view`, { method: "POST" });
    }

    if (isPlaying) {
      totalPlayTime.current += time - lastTimestamp.current;

      if (totalPlayTime.current >= 30) {
        viewCounted.current = true;
        fetch(`/media/${idVideo}/view`, { method: "POST" });
      }
    }

    lastTimestamp.current = time;
  };

  useEffect(fetchVideo, [idVideo]);
  useInterval(fetchVideo, (videoStatus == "processing") ? 3000 : null);

  if (videoStatus === "done") {
    return (
      <div>
        {videoUrl ? (
          <DashPlayer
            manifest={videoUrl}
            subtitles={availableSubtitles}
            comments={comments}
            emojis={emojis}
            videoId={idVideo}
            onTimeUpdate={countView}
            videoInteractionTracker={new UserVideoInteractionTracker(`/media/${idVideo}/interaction`)}
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
