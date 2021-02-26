import React from "react";
import usePortal from "react-useportal";

import TranslationModal from "../post/translation_modal";

interface TranslationButtonProps {
  videoId: string;
  onTranslationSuccess?: (languaceCode: string) => void;
}

const TranslationButton: React.FC<TranslationButtonProps> = (props) => {
  const { videoId, onTranslationSuccess } = props;
  const { isOpen, openPortal, closePortal, Portal } = usePortal();

  const handleTranslationSuccess = (languageCode: string, subtitleId: string) => {
    console.log("Translation success");
    onTranslationSuccess?.(languageCode);
  };

  return (
    <>
      <span className="icon" style={{ width: 40, cursor: "pointer" }} onClick={openPortal}>
        <i className="fas fa-lg fa-language" />
      </span>

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
