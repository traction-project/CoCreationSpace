import * as React from "react";

import MediaPlayerWithChapters from "../media_player_with_chapters";
import Image from "../image";
import File from "../file";
import DeleteIcon from "./delete_icon";

interface UploadedMediaItemProps {
  id: string;
  type: string;
  onDelete: (id: string) => void;
}

const UploadedMediaItem: React.FC<UploadedMediaItemProps> = ({ id, type, onDelete }) => {
  const renderMediaItem = () => {
    if (type == "video") {
      return (
        <MediaPlayerWithChapters id={id} />
      );
    } else if (type == "audio"){
      return (
        <MediaPlayerWithChapters type="audio" id={id} />
      );
    } else if (type == "image" ){
      return (
        <Image id={id} onDelete={onDelete} isEditable={true} />
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
