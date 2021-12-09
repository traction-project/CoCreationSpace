import * as React from "react";
import { useRef } from "react";

interface EditableImageProps {
  image: HTMLImageElement
}

const EditableImage: React.FC<EditableImageProps> = ({ image }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const canvasLoaded = () => {
    console.log("canvas loaded");
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.drawImage(image, 0, 0);
  };

  const wrapperStyle: React.CSSProperties = {
    width: "100%",
    aspectRatio: "16/9"
  };

  const innerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  return (
    <div style={wrapperStyle}>
      <div style={{ width: "100%", backgroundColor: "#F9F9F9" }}>
        <div style={innerStyle}>
          <canvas
            ref={canvasRef}
            onLoad={canvasLoaded}
            width={image.width}
            height={image.height}
          />
        </div>
      </div>
    </div>
  );
};

export default EditableImage;
