import * as React from "react";
import { useEffect, useState } from "react";

interface ImageProps {
  id: string;
}

const Image: React.FC<ImageProps> = ({ id }) => {
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
          <img src={imageUrl} style={{ maxHeight: "100%" }} />
        )}
      </div>
    </div>
  );
};

export default Image;
