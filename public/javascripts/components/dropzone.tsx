import * as React from "react";
import { useState } from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { getFilesFromList } from "../util";

interface DropzoneProps {
  onFilesDropped: (files: Array<File>) => void;
  size: [number | string, number | string];
}

const Dropzone: React.FC<DropzoneProps> = (props) => {
  const { onFilesDropped, size: [width, height] } = props;
  const { t } = useTranslation();
  const [ dropzoneEntered, setDropzoneEntered ] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    console.log("Files dropped");
    const files = getFilesFromList(e.dataTransfer.files);

    if (files.length > 0) {
      onFilesDropped(files);
    }
  };

  const handleButtonClick = (filesToUpload: FileList) => {
    const files = getFilesFromList(filesToUpload);

    if (files.length > 0) {
      onFilesDropped(files);
    }
  };

  return (
    <div
      style={{ width, height }}
      className={classNames("dropzone", { "dropzone-entered": dropzoneEntered })}
      onDragEnter={() => setDropzoneEntered(true)}
      onDragLeave={() => setDropzoneEntered(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="dropzone-label">
        <strong>{t("Drop a file here")}</strong>
      </div>

      <div className="file">
        <label className="file-label">
          <input
            className="file-input"
            type="file"
            multiple={true}
            name="resume"
            onChange={(e) => e.target.files && handleButtonClick(e.target.files)}
          />
          <span className="file-cta">
            <span className="file-icon">
              <i className="fas fa-upload"></i>
            </span>
            &nbsp;
            <span className="file-label">
              {t("Choose a file")}…
            </span>
          </span>
        </label>
      </div>
    </div>
  );
};

export default Dropzone;
