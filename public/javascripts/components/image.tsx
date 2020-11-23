import * as React from "react";
import { useEffect, useState } from "react";
import usePortal from "react-useportal";

import FullscreenImage from "./fullscreen_image";

interface ImageProps {
  id: string;
}

const Image: React.FC<ImageProps> = ({ id }) => {
  const { isOpen, Portal, openPortal, closePortal } = usePortal();
  const [ imageUrl, setImageUrl ] = useState<string>();

  useEffect(() => {
    fetch(`/images/${id}`).then((res) => {
      return res.json();
    }).then((data) => {
      setImageUrl(data.url);
    });
  }, [id]);

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
