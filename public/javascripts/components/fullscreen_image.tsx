import * as React from "react";
import { useEffect, useState } from "react";

interface FullscreenImageProps {
  id: string;
  onClose: () => void;
}

const FullscreenImage: React.FC<FullscreenImageProps> = (props) => {
  const { id, onClose } = props;
  const [ url, setUrl ] = useState<string>();

  useEffect(() => {
    fetch(`/images/${id}`).then((res) => {
      return res.json();
    }).then((data) => {
      setUrl(data.url);
    });
  }, []);

  return (
    <div className="modal is-active" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div className="modal-background" onClick={onClose} />
      {(url) && (
        <img src={url} style={{ maxWidth: "90vw", maxHeight: "90vh", zIndex: 10 }} />
      )}
    </div>
  );
};

export default FullscreenImage;
