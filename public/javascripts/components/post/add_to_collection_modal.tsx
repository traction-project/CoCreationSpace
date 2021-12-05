import * as React from "react";
import { useTranslation } from "react-i18next";

interface AddToCollectionModalProps {
  id: string;
  onClose: () => void;
  onItemAdded?: () => void;
}

const AddToCollectionModal: React.FC<AddToCollectionModalProps> = (props) => {
  const { onClose, onItemAdded } = props;
  const { t } = useTranslation();

  const onConfirm = async () => {
    onItemAdded?.();
    onClose();
  };

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose} />
      <div className="modal-content">
        <div className="box">
          <h4 className="title is-4">{t("Add to Collection")}</h4>
          <hr/>

          <div className="field is-grouped pt-4">
            <div className="control">
              <button className="button is-link" onClick={onConfirm}>{t("Add")}</button>
            </div>
            <div className="control">
              <button className="button is-link is-light" onClick={onClose}>{t("Cancel")}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToCollectionModal;
