import * as React from "react";
import * as ReactDOM from "react-dom";
import videojs, { VideoJsPlayer } from "video.js";

const vjsComponent = videojs.getComponent("Component");

type TooltipComponentProps = {
    username: string;
    text: string;
}
const TooltipComponent: React.FC<TooltipComponentProps> = ({ username, text }) => {
  return(
    <div className="tooltip-container">
      <span className="tooltip__username">{username}</span>
      <span className="tooltip__text">{text}</span>
    </div>
  );
};

class vjsTooltip extends vjsComponent {

  constructor(player: VideoJsPlayer, options: (videojs.ComponentOptions & { username: string, text: string })) {
    options = Object.assign(options, { id: "vjsTooltip" });
    super(player, options);

    const { username, text } = options;
    player.ready(() => {
      this.mount(username, text);
    });
    this.on("dispose", () => {
      ReactDOM.unmountComponentAtNode(this.el());
    });
    this.mount(username, text);
  }

  mount(username: string, text: string) {
    ReactDOM.render(<TooltipComponent username={username} text={text} />, this.el());
  }
}

videojs.registerComponent("vjsTooltip", vjsTooltip);

export default vjsTooltip;