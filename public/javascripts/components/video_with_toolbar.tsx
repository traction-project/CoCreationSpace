import * as React from "react";
import { useState } from "react";
import { VideoJsPlayer } from "video.js";
import { PostType } from "./post/post";

import { postEmojiReaction } from "../services/post.service";
import { addEmojiAnimation } from "./videojs/util";
import { EmojiReaction } from "../util";

import Video from "./video";

interface VideoWithToolbarProps {
  post: PostType;
  id?: string;
  markers?: number[];
  comments?: PostType[];
  emojis?: EmojiReaction[];
  getPlayer?: (v: VideoJsPlayer) => void;
}

const EMOJIS = ["👍","💓","😊","😍","😂","😡"];

const VideoWithToolbar: React.FC<VideoWithToolbarProps> = (props) => {
  const { post } = props;

  const [player, setPlayer] = useState<VideoJsPlayer>();
  const [emojiReactions, setEmojiReactions] = useState<EmojiReaction[]>((post as any).emojiReactions.map(({ emoji, second }: EmojiReaction) => {
    return { emoji, second };
  }));

  const handleClickEmojiItem = async (emoji: string) => {
    if (player) {
      const second = player.currentTime();
      const response = await postEmojiReaction(post.id, emoji, second);

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
      <Video {...props} getPlayer={callbackPlayer} emojis={emojiReactions} />

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
      </nav>
    </>
  );
};

export default VideoWithToolbar;
