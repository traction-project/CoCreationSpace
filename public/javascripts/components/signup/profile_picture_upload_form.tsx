import * as React from "react";
import { useState } from "react";
import { useTranslation, Trans } from "react-i18next";

import { postFile } from "../../util";

interface ProfilePictureUploadFormProps {
  currentImage: string;
  skippable?: boolean;
  onComplete?: (newImage: string) => void;
}

const ProfilePictureUploadForm: React.FC<ProfilePictureUploadFormProps> = (props) => {
  const { currentImage, skippable, onComplete } = props;
  const { t } = useTranslation();

  const [ error, setError ] = useState<string>();
  const [ isLoading, setIsLoading ] = useState(false);

  const handleButtonUploadClick = async (filesToUpload: FileList) => {
    if (filesToUpload.length > 0) {
      const file = filesToUpload.item(0);
      setIsLoading(true);

      if (file) {
        try {
          const response: string = await postFile("/users/image", file, () => {});

          const responseJson = JSON.parse(response);
          const { image } = responseJson;

          setIsLoading(false);
          onComplete?.(image);
        } catch (err) {
          setIsLoading(false);
          setError(err);
        }
      }
    }
  };

  return (
    <React.Fragment>
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
        {(isLoading) ? (
          <progress className="progress is-primary" />
        ) : (
          <figure style={{ width: "min-content" }}>
            <span className="image is-128x128">
              <img src={currentImage} alt="Logo" />
            </span>
          </figure>
        )}

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
              &nbsp;
              <span className="file-label">
                {t("Choose an image")}…
              </span>
            </span>
          </label>
        </div>

        {(skippable == true) && (
          <>
            <br />
            <div>
              <button className="button is-info" onClick={() => onComplete?.(currentImage)}>
                {t("Skip")}
              </button>
            </div>
          </>
        )}
      </div>
    </React.Fragment>
  );
};

export default ProfilePictureUploadForm;
