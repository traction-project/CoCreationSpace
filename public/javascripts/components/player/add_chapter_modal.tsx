import * as React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { convertHMS } from "../../util";
import { VideoChapter } from "../media_player_with_chapters";

interface AddChapterModalProps {
  mediaItemId: string;
  startTime?: number;
  totalDuration?: number;
  onClose: () => void;
  onChapterAdded?: (videoChapter: VideoChapter) => void;
}

const AddChapterModal: React.FC<AddChapterModalProps> = (props) => {
  const { mediaItemId, onClose, onChapterAdded, startTime = 0, totalDuration = -1 } = props;
  const { handleSubmit, register } = useForm();
  const { t } = useTranslation();

  const timecodeToNumber = (timecode: string) => {
    const [ minutes, seconds ] = timecode.split(":");
    return parseInt(minutes) * 60 + parseInt(seconds);
  };

  const onConfirm = handleSubmit(async ({ name, timestamp }) => {
    console.log({ name, timestamp });
    const startTime = timecodeToNumber(timestamp);

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

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose} />
      <div className="modal-content">
        <div className="box">
          <h4 className="title is-4">{t("Add highlight")}</h4>
          <hr/>

          <div className="field is-horizontal">
            <div className="field-label is-normal">
              <label className="label">{t("Start")} (MM:SS)</label>
            </div>
            <div className="field-body">
              <div className="field is-expanded">
                <p className="control">
                  <input
                    className="input"
                    type="text"
                    {...register("timestamp", {
                      value: convertHMS(startTime),
                      required: true,
                      pattern: /^[0-9]{1,2}:[0-9]{1,2}$/,
                      validate: (val) => {
                        return totalDuration == -1 || timecodeToNumber(val) <= totalDuration;
                      }
                    })}
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
                <p className="control">
                  <input className="input" type="text" {...register("name", { required: true })} />
                </p>
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
