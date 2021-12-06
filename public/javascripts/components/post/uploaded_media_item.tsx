import * as React from "react";
import usePortal from "react-useportal";

import MediaPlayer from "../media_player";
import Image from "../image";
import File from "../file";
import DeleteIcon from "./delete_icon";
import ImageBlurryModal from "./image_blurry_modal";

interface UploadedMediaItemProps {
  id: string;
  type: string;
  onDelete: (id: string) => void;
}

const UploadedMediaItem: React.FC<UploadedMediaItemProps> = ({ id, type, onDelete }) => {
  const { ref, isOpen, openPortal, closePortal, Portal } = usePortal();

  const onBlurDetected = (isBlurry: boolean) => {
    console.log("image blurry:", isBlurry);

    if (isBlurry) {
      openPortal();
    }
  };

  const renderMediaItem = () => {
    if (type == "video") {
      return (
        <MediaPlayer id={id} />
      );
    } else if (type == "audio"){
      return (
        <MediaPlayer type="audio" id={id} />
      );
    } else if (type == "image" ){
      return (
        <Image id={id} onBlurDetected={onBlurDetected} />
      );
    } else {
      return (
        <File id={id} />
      );
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {renderMediaItem()}

      <div ref={ref}>
        <DeleteIcon onClick={() => onDelete(id)} />
      </div>

      {isOpen && (
        <Portal>
          <ImageBlurryModal
            onClose={closePortal}
            onDelete={() => onDelete(id)}
          />
        </Portal>
      )}
    </div>
  );
};

export default UploadedMediaItem;
