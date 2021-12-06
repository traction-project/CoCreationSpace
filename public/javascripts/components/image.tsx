import * as React from "react";
import { useEffect, useState, useRef } from "react";
import usePortal from "react-useportal";

import FullscreenImage from "./fullscreen_image";
import { isImageBlurry, isImageEmpty } from "../util";

interface ImageProps {
  id: string;
  onBlurDetected?: (isBlurry: boolean) => void;
}

const Image: React.FC<ImageProps> = ({ id, onBlurDetected }) => {
  const { isOpen, Portal, openPortal, closePortal } = usePortal();
  const imageRef = useRef<HTMLImageElement>(null);

  const [ imageUrl, setImageUrl ] = useState<string>();
  const [ imageText, setImageText ] = useState<Array<string>>([]);

  useEffect(() => {
    fetch(`/images/${id}`).then((res) => {
      return res.json();
    }).then((data) => {
      setImageUrl(data.url);
      setImageText(data.ocrData.map(({ line }: { line: string }) => line));
    });
  }, [id]);

  const imageLoaded = async () => {
    if (onBlurDetected && imageRef.current) {
      const isEmpty = await isImageEmpty(imageRef.current);

      if (!isEmpty) {
        const isBlurry = await isImageBlurry(imageRef.current);
        onBlurDetected(isBlurry);
      }
    }
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
            <img
              src={imageUrl}
              ref={imageRef}
              onLoad={imageLoaded}
              style={{ maxHeight: "100%", cursor: "pointer" }}
              onClick={openPortal}
            />
          )}
        </div>
      </div>

      {(imageText.length > 0) && (
        <div className="mt-2">
          {imageText.map((line, i) => {
            return (
              <p key={i}>{line}</p>
            );
          })}
          <hr/>
        </div>
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
