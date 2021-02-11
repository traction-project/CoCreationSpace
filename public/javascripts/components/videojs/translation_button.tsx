import React from "react";
import ReactDOM from "react-dom";
import usePortal from "react-useportal";
import videojs, { VideoJsPlayer } from "video.js";

import TranslationModal from "../post/translation_modal";
import { activateSubtitleTrack, hasSubtitleTrack } from "../../util";

interface TranslationButtonProps {
  videoId: string;
  player: VideoJsPlayer;
}

const TranslationButton: React.FC<TranslationButtonProps> = (props) => {
  const { videoId, player } = props;
  const { isOpen, openPortal, closePortal, Portal } = usePortal();

  const handleTranslationSuccess = (languageCode: string, subtitleId: string) => {
    console.log("Translation success");

    if (player) {
      console.log("activating track");

      if (!hasSubtitleTrack(player, languageCode)) {
        player.addRemoteTextTrack({
          kind: "subtitles",
          srclang: languageCode,
          src: `/media/subtitles/${subtitleId}`
        }, true);
      }

      activateSubtitleTrack(player, languageCode);
    }
  };

  return (
    <>
      <button className="bjs-fullscreen-control vjs-control vjs-button is-clickable" onClick={openPortal}>
        <span className="icon">
          <i className="fas fa-lg fa-language" />
        </span>
      </button>

      {isOpen && (
        <Portal>
          <TranslationModal
            id={videoId}
            onSuccess={handleTranslationSuccess}
            onClose={closePortal}
          />
        </Portal>
      )}
    </>
  );
};

const vjsComponent = videojs.getComponent("Component");

class vjsTranslationButton extends vjsComponent {
  private playerInstance: videojs.Player;

  constructor(player: videojs.Player, private videoId: string, options: videojs.ComponentOptions) {
    super(player, options);
    this.playerInstance = player;

    this.mount = this.mount.bind(this);

    player.ready(() => {
      this.mount();
    });

    this.on("dispose", () => {
      ReactDOM.unmountComponentAtNode(this.el());
    });
  }

  mount() {
    ReactDOM.render(
      <TranslationButton
        player={this.playerInstance}
        videoId={this.videoId}
      />,
      this.el()
    );
  }
}

vjsComponent.registerComponent("vjsEpisodeList", vjsTranslationButton);
export default vjsTranslationButton;
