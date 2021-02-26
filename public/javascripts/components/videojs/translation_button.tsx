import React from "react";
import usePortal from "react-useportal";

import TranslationModal from "../post/translation_modal";

interface TranslationButtonProps {
  videoId: string;
  onTrackChanged?: (languaceCode: string) => void;
}

const TranslationButton: React.FC<TranslationButtonProps> = (props) => {
  const { videoId, onTrackChanged } = props;
  const { isOpen, openPortal, closePortal, Portal } = usePortal();

  const handleTranslationSuccess = (languageCode: string, subtitleId: string) => {
    console.log("Translation success");
    onTrackChanged?.(languageCode);
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

export default TranslationButton;
