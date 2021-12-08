import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import usePortal from "react-useportal";

import DashPlayer from "./player/dash_player";
import BlankVideo from "./blank_video";
import useInterval from "./use_interval";
import { UserVideoInteractionTracker } from "../video_interaction_tracker";
import { EmojiReaction } from "javascripts/util";
import { PostType } from "./post/post";
import { VideoChapter } from "./media_player_with_chapters";
import AddChapterIcon from "./player/add_chapter_icon";
import AddChapterModal from "./player/add_chapter_modal";

interface MediaPlayerProps {
  id: string;
  emojis?: Array<EmojiReaction>;
  comments?: Array<PostType>;
  type?: "video" | "audio";
  startTime?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onChapterAdded?: (chapter: VideoChapter) => void;
}

const MediaPlayer: React.FC<MediaPlayerProps> = (props) => {
  const { t } = useTranslation();
  const { ref, isOpen, openPortal, closePortal, Portal } = usePortal();
  const { id, emojis, comments, onTimeUpdate, startTime, type = "video", onChapterAdded } = props;

  const totalPlayTime = useRef(0);
  const lastTimestamp = useRef(0);
  const currentTime = useRef(0);
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

    currentTime.current = time;
  };

  useEffect(fetchVideo, [id]);
  useInterval(fetchVideo, (videoStatus == "processing") ? 3000 : null);

  if (videoStatus === "done") {
    return (
      <div>
        {videoUrl ? (
          <>
            <DashPlayer
              manifest={videoUrl}
              subtitles={availableSubtitles}
              videoId={id}
              emojis={emojis}
              comments={comments}
              onTimeUpdate={timeUpdate}
              type={type}
              startTime={startTime}
              videoInteractionTracker={new UserVideoInteractionTracker(`/media/${id}/interaction`)}
            />

            {(onChapterAdded != undefined) && (
              <div ref={ref}>
                <AddChapterIcon onClick={openPortal} />
              </div>
            )}
          </>
        ) : (
          <BlankVideo />
        )}

        {isOpen && (
          <Portal>
            <AddChapterModal
              mediaItemId={id}
              startTime={currentTime.current}
              onClose={closePortal}
              onChapterAdded={onChapterAdded}
            />
          </Portal>
        )}
      </div>
    );
  } else {
    return (
      <BlankVideo message={videoStatus && t(videoStatus)} />
    );
  }
};

export default MediaPlayer;
