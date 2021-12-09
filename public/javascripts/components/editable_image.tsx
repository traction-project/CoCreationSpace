import * as React from "react";
import { useEffect, useRef } from "react";

interface EditableImageProps {
  imageUrl: string;
  dimensions: [number, number];
}

const EditableImage: React.FC<EditableImageProps> = ({ imageUrl, dimensions: [ width, height ] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const image = new Image();

    image.onload = () => {
      const context = canvasRef.current?.getContext("2d");

      if (context) {
        context.drawImage(image, 0, 0, width, height);
      }
    };

    image.src = imageUrl;
  }, []);

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
            width={width}
            height={height}
          />
        </div>
      </div>
    </div>
  );
};

export default EditableImage;
