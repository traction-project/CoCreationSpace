import * as React from "react";
import { useState, useEffect } from "react";
import { VideoJsPlayer } from "video.js";
import { PostType } from "./post/post";
import { Trans } from "react-i18next";

import { postEmojiReaction } from "../services/multimedia.service";
import { addEmojiAnimation } from "./videojs/util";
import { EmojiReaction } from "../util";
import { MultimediaItem } from "./post/post";

import Video from "./video";

interface VideoWithToolbarProps {
  mediaItem: MultimediaItem;
  markers?: number[];
  comments?: PostType[];
  emojis?: EmojiReaction[];
  getPlayer?: (v: VideoJsPlayer) => void;
}

const EMOJIS = ["👍","💓","😊","😍","😂","😡"];

const VideoWithToolbar: React.FC<VideoWithToolbarProps> = (props) => {
  const { mediaItem } = props;
  const videoId = mediaItem.id;

  const [ player, setPlayer ] = useState<VideoJsPlayer>();
  const [ viewCount, setViewCount ] = useState<number>();
  const [ emojiReactions, setEmojiReactions ] = useState(mediaItem.emojiReactions.map(({ emoji, second }) => {
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

  const handleClickEmojiItem = async (emoji: string) => {
    if (player && videoId) {
      const second = player.currentTime();
      const response = await postEmojiReaction(videoId, emoji, second);

      if (response.ok) {
        const data = await response.json();
        const reaction: EmojiReaction = {
          emoji: data.emoji,
          second: data.second
        };

        addEmojiAnimation(player, reaction);

        const reactions = [
          reaction,
          ...emojiReactions
        ];

        setEmojiReactions(reactions);
      }
    }
  };

  const callbackPlayer = async (newPlayer: VideoJsPlayer) => {
    setPlayer(newPlayer);
    props.getPlayer?.(newPlayer);
  };

  return (
    <>
      <Video {...props} id={mediaItem.id} getPlayer={callbackPlayer} emojis={emojiReactions} />

      <nav className="level is-mobile" style={{position: "relative"}}>
        <div className="level-left">
          <div className="level-item">
            {EMOJIS.map((emoji, index) => {
              return (
                <button key={index} className="emoji-item" onClick={() => handleClickEmojiItem(emoji)}>{emoji}</button>
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
