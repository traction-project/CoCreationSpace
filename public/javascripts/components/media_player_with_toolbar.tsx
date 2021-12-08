import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Trans } from "react-i18next";

import { postEmojiReaction } from "../services/multimedia.service";
import { EmojiReaction } from "../util";
import { PostType } from "./post/post";
import { VideoChapter } from "./media_player_with_chapters";
import MediaPlayer from "./media_player";
import ChapterList from "./chapter_list";

interface MediaPlayerWithToolbarProps {
  id: string;
  emojis: Array<EmojiReaction>;
  comments: Array<PostType>;
  videoChapters: Array<VideoChapter>;
  onTimeUpdate?: (currentTime: number) => void;
  type?: "video" | "audio";
  startTime?: number;
}

const EMOJIS = ["👍","💓","😊","😍","😂","😡"];

const MediaPlayerWithToolbar: React.FC<MediaPlayerWithToolbarProps> = (props) => {
  const { id: videoId, emojis, comments, videoChapters, onTimeUpdate, type = "video" } = props;

  const currentVideoTime = useRef(0);
  const [ viewCount, setViewCount ] = useState<number>();
  const [ emojiReactions, setEmojiReactions ] = useState(emojis);
  const [ startTime, setStartTime ] = useState(0);

  useEffect(() => {
    setEmojiReactions(emojis);
  }, [emojis]);

  useEffect(() => {
    if (videoId) {
      fetch(`/media/${videoId}/views`).then((res) => {
        if (res.ok) {
          return res.json();
        }
      }).then(({ views }) => {
        setViewCount(views);
      });
    }
  }, [videoId]);

  useEffect(() => {
    props.startTime && setStartTime(props.startTime);
  }, [props.startTime]);

  const handleClickEmojiItem = async (emoji: string) => {
    const response = await postEmojiReaction(videoId, emoji, currentVideoTime.current);

    if (response.ok) {
      const data = await response.json();
      const reaction: EmojiReaction = {
        emoji: data.emoji,
        second: data.second
      };

      const reactions = [
        reaction,
        ...emojiReactions
      ];

      setEmojiReactions(reactions);
    }
  };

  return (
    <>
      <MediaPlayer
        id={videoId}
        emojis={emojiReactions}
        comments={comments}
        onTimeUpdate={(time) => {
          onTimeUpdate?.(time);
          currentVideoTime.current = time;
        }}
        type={type}
        startTime={startTime}
      />

      <nav className="level is-mobile" style={{position: "relative"}}>
        <div className="level-left">
          <div className="level-item">
            {EMOJIS.map((emoji, index) => {
              return (
                <button key={index} className="emoji-item" onClick={handleClickEmojiItem.bind(null, emoji)}>{emoji}</button>
              );
            })}
          </div>
        </div>

        <div className="level-right">
          <div className="level-item">
            {(viewCount) && (
              <Trans i18nKey="view-count">{{viewCount}} views</Trans>
            )}
          </div>
        </div>
      </nav>

      <ChapterList
        chapters={videoChapters}
        onChapterClicked={(startTime) => setStartTime(startTime)}
      />
    </>
  );
};

export default MediaPlayerWithToolbar;
