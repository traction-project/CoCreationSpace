import * as React from "react";

import MediaPlayer from "../media_player";
import Image from "../image";
import File from "../file";
import DeleteIcon from "./delete_icon";

interface UploadedMediaItemProps {
  id: string;
  type: string;
  onDelete: (id: string) => void;
}

const UploadedMediaItem: React.FC<UploadedMediaItemProps> = ({ id, type, onDelete }) => {
  const onBlurDetected = (isBlurry: boolean) => {
    console.log("image blurry:", isBlurry);
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

      <DeleteIcon onClick={() => onDelete(id)} />
    </div>
  );
};

export default UploadedMediaItem;
