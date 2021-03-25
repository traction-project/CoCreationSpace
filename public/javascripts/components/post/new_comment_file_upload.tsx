import * as React from "react";
import { useState, useEffect } from "react";

import { postFile, ResponseUploadType } from "../../util";

interface FileUploadProps {
  fileToUpload: File;
  addMultimedia: (id: string, type?: string) => void;
  setLoading: (value: boolean) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ fileToUpload, addMultimedia, setLoading }) => {
  const [file, setFile] = useState<File>();
  const [loaded, setLoaded] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    (async () => {
      await startUpload(fileToUpload);
    })();
  }, [fileToUpload]);

  const startUpload = async (fileUpload: File) => {
    if (fileUpload) {
      try {
        setLoading(true);

        const response: string = await postFile("/media/upload", fileUpload, async (progress) => {
          setLoaded(progress.loaded);
          setTotal(progress.total);
        });

        const responseJson: ResponseUploadType = JSON.parse(response);

        setFile(fileUpload);
        addMultimedia(responseJson.id, responseJson.type);
      } finally {
        setTotal(0);
        setLoading(false);
      }
    }
  };

  return (
    <div className="column is-two-fifth">
      <div className="box">
        <article className="media">
          <div className="media-left">
            <figure className="image is-24x24">
              <img src="/images/docs.png" />
            </figure>
          </div>

          <div className="media-content">
            <div className="content is-small">
              {(total > 0) ? (
                <progress className="progress is-primary" value={loaded} max={total} />
              ) : (
                file?.name && <span className="is-small">{file.name}</span>
              )}
            </div>
          </div>

          {(total > 0 && file?.name) && (
            <div className="media-right">
              <a className="delete"></a>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};

export default FileUpload;
