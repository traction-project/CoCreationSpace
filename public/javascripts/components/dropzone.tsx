import * as React from "react";
import { useState } from "react";
import classNames from "classnames";

interface DropzoneProps {
  onFileDropped: (f: File) => void;
  size: [number | string, number | string];
}

const Dropzone: React.FC<DropzoneProps> = (props) => {
  const { onFileDropped, size: [width, height] } = props;
  const [ dropzoneEntered, setDropzoneEntered ] = useState(false);

  const parseFormData = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    console.log("File dropped");
    const file = e.dataTransfer.files.item(0);

    if (file) {
      onFileDropped(file);
    }
  };

  return (
    <React.Fragment>
      <div
        style={{ width, height }}
        className={classNames("dropzone", { "dropzone-entered": dropzoneEntered })}
        onDragEnter={() => setDropzoneEntered(true)}
        onDragLeave={() => setDropzoneEntered(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={parseFormData}
      >
        <div>Drop a file here</div>
      </div>
    </React.Fragment>
  );
};

export default Dropzone;
