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
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
      {(imageUrl) && (
        <img src={imageUrl} style={{ flexShrink: 0, minWidth: "100%", minHeight: "100%" }} />
      )}
    </div>
  );
};

export default Image;
