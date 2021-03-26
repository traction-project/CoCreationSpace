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

  const anchorStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  };

  return (
    <div style={{ width: "100%" }}>
      <a style={anchorStyle} href={downloadUrl} download={originalName}>
        <img style={{ height: 70 }} src="/images/file-file-solid.png" />
        <p style={{ textAlign: "center", marginTop: 5 }}>{originalName}</p>
      </a>
    </div>
  );
};

export default File;
