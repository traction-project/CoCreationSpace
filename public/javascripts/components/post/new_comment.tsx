import * as React from "react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import FileUpload from "./new_comment_file_upload";

interface NewCommentProps {
    handleSubmitNewComment: ({comment, multimedia}: {comment: string, multimedia?: Array<string>}) => void;
    handleClickCancel: () => void;
    enableTimestamp?: boolean;
}

const NewComment: React.FC<NewCommentProps> = (props) => {
  const { t } = useTranslation();

  const [ files, setFiles ] = useState<Array<File>>([]);
  const [ multimedia, setMultimedia ] = useState<Array<string>>([]);
  const [ loading, setLoading ] = useState<boolean>(false);
  const [ selectedGettimestamp, setSelectedGettimestamp ] = useState<boolean>(false);

  const { handleSubmit, register, formState: { errors }, reset } = useForm();

  const addFile = (filesToUpload: FileList) => {
    if (filesToUpload && filesToUpload.length > 0) {
      const file = filesToUpload.item(0);

      if (file) {
        let newList = files;
        newList = files.concat(file);
        setFiles(newList);
      }
    }
  };

  const addMultimedia = (multimediaId: string) => {
    const newMultimedia = multimedia;

    newMultimedia.push(multimediaId);
    setMultimedia(newMultimedia);
  };

  const handleClickCancel = () => {
    props.handleClickCancel();
  };

  const handleClickComment = handleSubmit(({ comment }) => {
    const commentContent = {
      comment,
      selectedGettimestamp,
      ...(multimedia && multimedia.length > 0 && {multimedia})
    };
    props.handleSubmitNewComment(commentContent);
    cleanUp();
  });

  const handleSelectGetTimestamp = () => {
    setSelectedGettimestamp(!selectedGettimestamp);
  };

  const cleanUp = () => {
    setMultimedia([]);
    setFiles([]);
    setLoading(false);
    reset();
  };

  return (
    <React.Fragment>
      <form onSubmit={handleClickComment}>
        <div className="form-group">
          <textarea
            className={classNames("textarea", { "alert": errors.comment })}
            placeholder={t("Add a comment") + "..."}
            rows={3}
            style={{resize: "none"}}
            {...register("comment", {
              required: true
            })}
          />
          {errors.comment && <p className="message-warning">* {t("required")}</p>}
        </div>
        {(files) && (
          <div className="columns">
            {files.map(((file, index) => {
              return(
                <FileUpload key={index} fileToUpload={file} addMultimedia={addMultimedia} setLoading={setLoading} />
              );
            }))}
          </div>
        )}
        {(props.enableTimestamp) &&
          <label className="checkbox">
            <input type="checkbox" defaultChecked={selectedGettimestamp} onChange={handleSelectGetTimestamp} />
            <span style={{ marginLeft: "0.2rem" }}>{t("Check timeline")}</span>
          </label>
        }
        <div className="form-group" style={{padding: ".5em 0"}}>
          <button className="button is-info" disabled={loading}>
            {t("Comment")}
          </button>
          <button
            onClick={handleClickCancel}
            className="button"
            style={{marginLeft: "5px"}}
          >
            {t("Cancel")}
          </button>
          <div className="file">
            <label className="file-label">
              <input
                onChange={e => { e.target.files && addFile(e.target.files); }}
                className="file-input"
                type="file"
                name="resume"
              />
              <span className="file-cta">
                <span className="file-icon">
                  <i className="fas fa-upload"></i>
                </span>
              </span>
            </label>
          </div>
        </div>
      </form>
    </React.Fragment>
  );
};

export default NewComment;
