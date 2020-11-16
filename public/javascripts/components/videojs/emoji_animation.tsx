import * as React from "react";
import * as ReactDOM from "react-dom";
import videojs, { VideoJsPlayer } from "video.js";

const vjsComponent = videojs.getComponent("Component");

interface EmojiAnimationProps {
    emoji: string;
}

const EmojiAnimation: React.FC<EmojiAnimationProps> = ({ emoji }) => {
  return(
    <span className="emoji-animation">{emoji}</span>
  );
};

class vjsEmojiAnimation extends vjsComponent {

  constructor(player: VideoJsPlayer, options: (videojs.ComponentOptions & { emoji: string })) {
    super(player, options);

    const { emoji } = options;
    player.ready(() => {
      this.mount(emoji);
    });
  }

  mount(emoji: string) {
    ReactDOM.render(<EmojiAnimation emoji={emoji} />, this.el());
  }

}

videojs.registerComponent("vjsEmojiAnimation", vjsEmojiAnimation);

export default vjsEmojiAnimation;
