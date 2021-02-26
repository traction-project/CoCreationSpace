import * as React from "react";
import { useState, useEffect } from "react";
import { Trans } from "react-i18next";

import { EmojiReaction } from "../util";
import Video from "./video";

interface VideoWithToolbarProps {
  id: string;
  emojis: Array<EmojiReaction>;
}

const EMOJIS = ["👍","💓","😊","😍","😂","😡"];

const VideoWithToolbar: React.FC<VideoWithToolbarProps> = (props) => {
  const { id: videoId, emojis } = props;

  const [ viewCount, setViewCount ] = useState<number>();

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

  return (
    <>
      <Video id={videoId} emojis={emojis} />

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
