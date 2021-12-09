import * as React from "react";
import { useEffect, useState, useRef } from "react";
import usePortal from "react-useportal";

import FullscreenImage from "./fullscreen_image";
import EditImageIcon from "./edit_image_icon";
import { isImageBlurry, isImageEmpty, postFile, dataURLToFile } from "../util";
import EditableImage from "./editable_image";

interface ImageProps {
  id: string;
  showDetectedText?: boolean;
  isEditable?: boolean;
  onBlurDetected?: (isBlurry: boolean) => void;
}

const Image: React.FC<ImageProps> = ({ id, showDetectedText = false, isEditable = false, onBlurDetected }) => {
  const { isOpen, Portal, openPortal, closePortal } = usePortal();
  const imageRef = useRef<HTMLImageElement>(null);
  const dimensionRef = useRef<[number, number]>();

  const [ imageUrl, setImageUrl ] = useState<string>();
  const [ imageText, setImageText ] = useState<Array<string>>([]);
  const [ editImage, setEditImage ] = useState(false);

  useEffect(() => {
    fetch(`/images/${id}`).then((res) => {
      return res.json();
    }).then((data) => {
      setImageUrl(data.url);
      setImageText(data.ocrData?.map(({ line }: { line: string }) => line) || []);
    });
  }, [id]);

  const imageLoaded = async () => {
    const image = imageRef.current;

    if (image) {
      dimensionRef.current = [
        image.width,
        image.height
      ];

      if (onBlurDetected != undefined) {
        const isEmpty = await isImageEmpty(image);

        if (!isEmpty) {
          const isBlurry = await isImageBlurry(image);
          onBlurDetected(isBlurry);
        }
      }
    }
  };

  const onEditSaved = async (imageData: string) => {
    const file = await dataURLToFile(imageData, `${id}.png`);

    const res = await postFile(`/media/${id}/replace`, file, (e) => {
      console.log("progress:", e.total, e.loaded);
    });

    const data = JSON.parse(res);
    console.log("response:", data);

    setImageUrl(data.url);
    setEditImage(false);
  };

  const wrapperStyle: React.CSSProperties = {
    width: "100%",
    aspectRatio: "16/9"
  };

  const innerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
            ) : (
              <EditableImage
                imageUrl={imageUrl}
                dimensions={dimensionRef.current || [0, 0]}
                onSave={onEditSaved}
                onCancel={() => setEditImage(false)}
              />
            )
          )}
        </div>
      </div>

      {(showDetectedText && imageText.length > 0) && (
        <div className="mt-2">
          {imageText.map((line, i) => {
            return (
              <p key={i}>{line}</p>
            );
          })}
          <hr/>
        </div>
      )}

      {(isEditable && !editImage) && (
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
