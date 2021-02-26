import * as React from "react";
import { useState, useEffect } from "react";
import { PostType } from "./post/post";
import { Trans } from "react-i18next";

import { EmojiReaction } from "../util";
import { MultimediaItem } from "./post/post";

import Video from "./video";

interface VideoWithToolbarProps {
  mediaItem: MultimediaItem;
  markers?: number[];
  comments?: PostType[];
  emojis?: EmojiReaction[];
}

const EMOJIS = ["👍","💓","😊","😍","😂","😡"];

const VideoWithToolbar: React.FC<VideoWithToolbarProps> = (props) => {
  const { mediaItem } = props;
  const videoId = mediaItem.id;

  const [ viewCount, setViewCount ] = useState<number>();
  const [ emojiReactions ] = useState(mediaItem.emojiReactions.map(({ emoji, second }) => {
    return { emoji, second };
  }));

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
  }, []);

  return (
    <>
      <Video {...props} id={mediaItem.id} emojis={emojiReactions} />

      <nav className="level is-mobile" style={{position: "relative"}}>
        <div className="level-left">
          <div className="level-item">
            {EMOJIS.map((emoji, index) => {
              return (
                <button key={index} className="emoji-item" onClick={() => {}}>{emoji}</button>
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
    </>
  );
};

export default VideoWithToolbar;
