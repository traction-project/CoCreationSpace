import * as React from "react";
import usePortal from "react-useportal";
import { useTranslation } from "react-i18next";

interface ButtonWithConfirmationProps {
  render: (onClick: (e: React.MouseEvent) => void) => JSX.Element;
  labels: {
    header: string;
    body: string;
    confirm: string;
  };
  onConfirm: () => void;
  onCancel?: () => void;
}

const ButtonWithConfirmation: React.FC<ButtonWithConfirmationProps> = ({ render, labels, onConfirm, onCancel }) => {
  const { t } = useTranslation();
  const { isOpen, openPortal, closePortal, Portal } = usePortal();

  const onClick = (e: React.MouseEvent) => {
    openPortal(e);
  };

  const onClose = () => {
    closePortal();
    onCancel?.();
  };

  return (
    <>
      {render(onClick)}

      {isOpen && (
        <Portal>
          <div className="modal is-active">
            <div className="modal-background" onClick={onClose} />
            <div className="modal-content">
              <div className="box">
                <h4 className="title is-4">{labels.header}</h4>
                <hr/>

                <p>{labels.body}</p>
                <hr/>

                <div className="field is-grouped pt-4">
                  <div className="control">
                    <button className="button is-link" onClick={onConfirm}>{labels.confirm}</button>
                  </div>
                  <div className="control">
                    <button className="button is-link is-light" onClick={onClose}>{t("Cancel")}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};

export default ButtonWithConfirmation;
