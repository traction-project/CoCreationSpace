import * as React from "react";
import { useTranslation } from "react-i18next";

import { deletePost } from "../../services/post.service";

interface DeletePostModalProps {
  id: string;
  onClose: () => void;
  onDelete: (postDeleted: boolean) => void;
}

const DeletePostModal: React.FC<DeletePostModalProps> = (props) => {
  const { id, onClose, onDelete } = props;
  const { t } = useTranslation();

  const onConfirm = async () => {
    const res = await deletePost(id);

    onDelete(res.ok);
    onClose();
  };

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose} />
      <div className="modal-content">
        <div className="box">
          <h4 className="title is-4">{t("Delete Post")}</h4>
          <hr/>

          <p>{t("Are you sure you want to delete this post?")}</p>
          <hr/>

          <div className="field is-grouped pt-4">
            <div className="control">
              <button className="button is-link" onClick={onConfirm}>{t("Delete")}</button>
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

export default DeletePostModal;
