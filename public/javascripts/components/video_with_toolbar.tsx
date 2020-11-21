import * as React from "react";
import { useState } from "react";
import { VideoJsPlayer } from "video.js";
import usePortal from "react-useportal";
import { PostType } from "./post/post";
import classNames from "classnames";

import { postEmojiReaction } from "../services/post.service";
import { addEmojiAnimation } from "./videojs/util";
import { activateSubtitleTrack, EmojiReaction } from "../util";

import Video from "./video";
import TranslationModal from "./post/translation_modal";

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
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  const [emojiReactions, setEmojiReactions] = useState<EmojiReaction[]>((post as any).emojiReactions.map((item: EmojiReaction) => {
    return { emoji: item.emoji, second: item.second };
  }));
  const [showEmojis, setShowEmojis] = useState<boolean>(false);
  const [player, setPlayer] = useState<VideoJsPlayer>();

  const handleClickEmojiButton = () => {
    setShowEmojis(!showEmojis);
  };

  const handleClickEmojiItem = async (emoji: string) => {
    setShowEmojis(false);

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

  const handleTranslationSuccess = (languageCode: string, subtitleId: string) => {
    if (player) {
      player.addRemoteTextTrack({
        kind: "subtitles",
        srclang: languageCode,
        src: `/video/subtitles/${subtitleId}`
      }, true);

      activateSubtitleTrack(player, languageCode);
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
          <div className={classNames("emoji-container", { "hidden": showEmojis })}>
            {EMOJIS.map((emoji, index) => {
              return (
                <button key={index} className="emoji-item" onClick={() => handleClickEmojiItem(emoji)}>{emoji}</button>
              );
            })}
          </div>

          <a className="level-item button is-info is-small" onClick={handleClickEmojiButton}>
            <span className="icon is-small">
              <i className="fas fa-smile"></i>
            </span>
          </a>

          <a className="level-item" onClick={(e) => openPortal(e)}>
            <span className="icon is-small">
              <i className="fas fa-language"/>
            </span>
          </a>

          {isOpen && (
            <Portal>
              <TranslationModal
                id={props.id!}
                onSuccess={handleTranslationSuccess}
                onClose={closePortal}
              />
            </Portal>
          )}
        </div>
      </nav>
    </>
  );
};

export default VideoWithToolbar;
