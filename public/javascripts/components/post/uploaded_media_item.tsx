import * as React from "react";

import MediaPlayer from "../media_player";
import Image from "../image";
import File from "../file";

interface UploadedMediaItemProps {
  id: string;
  type: string;
}

const UploadedMediaItem: React.FC<UploadedMediaItemProps> = ({ id, type }) => {
  const onBlurDetected = (isBlurry: boolean) => {
    console.log("image blurry:", isBlurry);
  };

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

export default UploadedMediaItem;
