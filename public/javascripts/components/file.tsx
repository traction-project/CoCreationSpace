import * as React from "react";
import { useEffect, useState } from "react";

interface FileProps {
  id: string;
}

const File: React.FC<FileProps> = (props) => {
  const { id } = props;
  const [ originalName, setOriginalName ] = useState<string>();
  const [ downloadUrl, setDownloadUrl ] = useState<string>();

  useEffect(() => {
    fetch(`/media/${id}/name`).then((res) => {
      return res.json();
    }).then(({ originalName, downloadUrl }) => {
      setOriginalName(originalName);
      setDownloadUrl(downloadUrl);
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
        <div>
          <a href={downloadUrl} download={originalName}>
            <img style={{ height: 150 }} src="/images/file-file-solid.png" />
            <p style={{ textAlign: "center" }}>{originalName}</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default File;
