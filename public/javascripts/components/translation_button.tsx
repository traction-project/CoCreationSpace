import React from "react";
import usePortal from "react-useportal";

import TranslationModal from "./translation_modal";

interface TranslationButtonProps {
  videoId: string;
  onTranslationSuccess?: (languaceCode: string, subtitleId: string) => void;
  onSubtitlesDisabled?: () => void;
}

const TranslationButton: React.FC<TranslationButtonProps> = (props) => {
  const { videoId, onTranslationSuccess, onSubtitlesDisabled } = props;
  const { isOpen, openPortal, closePortal, Portal } = usePortal();

  const handleTranslationSuccess = (languageCode: string, subtitleId: string) => {
    console.log("Translation success");
    onTranslationSuccess?.(languageCode, subtitleId);
  };

  return (
    <>
      <span className="controlbutton icon" onClick={openPortal}>
        <i className="fas fa-lg fa-language" />
      </span>

      {isOpen && (
        <Portal>
          <TranslationModal
            id={videoId}
            onSuccess={handleTranslationSuccess}
            onDisable={onSubtitlesDisabled}
            onClose={closePortal}
          />
        </Portal>
      )}
    </>
  );
};

export default TranslationButton;
