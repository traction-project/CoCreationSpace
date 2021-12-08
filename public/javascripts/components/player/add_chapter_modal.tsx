import * as React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { VideoChapter } from "../media_player_with_chapters";

interface AddChapterModalProps {
  mediaItemId: string;
  startTime?: number;
  onClose: () => void;
  onChapterAdded?: (videoChapter: VideoChapter) => void;
}

const AddChapterModal: React.FC<AddChapterModalProps> = (props) => {
  const { mediaItemId, onClose, onChapterAdded, startTime = 0 } = props;
  const { handleSubmit, register } = useForm();
  const { t } = useTranslation();

  const onConfirm = handleSubmit(async ({ name, minutes, seconds }) => {
    console.log({ name, minutes, seconds });
    const startTime = minutes * 60 + seconds;

    const res = await fetch(`/media/${mediaItemId}/chapter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, startTime
      })
    });

    if (!res.ok) {
      console.error("Could not save chapter");
      return;
    }

    const { chapter } = await res.json();

    onChapterAdded?.(chapter);
    onClose();
  });

  const minutes = Math.floor(startTime / 60);
  const seconds = Math.floor(startTime - (minutes * 60));

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose} />
      <div className="modal-content">
        <div className="box">
          <h4 className="title is-4">{t("Add chapter to video")}</h4>
          <hr/>

          <div className="field is-horizontal">
            <div className="field-label is-normal">
              <label className="label">{t("Start")} (MM:SS)</label>
            </div>
            <div className="field-body">
              <div className="field">
                <p className="control">
                  <input
                    className="input"
                    type="number"
                    {...register("minutes", { value: minutes })}
                  />
                </p>
              </div>
              <div className="field">
                <p className="control">
                  <input
                    className="input"
                    type="number"
                    {...register("seconds", { value: seconds })}
                  />
                </p>
              </div>
            </div>
          </div>

          <div className="field is-horizontal">
            <div className="field-label is-normal">
              <label className="label">{t("Name")}</label>
            </div>
            <div className="field-body">
              <div className="field is-expanded">
                <div className="field has-addons">
                  <p className="control">
                    <input className="input" type="text" {...register("name", { required: true })} />
                  </p>
                </div>
              </div>
            </div>
          </div>

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

export default AddChapterModal;
