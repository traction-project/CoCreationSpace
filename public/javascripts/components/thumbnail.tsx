import * as React from "react";
import { useState, useEffect } from "react";

interface ThumbnailProps {
  id: string;
  type: string;
  filename?: string
  height?: number;
  padding?: number | string;
}

const Thumbnail: React.FC<ThumbnailProps> = ({ id, type, filename, height = 100, padding = "0.25rem" }) => {
  const [ url, setUrl ] = useState<string>();

  useEffect(() => {
    switch (type) {
    case "video":
      fetch(`/media/${id}/thumbnail`).then((res) => {
        return res.json();
      }).then((data) => {
        setUrl(data.thumbnail);
      });
      break;
    case "image":
      fetch(`/images/${id}`).then((res) => {
        return res.json();
      }).then((data) => {
        setUrl(data.thumbnail);
      });
      break;
    case "audio":
      setUrl("/images/file-audio-solid.png");
      break;
    default:
      setUrl("/images/file-file-solid.png");
    }
  }, []);

  if (filename && (type == "audio" || type == "file")) {
    return (
      <div style={{ height, width: height, padding }}>
        <div style={{ textAlign: "center", overflow: "hidden", height: `calc(${height}px - 0.5rem)`, backgroundColor: "#E2E2E2", padding }}>
          <img src={url} style={{ height: height / 2 }} />
          <p className="is-size-7">{filename}</p>
        </div>
      </div>
    );
  }

  return (
    <img src={url} style={{ height, padding }} />
  );
};

export default Thumbnail;
