import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import usePortal from "react-useportal";

import FullscreenImage from "./fullscreen_image";
import EditImageIcon from "./edit_image_icon";
import { isImageBlurry, isImageEmpty, postFile, dataURLToFile } from "../util";
import EditableImage from "./editable_image";
import ProgressBox from "./progress_box";

interface UploadStatus {
  status: "done" | "progressing";
  total: number;
  loaded: number;
}

interface ImageProps {
  id: string;
  showDetectedText?: boolean;
  isEditable?: boolean;
  onDelete?: (id: string) => void;
}

const Image: React.FC<ImageProps> = ({ id, showDetectedText = false, isEditable = false, onDelete }) => {
  const { isOpen, Portal, openPortal, closePortal } = usePortal();
  const { t } = useTranslation();

  const imageRef = useRef<HTMLImageElement>(null);
  const dimensionRef = useRef<[number, number]>();

  const [ uploadStatus, setUploadStatus ] = useState<UploadStatus>({ status: "done", total: 0, loaded: 0 });
  const [ imageUrl, setImageUrl ] = useState<string>();
  const [ editImage, setEditImage ] = useState(false);
  const [ showBlurryWarning, setShowBlurryWarning ] = useState(false);

  useEffect(() => {
    fetch(`/images/${id}`).then((res) => {
      return res.json();
    }).then((data) => {
      setImageUrl(data.url);

      if (!isEditable) {
        return;
      }

      const image = new window.Image();
      image.src = data.url;

      image.onload = async () => {
        const isEmpty = await isImageEmpty(image);

        if (!isEmpty) {
          const isBlurry = await isImageBlurry(image);
          setShowBlurryWarning(isBlurry);
        }
      };
    });
  }, [id]);

  const imageLoaded = async () => {
    const image = imageRef.current;

    if (image) {
      dimensionRef.current = [
        image.width,
        image.height
      ];
    }
  };

  const onEditSaved = async (imageData: string) => {
    const file = await dataURLToFile(imageData, `${id}.png`);

    const res = await postFile(`/media/${id}/replace`, file, ({ total, loaded }) => {
      setUploadStatus({
        status: "progressing",
        total, loaded
      });
    });

    const data = JSON.parse(res);
    console.log("response:", data);

    setImageUrl(data.url);
    setEditImage(false);

    setUploadStatus({
      status: "done", total: 0, loaded: 0
    });
  };

  const wrapperStyle: React.CSSProperties = {
    width: "100%",
    paddingBottom: "56.25%",
    position: "relative"
  };

  const innerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0, left: 0, bottom: 0, right: 0
  };

  return (
    <div style={wrapperStyle}>
      <div style={{ width: "100%", backgroundColor: "#F9F9F9" }}>
        <div style={innerStyle}>
          {(imageUrl) && (
            (!editImage) ? (
              <img
                src={imageUrl}
                ref={imageRef}
                onLoad={imageLoaded}
                style={{ maxHeight: "100%", cursor: "pointer" }}
                onClick={openPortal}
              />
            ) : (uploadStatus.status == "done") ? (
              <EditableImage
                imageUrl={imageUrl}
                dimensions={dimensionRef.current || [0, 0]}
                onSave={onEditSaved}
                onCancel={() => setEditImage(false)}
              />
            ) : (
              <ProgressBox
                progress={uploadStatus.loaded}
                total={uploadStatus.total}
              />
            )
          )}

          {(showBlurryWarning) && (
            <div className="blur-warning">
              <div className="columns is-centered mt-4">
                <div className="column">
                  <p style={{ textAlign: "center", color: "#FFFFFF", fontSize: 15, padding: 5 }}>
                    {t("The image you uploaded appears to be excessively blurry. Are you sure you want to keep it?")}
                  </p>
                </div>
              </div>

              <div className="columns is-centered pt-2">
                <div className="column">
                  <div className="field is-grouped" style={{ justifyContent: "center" }}>
                    <div className="control">
                      <button
                        className="button is-link"
                        onClick={() => setShowBlurryWarning(false)}
                      >
                        {t("Keep image")}
                      </button>
                    </div>
                    <div className="control">
                      <button
                        className="button is-danger is-light"
                        onClick={() => {
                          onDelete?.(id);
                        }}
                      >
                        {t("Delete")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {(isEditable && !editImage && !showBlurryWarning) && (
        <EditImageIcon
          onClick={() => setEditImage(true)}
        />
      )}

      {(isOpen) && (
        <Portal>
          <FullscreenImage
            id={id}
            onClose={closePortal}
          />
        </Portal>
      )}
    </div>
  );
};

export default Image;
