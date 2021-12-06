import * as React from "react";
import { useTranslation } from "react-i18next";

interface ImageBlurryModalProps {
  onDelete: () => void;
  onClose: () => void;
}

const ImageBlurryModal: React.FC<ImageBlurryModalProps> = (props) => {
  const { onClose, onDelete } = props;
  const { t } = useTranslation();

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose} />
      <div className="modal-content">
        <div className="box">
          <h4 className="title is-4">{t("Blurry image")}</h4>
          <hr/>

          <p>{t("The image you uploaded appears to be excessively blurry. Are you sure you want to keep it?")}</p>

          <hr/>

          <div className="field is-grouped pt-4">
            <div className="control">
              <button
                className="button is-link"
                onClick={onClose}
              >
                {t("Keep image")}
              </button>
            </div>
            <div className="control">
              <button
                className="button is-danger is-light"
                onClick={() => {
                  onDelete();
                  onClose();
                }}
              >
                {t("Delete")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageBlurryModal;
