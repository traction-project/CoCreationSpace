import React from "react";
import ReactDOM from "react-dom";
import usePortal from "react-useportal";
import videojs, { VideoJsPlayer } from "video.js";

import TranslationModal from "../post/translation_modal";
import { activateSubtitleTrack, hasSubtitleTrack } from "../../util";

interface TranslationButtonProps {
  videoId: string;
  player: VideoJsPlayer;
  onTrackChanged?: (languaceCode: string) => void;
}

const TranslationButton: React.FC<TranslationButtonProps> = (props) => {
  const { videoId, player, onTrackChanged } = props;
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
      onTrackChanged?.(languageCode);
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
  private fnOnTrackChanged = (_: string) => {};

  constructor(private playerInstance: videojs.Player, private videoId: string, options: videojs.ComponentOptions) {
    super(playerInstance, options);
    this.mount = this.mount.bind(this);

    playerInstance.ready(() => {
      this.mount();
    });

    this.on("dispose", () => {
      ReactDOM.unmountComponentAtNode(this.el());
    });
  }

  public onTrackChanged(fnOnTrackChanged: (languaceCode: string) => void) {
    this.fnOnTrackChanged = fnOnTrackChanged;
  }

  mount() {
    ReactDOM.render(
      <TranslationButton
        player={this.playerInstance}
        videoId={this.videoId}
        onTrackChanged={this.fnOnTrackChanged}
      />,
      this.el()
    );
  }
}

vjsComponent.registerComponent("vjsEpisodeList", vjsTranslationButton);
export default vjsTranslationButton;
