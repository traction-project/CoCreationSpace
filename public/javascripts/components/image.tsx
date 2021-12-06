import * as React from "react";
import { useEffect, useState, useRef } from "react";
import usePortal from "react-useportal";

import FullscreenImage from "./fullscreen_image";
import { isImageBlurry, isImageEmpty } from "../util";

interface ImageProps {
  id: string;
  detectBlur?: boolean
}

const Image: React.FC<ImageProps> = ({ id, detectBlur = false }) => {
  const { isOpen, Portal, openPortal, closePortal } = usePortal();
  const imageRef = useRef<HTMLImageElement>(null);
  const [ imageUrl, setImageUrl ] = useState<string>();

  useEffect(() => {
    fetch(`/images/${id}`).then((res) => {
      return res.json();
    }).then((data) => {
      setImageUrl(data.url);
    });
  }, [id]);

  const imageLoaded = async () => {
    if (detectBlur && imageRef.current) {
      const isEmpty = await isImageEmpty(imageRef.current);

      if (!isEmpty) {
        const isBlurry = await isImageBlurry(imageRef.current);
        console.log("image blurry:", isBlurry);
      }
    }
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
