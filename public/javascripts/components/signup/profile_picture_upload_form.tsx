import * as React from "react";
import { useState } from "react";
import { useTranslation, Trans } from "react-i18next";

import { postFile } from "../../util";

interface ProfilePictureUploadFormProps {
  currentImage: string;
  onComplete: (newImage: string) => void;
}

const ProfilePictureUploadForm: React.FC<ProfilePictureUploadFormProps> = (props) => {
  const { currentImage, onComplete } = props;
  const [ error, setError ] = useState<string>();
  const { t } = useTranslation();

  const handleButtonUploadClick = async (filesToUpload: FileList) => {
    if (filesToUpload.length > 0) {
      const file = filesToUpload.item(0);

      if (file) {
        try {
          const response: string = await postFile("/users/image", file, () => {});

          const responseJson = JSON.parse(response);
          const { image } = responseJson;

          onComplete(image);
        } catch (err) {
          setError(err);
        }
      }
    }
  };

  return (
    <div className="box">
      <h4 className="title is-4">{t("Upload Profile Picture")}</h4>

      {error && (
        <article className="message is-danger">
          <div className="message-body">
            <Trans i18nKey="image-upload-error">
              <strong>Image upload failed!</strong> An onknown error occurred.
            </Trans>
          </div>
        </article>
      )}

      <div className="box-flex">
        <figure style={{ width: "min-content" }}>
          <span className="image is-128x128">
            <img src={currentImage} alt="Logo" />
          </span>
        </figure>

        <br />

        <div className="file">
          <label className="file-label">
            <input
              className="file-input"
              type="file"
              name="resume"
              onChange={(e) => e.target.files && handleButtonUploadClick(e.target.files)}
            />
            <span className="file-cta">
              <span className="file-icon">
                <i className="fas fa-upload"></i>
              </span>
              <span className="file-label">
                {t("Choose an image")}…
              </span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureUploadForm;
