import * as React from "react";
import { useState, useEffect } from "react";

interface ThumbnailProps {
  id: string;
  type: string;
  height?: number;
}

const Thumbnail: React.FC<ThumbnailProps> = ({ id, type, height = 100 }) => {
  const [ url, setUrl ] = useState<string>();

  useEffect(() => {
    if (type == "video") {
      fetch(`/video/id/${id}/thumbnail`).then((res) => {
        return res.json();
      }).then((data) => {
        setUrl(data.thumbnail);
      });
    } else {
      fetch(`/images/${id}`).then((res) => {
        return res.json();
      }).then((data) => {
        setUrl(data.url);
      });
    }
  }, []);

  if (!url) {
    return (
      <div style={{ width: height, height, backgroundColor: "black", padding: "0.25rem" }} />
    );
  }

  return (
    <img src={url} style={{ height, padding: "0.25rem" }} />
  );
};

export default Thumbnail;
